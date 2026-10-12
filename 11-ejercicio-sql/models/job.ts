/* =========================================================
   TAREA 3: Migrar el modelo de JSON a SQL
   =========================================================
   Este es el momento en el que se ve para qué sirvió montar el
   patrón MVC: cambio ENTERO de dónde vienen los datos (de un
   archivo JSON a una base de datos SQLite) y NO he tocado ni una
   línea de los controladores ni de las rutas.

   Lo único que importa es respetar el mismo "contrato": las mismas
   funciones, recibiendo y devolviendo lo mismo.
   ========================================================= */

import crypto from 'node:crypto'

import { db } from '../db/database'
import type { Job, CreateJobDTO, UpdateJobDTO, JobFilters } from '../types'

/*
  La base de datos guarda los datos "planos" (una columna por campo),
  pero la API los devuelve anidados dentro de "data".
  Este tipo describe cómo viene una fila de la tabla jobs.
*/
type FilaJob = {
  id: string
  title: string
  company: string
  location: string
  description: string
  modality: 'remote' | 'onsite' | 'hybrid'
  level: 'junior' | 'mid' | 'senior'
}

type FilaContenido = {
  description: string
  responsibilities: string
  requirements: string
  about: string
}

/* ---------------------------------------------------------
   AYUDANTE: convertir una fila de SQL en un objeto Job
   ---------------------------------------------------------
   Como los datos están repartidos en tres tablas, hay que
   recomponerlos. Lo saco a una función porque lo necesitan
   getAll, getById y update.
   --------------------------------------------------------- */
function filaAJob(fila: FilaJob): Job {
  /*
    .all() devuelve TODAS las filas que coincidan, como un array.
    (.get() devolvería solo la primera.)

    Le digo a TypeScript qué forma tienen con <{ technology: string }[]>
    porque better-sqlite3 no puede saberlo solo: el SQL es texto.
  */
  const tecnologias = db
    .prepare('SELECT technology FROM job_technologies WHERE job_id = ?')
    .all(fila.id) as { technology: string }[]

  const contenido = db
    .prepare(
      'SELECT description, responsibilities, requirements, about FROM job_content WHERE job_id = ?'
    )
    .get(fila.id) as FilaContenido | undefined

  return {
    id: fila.id,
    title: fila.title,
    company: fila.company,
    location: fila.location,
    description: fila.description,
    data: {
      // Paso de [{technology:'react'}, ...] a ['react', ...]
      technology: tecnologias.map((t) => t.technology),
      modality: fila.modality,
      level: fila.level,
    },
    // Si el job no tiene contenido, dejo la propiedad fuera (es opcional)
    ...(contenido ? { content: contenido } : {}),
  }
}

export class JobModel {
  /**
   * Devuelve todos los jobs, aplicando los filtros que le pasen.
   */
  static async getAll(filters?: JobFilters): Promise<Job[]> {
    /*
      Construyo la consulta por partes.

      "WHERE 1 = 1" es un truco muy usado: es una condición que
      siempre se cumple, así que no cambia el resultado, pero me
      permite ir añadiendo " AND ..." sin tener que comprobar cada
      vez si soy el primer filtro o no. Sin él, tendría que llevar
      la cuenta para saber cuándo poner WHERE y cuándo AND.
    */
    let sql = 'SELECT * FROM jobs WHERE 1 = 1'

    // Los valores van aparte, en el mismo orden que los ?
    const valores: string[] = []

    if (filters?.modality) {
      sql += ' AND modality = ?'
      valores.push(filters.modality)
    }

    if (filters?.level) {
      sql += ' AND level = ?'
      valores.push(filters.level)
    }

    if (filters?.tech) {
      /*
        La tecnología está en OTRA tabla, así que uso una subconsulta:
        "quédate con los jobs cuyo id aparezca en la lista de job_id
        que tienen esta tecnología".

        También se podría hacer con un JOIN, pero entonces saldría
        una fila por cada tecnología y habría que quitar duplicados.
        Así se lee mejor.
      */
      sql += ' AND id IN (SELECT job_id FROM job_technologies WHERE technology = ?)'
      valores.push(filters.tech)
    }

    /*
      ⚠️ Fíjate en que NUNCA pego los valores dentro del texto del SQL.
      Esto estaría MAL:
          sql += ` AND level = '${filters.level}'`
      Sería una puerta abierta a la inyección SQL.

      Con los ? y los valores aparte, SQLite trata el valor siempre
      como un dato, jamás como código.
    */
    const filas = db.prepare(sql).all(...valores) as FilaJob[]

    return filas.map(filaAJob)
  }

