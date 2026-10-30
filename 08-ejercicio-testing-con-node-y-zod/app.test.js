/* =========================================================
   TAREA 2: Tests de integración
   =========================================================
   Se ejecutan con:  node --test
   (o con npm test, que ya lo tengo configurado en package.json)

   Son tests de INTEGRACIÓN: levanto el servidor de verdad y le
   hago peticiones HTTP reales, igual que haría un cliente.
   No simulo (mockeo) nada. Así compruebo que las rutas, los
   middlewares, la validación y el modelo funcionan JUNTOS.
   ========================================================= */

import test, { after, before, describe } from 'node:test'
import assert from 'node:assert'

import app from './app.js'

/*
  Uso un puerto distinto al de desarrollo (5432).
  Si usara el mismo y tuviera el servidor arrancado en otra terminal,
  los tests fallarían con EADDRINUSE ("puerto ocupado").
*/
const PORT = 5678
const BASE_URL = `http://localhost:${PORT}`

// Guardo aquí el servidor para poder cerrarlo al final
let server

/*
  before() se ejecuta UNA VEZ antes de todos los tests.
  Levanto el servidor aquí y no dentro de cada test porque
  arrancarlo 20 veces sería lentísimo.

  Lo envuelvo en una promesa porque listen() es asíncrono: sin el
  await, los tests empezarían a lanzar peticiones antes de que el
  servidor estuviera escuchando y fallarían de forma aleatoria
  (los peores bugs de todos: los que fallan a veces).
*/
before(async () => {
  await new Promise((resolve) => {
    server = app.listen(PORT, resolve)
  })
})

/*
  after() se ejecuta al terminar todos los tests.
  Si no cerrara el servidor, el proceso de Node se quedaría vivo
  para siempre y el comando `node --test` nunca terminaría.
*/
after(async () => {
  await new Promise((resolve) => server.close(resolve))
})

/* ---------------------------------------------------------
   AYUDANTE: crear un job de prueba
   ---------------------------------------------------------
   Lo uso en los tests de PUT, PATCH y DELETE.

   ¿Por qué crear uno nuevo en vez de usar un id del jobs.json?
   Porque el enunciado insiste en que los tests deben ser
   INDEPENDIENTES. Si el test de DELETE borrara un job del JSON y
   el de PATCH intentara modificar ese mismo, el segundo fallaría
   dependiendo del orden de ejecución.

   Creando cada uno el suyo, ningún test puede estropear a otro.
   --------------------------------------------------------- */
