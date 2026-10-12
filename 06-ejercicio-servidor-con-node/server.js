/* =========================================================
   API de usuarios con Node.js "a pelo" (sin Express)
   =========================================================
   Endpoints:
     GET  /users   -> lista con filtros (name, limit, offset, minAge, maxAge)
     POST /users   -> crear usuario
     GET  /health  -> estado del servidor
     resto         -> 404
   ========================================================= */

import { createServer } from 'node:http'
import { randomUUID } from 'node:crypto'

/*
  loadEnvFile() lee el archivo .env y mete sus variables en
  process.env. Antes hacía falta instalar el paquete "dotenv";
  desde Node 20.6 viene incluido.

  Lo envuelvo en try/catch porque si NO existe el archivo .env
  lanza un error y el servidor no arrancaría. Y el .env es opcional.
*/
try {
  process.loadEnvFile()
} catch {
  // No hay .env: no pasa nada, uso los valores por defecto
}

/*
  Las variables de entorno SIEMPRE son texto.
  El "|| 3000" cubre el caso de que PORT no esté definida.
*/
const port = process.env.PORT || 3000

/* =========================================================
   "Base de datos" en memoria
   =========================================================
   Es un array normal, así que los datos se pierden al reiniciar
   el servidor. Para aprender está bien; en real iría a una base
   de datos de verdad (lo veremos en el ejercicio 11).
   ========================================================= */
