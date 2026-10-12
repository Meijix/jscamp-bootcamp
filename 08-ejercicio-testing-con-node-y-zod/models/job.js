import jobs from '../jobs.json' with {type: 'json'}

export class JobModel {
  static async getAll({ text, technology, type, level, limit, offset }) {

    const filteredJobs = jobs.filter(job => {

      /*
        BUG QUE ENCONTRÉ AL ESCRIBIR LOS TESTS:
        antes esto era `const normalizeTech = () => text.toLowerCase()`,
        es decir, una FUNCIÓN. Y luego se pasaba a .includes(normalizeTech),
        que buscaba la función dentro del texto. Nunca coincidía nada,
        así que el filtro ?text= siempre devolvía una lista vacía.

        La solución es guardar el VALOR, no la función.
      */
      const normalizedText = text ? text.toLowerCase() : ''

      const matchText = text
        ? job.titulo.toLowerCase().includes(normalizedText)
        || job.descripcion.toLowerCase().includes(normalizedText)
        : true

      const matchTech = technology ? (job.data.technology.includes(technology)) : true
      const matchType = type ? (job.data.modalidad === type) : true
      const matchLevel = level ? (job.data.nivel === level) : true

      return matchText && matchTech && matchType && matchLevel
    })

    const limitNumber = Number(limit)
    const offsetNumber = Number(offset)

    /*
      Guardo el total ANTES de cortar la página.
      Antes el controlador devolvía total: paginatedJobs.length, que
      es el tamaño de la página (como mucho 10), no el total de
      resultados. Con ese dato el cliente no puede calcular cuántas
      páginas hay, así que la paginación no funcionaba.
    */
    const total = filteredJobs.length

    const paginatedJobs = filteredJobs.slice(offsetNumber, offsetNumber + limitNumber)

    return { paginatedJobs, total, limitNumber, offsetNumber }
  }

  static async getId(id) {

    const job = jobs.find(job => job.id === id)

    const output = {
      status: 200,
      job: job
    }

    if (!output.job) {
      output.status = 404
      output.job = { error: 'Job Not Found' }
    }

    return output
  }

  static async create({ titulo, empresa, ubicacion, descripcion, data }) {

    const output = {
      status: 201,
      newJob: {
        id: crypto.randomUUID(),
        titulo,
        empresa,
        ubicacion,
        descripcion,
        data
      }
    }

    jobs.push(output.newJob)

    return output
  }

  static async update({ id, sentJob }) {

    const output = {
      status: 204,
      error: null
    }

    const errorStatus = 404
    const errorMessage = 'Target Job Not Found'

    if (!id) {
      output.status = errorStatus
      output.error = errorMessage

      return output
    }

    const jobIndex = jobs.findIndex(job => job.id === id)

    if (jobIndex === -1) {
      output.status = errorStatus
      output.error = errorMessage

      return output
    }

    jobs[jobIndex] = { ...sentJob, id }

    return output
  }

  static async partialUpdate({ id, sentJob }) {

    const { titulo = null, empresa = null, ubicacion = null, descripcion = null, data = null } = sentJob

    const output = {
      status: 204,
      error: null
    }

    const errorStatus = 404
    const errorMessage = 'Target Job Not Found'

    if (!id) {
      output.status = errorStatus
      output.error = errorMessage

      return output
    }

    const jobIndex = jobs.findIndex(job => job.id === id)

    if (jobIndex === -1) {
      output.status = errorStatus
      output.error = errorMessage

      return output
    }

    const job = jobs[jobIndex]

    job.titulo = titulo ?? job.titulo
    job.empresa = empresa ?? job.empresa
    job.ubicacion = ubicacion ?? job.ubicacion
    job.descripcion = descripcion ?? job.descripcion
    job.data = data ?? job.data

    return output
  }

  static async delete(id) {

    const output = {
      status: 204,
      error: null
    }

    const errorStatus = 404
    const errorMessage = 'Target Job Not Found'

    if (!id) {
      output.status = errorStatus
      output.error = errorMessage

      return output
    }

    const jobIndex = jobs.findIndex(job => job.id === id)

    if (jobIndex === -1) {
      output.status = errorStatus
      output.error = errorMessage

      return output
    }

    jobs.splice(jobIndex, 1)

    return output
  }
}