async function crearJobDePrueba(extra = {}) {
  const response = await fetch(`${BASE_URL}/jobs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      titulo: 'Job de prueba',
      empresa: 'Testing SL',
      ubicacion: 'Remoto',
      descripcion: 'Un job creado por los tests',
      data: { technology: ['javascript'], modalidad: 'remoto', nivel: 'junior' },
      ...extra,
    }),
  })

  return response.json()
}

/* =========================================================
   GET /jobs
   ========================================================= */
describe('GET /jobs', () => {
  test('debe responder con 200 y un array de trabajos', async () => {
    const response = await fetch(`${BASE_URL}/jobs`)
    const json = await response.json()

    // strictEqual compara con === (sin conversiones raras de tipo)
    assert.strictEqual(response.status, 200)

    // Array.isArray es la única forma fiable de saber si algo es un array
    // (typeof [] devuelve 'object', que no ayuda nada)
    assert.ok(Array.isArray(json.data), 'json.data debería ser un array')
  })

  test('debe filtrar trabajos por tecnología', async () => {
    const response = await fetch(`${BASE_URL}/jobs?technology=react`)
    const json = await response.json()

    assert.strictEqual(response.status, 200)

    // Me aseguro de que el filtro devuelve algo; si no, el test de
    // abajo pasaría con un array vacío sin comprobar nada de verdad
    assert.ok(json.data.length > 0, 'debería devolver al menos un job con react')

    /*
      .every() devuelve true solo si TODOS los elementos cumplen
      la condición. Es justo lo que quiero comprobar: que no se
      haya colado ningún job sin react.
    */
    const todosTienenReact = json.data.every((job) => job.data.technology.includes('react'))
    assert.ok(todosTienenReact, 'todos los jobs deberían incluir react')
  })

  test('debe respetar el límite de resultados', async () => {
    const response = await fetch(`${BASE_URL}/jobs?limit=2`)
    const json = await response.json()

    assert.strictEqual(json.limit, 2)
    assert.strictEqual(json.data.length, 2)
  })

  test('debe aplicar el offset correctamente', async () => {
    /*
      offset=1 significa "sáltate el primero".
      Así que el primer resultado debe ser el SEGUNDO job del JSON.
    */
    const response = await fetch(`${BASE_URL}/jobs?offset=1`)
    const json = await response.json()

    assert.strictEqual(json.offset, 1)
    assert.strictEqual(json.data[0].id, 'd35b2c89-5d60-4f26-b19a-6cfb2f1a0f57')
  })

  /*
    Muy buen trabajo: quise agregar otros tests
    para que el ejercicio sea más completo.
  */
  test('debe filtrar por texto en el título o la descripción', async () => {
    const response = await fetch(`${BASE_URL}/jobs?text=devops`)
    const json = await response.json()

    assert.strictEqual(response.status, 200)

    /*
      Compruebo que devuelve algo, no solo el status: un filtro roto
      también responde 200, con data vacía.
    */
    assert.ok(json.data.length > 0, 'debería encontrar al menos un job con "devops"')

    const todosCoinciden = json.data.every((job) =>
      `${job.titulo} ${job.descripcion ?? ''}`.toLowerCase().includes('devops')
    )
    assert.ok(todosCoinciden, 'todos los jobs deberían contener el texto buscado')
  })

  test('el total es el total de resultados, no el tamaño de la página', async () => {
    const pagina = await fetch(`${BASE_URL}/jobs?limit=2`)
    const jsonPagina = await pagina.json()

    const completo = await fetch(`${BASE_URL}/jobs?limit=0`)
    const jsonCompleto = await completo.json()

    assert.strictEqual(jsonPagina.data.length, 2)
    assert.strictEqual(jsonPagina.total, jsonCompleto.total)
    assert.ok(jsonPagina.total > jsonPagina.data.length, 'el total debería ser mayor que la página')
  })
})

/* =========================================================
   POST /jobs
   ========================================================= */
describe('POST /jobs', () => {
  test('el nuevo trabajo se añade correctamente con buen formato', async () => {
    const nuevoJob = {
      titulo: 'Ingeniero DevOps',
      empresa: 'CloudTech',
      ubicacion: 'Remoto',
      descripcion: 'Buscamos un ingeniero DevOps con experiencia en contenedores.',
      data: { technology: ['docker', 'kubernetes'], modalidad: 'remoto', nivel: 'senior' },
    }

    const response = await fetch(`${BASE_URL}/jobs`, {
      method: 'POST',
      /*
        Esta cabecera es obligatoria: sin ella, express.json() no
        reconoce el body y req.body llega vacío.
      */
      headers: { 'Content-Type': 'application/json' },
      // El body de fetch tiene que ser texto, por eso el stringify
      body: JSON.stringify(nuevoJob),
    })

    const json = await response.json()

    // 201 = Created
    assert.strictEqual(response.status, 201)

    // El id lo genera el servidor, así que solo compruebo que existe
    assert.ok(json.id, 'el job creado debería tener un id')

    // Y que los datos que mandé se han guardado tal cual
    assert.strictEqual(json.titulo, nuevoJob.titulo)
    assert.strictEqual(json.empresa, nuevoJob.empresa)
    assert.strictEqual(json.ubicacion, nuevoJob.ubicacion)
  })

  /* -------------------------------------------------------
     Los 5 casos de validación que pide el enunciado.
     ------------------------------------------------------- */

  test('debe devolver 400 si el título tiene menos de 3 caracteres', async () => {
    const response = await fetch(`${BASE_URL}/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titulo: 'ab', empresa: 'Test', ubicacion: 'Remoto' }),
    })

    // 400 = Bad Request: "lo que me has mandado está mal"
    assert.strictEqual(response.status, 400)
  })

  test('debe devolver 400 si el título tiene más de 100 caracteres', async () => {
    /*
      'a'.repeat(101) crea un texto de 101 letras.
      Mucho más cómodo (y menos propenso a errores) que escribirlo.
    */
    const response = await fetch(`${BASE_URL}/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titulo: 'a'.repeat(101), empresa: 'Test', ubicacion: 'Remoto' }),
    })

    assert.strictEqual(response.status, 400)
  })

  test('debe devolver 400 si falta el título', async () => {
    const response = await fetch(`${BASE_URL}/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ empresa: 'Test', ubicacion: 'Remoto' }),
    })

    assert.strictEqual(response.status, 400)
  })

  test('debe devolver 400 si el título no es un string', async () => {
    const response = await fetch(`${BASE_URL}/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titulo: 12345, empresa: 'Test', ubicacion: 'Remoto' }),
    })

    assert.strictEqual(response.status, 400)
  })

  test('debe devolver 201 aunque no venga la descripción (es opcional)', async () => {
    const response = await fetch(`${BASE_URL}/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        titulo: 'Job sin descripción',
        empresa: 'Test',
        ubicacion: 'Remoto',
      }),
    })

    // Este test es el "caso positivo": comprueba que no soy demasiado
    // estricto y rechazo cosas que sí son válidas
    assert.strictEqual(response.status, 201)
  })
})

/* =========================================================
   GET /jobs/:id
   ========================================================= */
