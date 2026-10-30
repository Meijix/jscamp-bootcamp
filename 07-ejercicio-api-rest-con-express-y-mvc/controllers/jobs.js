/* =========================================================
   CONTROLLER (Controlador)
   =========================================================
   Es el intermediario entre las rutas y el modelo. Se encarga de:

     1. Sacar los datos de la petición (req)
     2. Pedirle al modelo que haga el trabajo
     3. Decidir el código de estado y responder (res)

   Regla de oro: aquí NO se filtra ni se busca nada a mano.
   De eso se encarga el modelo. Si ves un .filter() en un
   controlador, es que la lógica está en el sitio equivocado.
   ========================================================= */

import { JobModel } from '../models/jobs.js'
import { DEFAULTS } from '../config.js'

/*
  Los seis parámetros se esperan una sola vez.
  Express convierte un parámetro repetido (?text=a&text=b) en un ARRAY,
  y un array no tiene .toLowerCase(): el filtro reventaba con un
  TypeError y un 500.
*/
const PARAMS_DE_UNA_SOLA_VEZ = ['text', 'title', 'level', 'technology', 'limit', 'offset']

/*
  Convierte un query param numérico a entero mayor o igual a 0.
*/
const aEnteroNoNegativo = (valor, valorPorDefecto) => {
  if (valor === undefined || valor === '') return valorPorDefecto

  const numero = Number(valor)

  if (!Number.isInteger(numero) || numero < 0) return null

  return numero
}

export class JobController {
  /**
   * GET /jobs
   */
  static getAll(req, res) {
    /*
      Primero, que cada parámetro venga una sola vez.
      Si viene repetido, ni siquiera intento usarlo: 400 con el nombre
      del que está mal, así el cliente sabe qué corregir.
    */
    const repetidos = PARAMS_DE_UNA_SOLA_VEZ.filter((nombre) => Array.isArray(req.query[nombre]))

    if (repetidos.length > 0) {
      return res.status(400).json({
        error: `El parámetro "${repetidos.join(', ')}" viene repetido: mandá un solo valor`,
      })
    }

    /*
      req.query es un objeto con los parámetros de la URL.
      /jobs?text=react&limit=5  ->  { text: 'react', limit: '5' }
      Ojo: SIEMPRE llegan como texto, aunque parezcan números.
    */
    const { text, title, level, technology } = req.query

    /*
      Aquí es donde se usa el config.js:
      si el cliente no manda limit, uso el valor por defecto.

      Y aquí también se validan: NaN, negativos e Infinity no son
      "un límite raro", son un error del cliente y se responden 400.
    */
    const limit = aEnteroNoNegativo(req.query.limit, DEFAULTS.LIMIT_PAGINATION)
    const offset = aEnteroNoNegativo(req.query.offset, DEFAULTS.LIMIT_OFFSET)

    if (limit === null || offset === null) {
      const nombre = limit === null ? 'limit' : 'offset'

      return res.status(400).json({
        error: `El parámetro "${nombre}" debe ser un número entero mayor o igual a 0`,
      })
    }

    const resultado = JobModel.getAll({ text, title, level, technology, limit, offset })

    // res.json() ya pone la cabecera Content-Type y hace el stringify
    res.json(resultado)
  }

  /**
   * GET /jobs/:id
   */
  static getId(req, res) {
    /*
      req.params son las partes variables de la ruta.
      Como la ruta es '/:id', aquí llega { id: 'lo-que-sea' }.
    */
    const { id } = req.params
    const job = JobModel.getById(id)

    /*
      Si no existe, 404 (Not Found).
      Devolver 200 con un objeto vacío sería un error: el cliente
      no podría distinguir "no existe" de "existe pero está vacío".
    */
    if (!job) return res.status(404).json({ error: 'Job not found' })

    res.json(job)
  }

  /**
   * POST /jobs
   */
  static create(req, res) {
    /*
      req.body son los datos que manda el cliente en la petición.
      Para que esto no sea undefined hace falta el middleware
      express.json() en app.js (ver el comentario de allí).
    */
    const nuevoJob = JobModel.create(req.body)

    // 201 = Created. Es el código correcto al crear un recurso.
    res.status(201).json(nuevoJob)
  }

  /**
   * PUT /jobs/:id  -> reemplaza el job entero
   */
  static update(req, res) {
    const { id } = req.params
    const resultado = JobModel.update(id, req.body)

    // El modelo devuelve false cuando el id no existe
    if (!resultado) return res.status(404).json({ error: 'Job not found' })

    /*
      204 = No Content. Significa "todo bien, pero no te devuelvo nada".
      Es lo que esperan los tests del ejercicio 08.
      Con 204 hay que usar .send() sin argumentos: un 204 con body
      va en contra del estándar HTTP.
    */
    res.status(204).send()
  }

  /**
   * PATCH /jobs/:id  -> actualiza solo algunos campos
   */
  static partialUpdate(req, res) {
    const { id } = req.params
    const resultado = JobModel.partialUpdate(id, req.body)

    if (!resultado) return res.status(404).json({ error: 'Job not found' })

    res.status(204).send()
  }

  /**
   * DELETE /jobs/:id
   */
  static delete(req, res) {
    const { id } = req.params
    const resultado = JobModel.delete(id)

    if (!resultado) return res.status(404).json({ error: 'Job not found' })

    res.status(204).send()
  }
}