const users = [
  { id: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', name: 'Miguel', age: 28 },
  { id: 'f6e5d4c3-b2a1-4f5e-6d7c-8b9a0e1f2a3b', name: 'Mateo', age: 34 },
  { id: '9a8b7c6d-5e4f-4a3b-2c1d-0e9f8a7b6c5d', name: 'Pablo', age: 22 },
  { id: '3c4d5e6f-7a8b-4c9d-0e1f-2a3b4c5d6e7f', name: 'Lucía', age: 31 },
  { id: '7b8c9d0e-1f2a-4b3c-4d5e-6f7a8b9c0d1e', name: 'Ana', age: 26 },
  { id: '5d6e7f8a-9b0c-4d1e-2f3a-4b5c6d7e8f9a', name: 'Juan', age: 29 },
  { id: '2a3b4c5d-6e7f-4a8b-9c0d-1e2f3a4b5c6d', name: 'Sofía', age: 25 },
  { id: '8f9a0b1c-2d3e-4f5a-6b7c-8d9e0f1a2b3c', name: 'Carlos', age: 37 },
  { id: '4c5d6e7f-8a9b-4c0d-1e2f-3a4b5c6d7e8f', name: 'Elena', age: 23 },
  { id: '0e1f2a3b-4c5d-4e6f-7a8b-9c0d1e2f3a4b', name: 'Diego', age: 30 },
]

/* =========================================================
   AYUDANTE 1: leer el body de una petición
   =========================================================
   Esto es lo más "incómodo" de trabajar sin Express.

   El body NO llega de golpe: llega a trozos (chunks), como el agua
   por una manguera. Node nos avisa con eventos:
     'data'  -> ha llegado un trozo
     'end'   -> ya no hay más trozos
     'error' -> algo se ha roto por el camino

   Envuelvo todo en una promesa para poder usar await y que se lea
   como código normal de arriba a abajo.
   ========================================================= */
function json(req) {
  return new Promise((resolve, reject) => {
    let body = ''

    // Voy pegando cada trozo al string
    req.on('data', (chunk) => {
      body += chunk.toString()
    })

    // Cuando ya no llegan más trozos, intento convertirlo a objeto
    req.on('end', () => {
      try {
        /*
          Si el body viene vacío, JSON.parse('') lanza error.
          Por eso devuelvo un objeto vacío en ese caso.
        */
        resolve(body ? JSON.parse(body) : {})
      } catch {
        reject(new Error('El body no es un JSON válido'))
      }
    })

    req.on('error', reject)
  })
}

/* =========================================================
   AYUDANTE 2: enviar una respuesta JSON
   =========================================================
   Estas 3 líneas se repetirían en cada endpoint. Sacarlas a una
   función evita copiar y pegar (y olvidarse de la cabecera, que
   es el error más típico).
   ========================================================= */
function enviarJSON(res, statusCode, datos) {
  /*
    writeHead escribe el código de estado y las cabeceras.
    El Content-Type es OBLIGATORIO: sin él, el navegador se cree
    que le mandas texto plano y no te lo interpreta como JSON.
    El charset=utf-8 es para que las tildes no salgan raras.
  */
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' })

  /*
    res.end() cierra la respuesta y la envía.
    JSON.stringify convierte el objeto/array de JS en texto,
    porque por la red solo se puede mandar texto.
  */
  res.end(JSON.stringify(datos))
}

/* =========================================================
   EL SERVIDOR
   =========================================================
   La función se ejecuta UNA VEZ POR CADA petición que llega.
     req = lo que pide el cliente
     res = lo que le respondemos
   ========================================================= */
const server = createServer(async (req, res) => {
  /*
    req.url viene con la query pegada: "/users?name=ana&limit=2".
    Para separarlo uso la clase URL, que ya sabe hacerlo.

    El segundo parámetro ('http://localhost') es la "base": la clase
    URL necesita una URL completa para funcionar y req.url solo
    trae la parte de la ruta. Ese dominio es de mentira, da igual
    cuál sea porque solo uso pathname y searchParams.
  */
  const url = new URL(req.url, `http://localhost:${port}`)
  const pathname = url.pathname // "/users"
  const query = url.searchParams // los ?parametros

  /* -------------------------------------------------------
     EJERCICIO 3: Health check
     -------------------------------------------------------
     Lo pongo el primero porque es el más simple.
     Sirve para que un sistema de monitorización pregunte cada
     pocos segundos "¿sigues vivo?" sin tocar la base de datos.
     ------------------------------------------------------- */
  if (req.method === 'GET' && pathname === '/health') {
    return enviarJSON(res, 200, {
      status: 'ok',
      // uptime() = segundos que lleva encendido el proceso
      uptime: process.uptime(),
    })
  }

  /* -------------------------------------------------------
     EJERCICIOS 1 y 5: GET /users con filtros
     ------------------------------------------------------- */
  if (req.method === 'GET' && pathname === '/users') {
    /*
      Empiezo con una COPIA del array original ([...users]).
      Si trabajara sobre "users" directamente, un .sort() o un
      .splice() estropearía la lista original para siempre.
    */
    let resultado = [...users]

    // --- Filtro por nombre ---
    const name = query.get('name')
    if (name) {
      /*
        toLowerCase() en los dos lados para que la búsqueda no
        distinga mayúsculas: "MIGUEL" encuentra a "Miguel".
        includes() busca coincidencias parciales: "ig" también vale.
      */
      resultado = resultado.filter((user) => user.name.toLowerCase().includes(name.toLowerCase()))
    }

    // --- Filtro por edad mínima ---
    const minAge = query.get('minAge')
    if (minAge) {
      /*
        Number() convierte el texto "25" en el número 25.
        Sin esto compararía texto con número y daría resultados raros
        (en JS, '9' > '10' es true porque compara letra a letra).
      */
      resultado = resultado.filter((user) => user.age >= Number(minAge))
    }

    // --- Filtro por edad máxima ---
    const maxAge = query.get('maxAge')
    if (maxAge) {
      resultado = resultado.filter((user) => user.age <= Number(maxAge))
    }

    /*
      --- Paginación ---
      La hago LA ÚLTIMA a propósito: primero filtro y luego corto.
      Si cortara antes, estaría paginando sobre la lista sin filtrar
      y saldrían resultados incorrectos.
    */
    const limit = query.get('limit')
    const offset = query.get('offset')

    if (limit || offset) {
      // Si solo me dan uno de los dos, pongo un valor sensato para el otro
      const desde = Number(offset) || 0
      const cuantos = Number(limit) || resultado.length

      // slice(desde, hasta) -> corta un trozo sin tocar el original
      resultado = resultado.slice(desde, desde + cuantos)
    }

    return enviarJSON(res, 200, resultado)
  }

  /* -------------------------------------------------------
     EJERCICIO 2: POST /users
     ------------------------------------------------------- */
  if (req.method === 'POST' && pathname === '/users') {
    try {
      // await porque leer el body lleva su tiempo (llega a trozos)
      const body = await json(req)

      /*
        Validación básica: nunca te fíes de lo que manda el cliente.
        Sin esto se podrían crear usuarios sin nombre o con la edad
        puesta como texto.
      */
      if (!body.name || typeof body.name !== 'string') {
        return enviarJSON(res, 400, { error: 'El campo "name" es obligatorio y debe ser texto' })
      }

      if (typeof body.age !== 'number') {
        return enviarJSON(res, 400, { error: 'El campo "age" es obligatorio y debe ser un número' })
      }

      const nuevoUsuario = {
        // randomUUID genera un id único tipo 'a1b2c3d4-e5f6-...'
        id: randomUUID(),
        name: body.name,
        age: body.age,
      }

      users.push(nuevoUsuario)

      // 201 = "Created". Es el código correcto al crear algo (no el 200)
      return enviarJSON(res, 201, nuevoUsuario)
    } catch (error) {
      // Aquí caemos si el JSON venía mal escrito
      return enviarJSON(res, 400, { error: error.message })
    }
  }

  /* -------------------------------------------------------
     EJERCICIO 4: rutas no encontradas
     -------------------------------------------------------
     Si la petición ha llegado hasta aquí es que no coincidió con
     ningún if anterior. Este bloque tiene que ir EL ÚLTIMO:
     si estuviera arriba, respondería 404 a todo.
     ------------------------------------------------------- */
  return enviarJSON(res, 404, { error: 'Ruta no encontrada' })
})

server.listen(port, () => {
  const address = server.address()
  console.log(`Servidor escuchando en http://localhost:${address.port}`)
})