describe('GET /jobs/:id', () => {
  test('debe devolver el trabajo con el ID especificado', async () => {
    const id = 'd35b2c89-5d60-4f26-b19a-6cfb2f1a0f57'

    const response = await fetch(`${BASE_URL}/jobs/${id}`)
    const json = await response.json()

    assert.strictEqual(response.status, 200)
    assert.strictEqual(json.id, id)
  })

  test('debe devolver 404 cuando el ID no existe', async () => {
    const response = await fetch(`${BASE_URL}/jobs/id-que-no-existe`)
    const json = await response.json()

    assert.strictEqual(response.status, 404)

    // Además del status, compruebo que explica el problema
    assert.ok(json.error, 'la respuesta debería incluir un campo error')
  })
})

/* =========================================================
   PUT /jobs/:id
   ========================================================= */
describe('PUT /jobs/:id', () => {
  test('debe recibir 204 y actualizar el trabajo', async () => {
    // Creo mi propio job para no depender de los demás tests
    const jobCreado = await crearJobDePrueba({ titulo: 'Job para el PUT' })

    const jobActualizado = {
      titulo: 'Título completamente nuevo',
      empresa: 'Empresa nueva',
      ubicacion: 'Madrid',
      descripcion: 'Descripción nueva',
      data: { technology: ['python'], modalidad: 'madrid', nivel: 'mid' },
    }

    const response = await fetch(`${BASE_URL}/jobs/${jobCreado.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jobActualizado),
    })

    /*
      204 = No Content: "hecho, pero no te devuelvo nada".
      Por eso NO hago response.json() aquí: no hay body que leer
      y daría error al intentar parsearlo.
    */
    assert.strictEqual(response.status, 204)

    /*
      Y ahora la parte importante: comprobar que el cambio se guardó
      DE VERDAD. Un test que solo mira el status code puede pasar
      aunque la actualización no haya hecho nada.
    */
    const comprobacion = await fetch(`${BASE_URL}/jobs/${jobCreado.id}`)
    const json = await comprobacion.json()

    assert.strictEqual(json.titulo, jobActualizado.titulo)
    assert.strictEqual(json.empresa, jobActualizado.empresa)
    assert.strictEqual(json.ubicacion, jobActualizado.ubicacion)
  })

  test('debe devolver 404 cuando el ID no existe', async () => {
    const response = await fetch(`${BASE_URL}/jobs/id-que-no-existe`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titulo: 'Da igual', empresa: 'Test', ubicacion: 'Remoto' }),
    })

    assert.strictEqual(response.status, 404)
  })
})

/* =========================================================
   PATCH /jobs/:id
   ========================================================= */
describe('PATCH /jobs/:id', () => {
  test('debe recibir 204 y actualizar SOLO los campos enviados', async () => {
    const jobCreado = await crearJobDePrueba({
      titulo: 'Job para el PATCH',
      empresa: 'Empresa original',
    })

    // Mando solo dos campos, a propósito
    const response = await fetch(`${BASE_URL}/jobs/${jobCreado.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titulo: 'Título parcheado', ubicacion: 'Barcelona' }),
    })

    assert.strictEqual(response.status, 204)

    const comprobacion = await fetch(`${BASE_URL}/jobs/${jobCreado.id}`)
    const json = await comprobacion.json()

    // Lo que mandé, cambiado
    assert.strictEqual(json.titulo, 'Título parcheado')
    assert.strictEqual(json.ubicacion, 'Barcelona')

    /*
      Y esta es LA comprobación clave del PATCH: lo que NO mandé
      tiene que seguir igual. Sin este assert, un PATCH mal hecho
      (que borrara los demás campos) pasaría el test igualmente.
    */
    assert.strictEqual(json.empresa, 'Empresa original')
  })

  test('debe devolver 404 cuando el ID no existe', async () => {
    const response = await fetch(`${BASE_URL}/jobs/id-que-no-existe`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titulo: 'Da igual' }),
    })

    assert.strictEqual(response.status, 404)
  })
})

/* =========================================================
   DELETE /jobs/:id
   ========================================================= */
describe('DELETE /jobs/:id', () => {
  test('debe recibir 204 y eliminar el trabajo', async () => {
    const jobCreado = await crearJobDePrueba({ titulo: 'Job para borrar' })

    const response = await fetch(`${BASE_URL}/jobs/${jobCreado.id}`, { method: 'DELETE' })
    assert.strictEqual(response.status, 204)

    // Compruebo que ya no está: pedirlo debe dar 404
    const comprobacion = await fetch(`${BASE_URL}/jobs/${jobCreado.id}`)
    assert.strictEqual(comprobacion.status, 404)
  })

  test('debe devolver 404 cuando el ID no existe', async () => {
    const response = await fetch(`${BASE_URL}/jobs/id-que-no-existe`, { method: 'DELETE' })
    assert.strictEqual(response.status, 404)
  })
})