  /**
   * Busca un job por su id.
   */
  static async getById(id: string): Promise<Job | undefined> {
    // .get() devuelve la primera fila, o undefined si no hay ninguna
    const fila = db.prepare('SELECT * FROM jobs WHERE id = ?').get(id) as FilaJob | undefined

    if (!fila) return undefined

    return filaAJob(fila)
  }

  /**
   * Crea un job nuevo.
   */
  static async create(input: CreateJobDTO): Promise<Job> {
    const id = crypto.randomUUID()

    /*
      Uso una transacción porque una creación toca TRES tablas.
      Si fallara al insertar las tecnologías, no quiero que se quede
      un job a medias en la base de datos: o entra todo, o nada.
    */
    const crearJob = db.transaction(() => {
      db.prepare(
        `INSERT INTO jobs (id, title, company, location, description, modality, level)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      ).run(
        id,
        input.title,
        input.company,
        input.location,
        input.description,
        input.data.modality,
        input.data.level
      )

      const insertarTecnologia = db.prepare(
        'INSERT INTO job_technologies (job_id, technology) VALUES (?, ?)'
      )

      for (const tecnologia of input.data.technology) {
        insertarTecnologia.run(id, tecnologia)
      }

      if (input.content) {
        db.prepare(
          `INSERT INTO job_content (id, job_id, description, responsibilities, requirements, about)
           VALUES (?, ?, ?, ?, ?, ?)`
        ).run(
          crypto.randomUUID(),
          id,
          input.content.description,
          input.content.responsibilities,
          input.content.requirements,
          input.content.about
        )
      }
    })

    crearJob()

    // Devuelvo el job leyéndolo de la base de datos, no montándolo
    // a mano: así me aseguro de devolver exactamente lo que se guardó
    return (await JobModel.getById(id)) as Job
  }

  /**
   * Actualiza parcialmente un job (PATCH).
   */
  static async update(id: string, input: UpdateJobDTO): Promise<Job | null> {
    const existe = db.prepare('SELECT id FROM jobs WHERE id = ?').get(id)
    if (!existe) return null

    const actualizar = db.transaction(() => {
      /*
        Como es un PATCH, solo actualizo los campos que me manden.
        Voy montando el SET pieza a pieza, igual que hice con el WHERE.
      */
      const campos: string[] = []
      const valores: string[] = []

      if (input.title !== undefined) {
        campos.push('title = ?')
        valores.push(input.title)
      }
      if (input.company !== undefined) {
        campos.push('company = ?')
        valores.push(input.company)
      }
      if (input.location !== undefined) {
        campos.push('location = ?')
        valores.push(input.location)
      }
      if (input.description !== undefined) {
        campos.push('description = ?')
        valores.push(input.description)
      }
      if (input.data?.modality !== undefined) {
        campos.push('modality = ?')
        valores.push(input.data.modality)
      }
      if (input.data?.level !== undefined) {
        campos.push('level = ?')
        valores.push(input.data.level)
      }

      /*
        Si no hay ningún campo que actualizar, NO lanzo el UPDATE.
        Un "UPDATE jobs SET WHERE id = ?" sin nada en medio es SQL
        inválido y daría error de sintaxis.
      */
      if (campos.length > 0) {
        const sql = `UPDATE jobs SET ${campos.join(', ')} WHERE id = ?`
        db.prepare(sql).run(...valores, id)
      }

      // Las tecnologías se reemplazan enteras: borro y vuelvo a insertar
      if (input.data?.technology) {
        db.prepare('DELETE FROM job_technologies WHERE job_id = ?').run(id)

        const insertarTecnologia = db.prepare(
          'INSERT INTO job_technologies (job_id, technology) VALUES (?, ?)'
        )

        for (const tecnologia of input.data.technology) {
          insertarTecnologia.run(id, tecnologia)
        }
      }

      if (input.content) {
        db.prepare('DELETE FROM job_content WHERE job_id = ?').run(id)
        db.prepare(
          `INSERT INTO job_content (id, job_id, description, responsibilities, requirements, about)
           VALUES (?, ?, ?, ?, ?, ?)`
        ).run(
          crypto.randomUUID(),
          id,
          input.content.description,
          input.content.responsibilities,
          input.content.requirements,
          input.content.about
        )
      }
    })

    actualizar()

    return (await JobModel.getById(id)) ?? null
  }

  /**
   * Elimina un job.
   */
  static async delete(id: string): Promise<boolean> {
    /*
      No hace falta borrar a mano las tecnologías ni el contenido:
      el ON DELETE CASCADE del seed se encarga solo.

      .run() devuelve información sobre lo que pasó. changes es el
      número de filas afectadas: si es 0, el id no existía.
    */
    const resultado = db.prepare('DELETE FROM jobs WHERE id = ?').run(id)

    return resultado.changes > 0
  }
}
