/* =========================================================
   MODEL (Modelo)
   =========================================================
   La capa de DATOS. Su única responsabilidad es guardar, buscar,
   modificar y borrar jobs.

   Regla de oro del MVC: aquí NO puede aparecer ni "req" ni "res".
   El modelo no sabe nada de HTTP, ni de códigos de estado, ni de
   Express. Solo entiende de datos.

   ¿Para qué sirve esa separación? Para que en el ejercicio 11
   podamos cambiar el JSON por una base de datos SQL tocando SOLO
   este archivo. Los controladores y las rutas se quedan igual.
   ========================================================= */

/*
  "with { type: 'json' }" es la forma moderna de importar un JSON
  en Node con módulos ES. Sin esa parte, Node no sabe cómo tratar
  el archivo y da error.
*/
import jobs from '../jobs.json' with { type: 'json' }
import { randomUUID } from 'node:crypto'

/*
  Lee un campo de texto de un job sin confiar en que exista.

  Por qué este helper? Porque a la lista se le puede colar un job sin
  título.
*/
const textoDe = (valor) => String(valor ?? '').toLowerCase()

/*
  Uso una clase con métodos ESTÁTICOS (static).

  "static" significa que el método pertenece a la CLASE, no a un
  objeto creado con new. Se llama así:
      JobModel.getAll()          ✅
      new JobModel().getAll()    ❌ innecesario

  Tiene sentido porque el modelo no guarda estado propio: es solo
  un grupo de funciones relacionadas bajo un mismo nombre.
*/
export class JobModel {
  /**
   * Devuelve todos los jobs aplicando los filtros que le pasen.
   * Todos los parámetros son opcionales.
   */
  static getAll({ text, title, level, technology, limit, offset }) {
    /*
      Copio el array con [...jobs] para no modificar el original.
      Es la misma precaución de siempre: si luego alguien hiciera
      un .sort(), estropearía los datos para todas las peticiones
      siguientes.
    */
    let resultado = [...jobs]

    // --- Filtro por título ---
    if (title) {
      /*
        Antes era job.titulo.toLowerCase(). Si un solo job de la lista no
        tenía título, esta línea lanzaba TypeError y el 500 dejaba la
        búsqueda rota para todos los demás jobs también.
      */
      resultado = resultado.filter((job) => textoDe(job.titulo).includes(title.toLowerCase()))
    }

    // --- Búsqueda libre: mira en el título Y en la descripción ---
    if (text) {
      const texto = text.toLowerCase()
      resultado = resultado.filter(
        (job) => textoDe(job.titulo).includes(texto) || textoDe(job.descripcion).includes(texto)
      )
    }

    // --- Filtro por nivel de experiencia ---
    if (level) {
      /*
        El "?." (optional chaining) evita que reviente si algún job
        no tuviera la propiedad "data". Sin él, un solo job mal
        formado tumbaría toda la petición.
      */
      resultado = resultado.filter((job) => job.data?.nivel === level)
    }

    // --- Filtro por tecnología ---
    if (technology) {
      /*
        data.technology es un ARRAY (["react", "node"]), así que
        uso .includes() del array para ver si contiene esa tecnología.
      */
      resultado = resultado.filter((job) => job.data?.technology?.includes(technology))
    }

    /*
      IMPORTANTE: guardo el total ANTES de paginar.
      El cliente necesita saber cuántos resultados hay en total para
      poder pintar la paginación. Si lo contara después, siempre
      me daría como mucho 10.
    */
    const total = resultado.length

    // --- Paginación (siempre la última) ---
    const desde = Number(offset)
    const cuantos = Number(limit)
    const pagina = resultado.slice(desde, desde + cuantos)

    // Devuelvo un objeto con los datos + la info de paginación
    return { data: pagina, total, limit: cuantos, offset: desde }
  }

  /**
   * Busca un job por su id. Devuelve undefined si no lo encuentra.
   */
  static getById(id) {
    /*
      .find() devuelve el PRIMER elemento que cumpla la condición,
      o undefined si no hay ninguno.
      (.filter() devolvería un array, que aquí no me sirve.)
    */
    return jobs.find((job) => job.id === id)
  }

  /**
   * Crea un job nuevo y lo añade a la lista.
   */
  static create(input) {
    const nuevoJob = {
      /*
        El spread (...) copia todas las propiedades de input.

        Va PRIMERO y el id DESPUÉS a propósito: en un objeto, si una
        propiedad se repite gana la última. Así, aunque el cliente
        intente colarme su propio "id" en el body, el mío lo pisa.
        El id lo genera siempre el servidor, nunca el cliente.
      */
      ...input,
      id: randomUUID(),
    }

    jobs.push(nuevoJob)
    return nuevoJob
  }

  /**
   * Reemplaza un job entero (PUT).
   * Devuelve false si el id no existe.
   */
  static update(id, input) {
    /*
      findIndex devuelve la POSICIÓN en el array, o -1 si no existe.
      Necesito la posición (y no el objeto) para poder sustituirlo.
    */
    const indice = jobs.findIndex((job) => job.id === id)
    if (indice === -1) return false

    /*
      PUT significa "reemplaza el recurso completo".
      Así que construyo un objeto nuevo con lo que me mandan,
      conservando solo el id (que nunca cambia).
    */
    const actualizado = { ...input, id }
    jobs[indice] = actualizado

    return actualizado
  }

  /**
   * Actualiza solo algunos campos (PATCH).
   */
  static partialUpdate(id, input) {
    const indice = jobs.findIndex((job) => job.id === id)
    if (indice === -1) return false

    /*
      Aquí está la diferencia con update():
      primero extiendo lo que YA había y luego encima lo nuevo.

      { ...viejo, ...nuevo } -> las propiedades de "nuevo" pisan las
      de "viejo", pero las que no vengan en "nuevo" se conservan.
      Eso es exactamente lo que significa PATCH.
    */
    const actualizado = { ...jobs[indice], ...input, id }
    jobs[indice] = actualizado

    return actualizado
  }

  /**
   * Elimina un job. Devuelve false si no existe.
   */
  static delete(id) {
    const indice = jobs.findIndex((job) => job.id === id)
    if (indice === -1) return false

    /*
      splice(posicion, cuantos) borra elementos del array original
      y devuelve un array con los borrados.
      El [0] saca el job borrado de ese array.
    */
    const [eliminado] = jobs.splice(indice, 1)
    return eliminado
  }
}
