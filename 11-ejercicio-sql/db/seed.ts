/* =========================================================
   TAREA 2: Crear el esquema e insertar los datos
   =========================================================
   Se ejecuta con:  npm run seed

   Un "seed" (semilla) es un script que deja la base de datos lista
   para trabajar: crea las tablas y mete unos datos iniciales.
   ========================================================= */

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import crypto from 'node:crypto'

import { db } from './database'

/* =========================================================
   PASO 1: crear las tablas
   =========================================================
   db.exec() ejecuta varias sentencias SQL de una vez.
   Uso comillas invertidas (``) para escribir el SQL en varias
   líneas, que se lee mucho mejor.
   ========================================================= */

db.exec(`
  -- ¿Por qué "IF NOT EXISTS"?
  -- Porque si no, ejecutar el seed dos veces daría error
  -- ("table jobs already exists") y el script se pararía.

  CREATE TABLE IF NOT EXISTS jobs (
    -- PRIMARY KEY: identifica cada fila de forma única.
    -- SQLite crea un índice automáticamente, así que buscar por id
    -- es instantáneo aunque haya millones de filas.
    id          TEXT PRIMARY KEY,

    -- NOT NULL: este campo no puede quedarse vacío.
    -- Es la base de datos la que se encarga de que no entren
    -- datos incompletos, aunque el código tenga un bug.
    title       TEXT NOT NULL,
    company     TEXT NOT NULL,
    location    TEXT NOT NULL,
    description TEXT NOT NULL,

    -- CHECK limita los valores permitidos, como un tipo literal
    -- de TypeScript pero dentro de la propia base de datos.
    -- Si alguien intenta guardar modality = 'teletrabajo', se rechaza.
    modality    TEXT NOT NULL CHECK (modality IN ('remote', 'onsite', 'hybrid')),
    level       TEXT NOT NULL CHECK (level IN ('junior', 'mid', 'senior'))
  );

  -- Un job puede tener VARIAS tecnologías.
  -- En SQL no existen los arrays, así que la forma correcta de
  -- representar un "uno a muchos" es una tabla aparte con una fila
  -- por cada tecnología.
  CREATE TABLE IF NOT EXISTS job_technologies (
    -- FOREIGN KEY: este valor tiene que existir en jobs(id).
    -- Es lo que evita tener tecnologías apuntando a la nada.
    job_id     TEXT NOT NULL,
    technology TEXT NOT NULL,

    -- ON DELETE CASCADE: al borrar un job, se borran solas todas
    -- sus tecnologías. Sin esto habría que acordarse de borrarlas
    -- a mano, y tarde o temprano se olvida.
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
  );

  -- El contenido largo va en su propia tabla.
  -- Ventaja: al listar los jobs no arrastramos textos enormes
  -- que casi nunca se usan en el listado.
  CREATE TABLE IF NOT EXISTS job_content (
    id               TEXT PRIMARY KEY,
    job_id           TEXT NOT NULL,
    description      TEXT NOT NULL,
    responsibilities TEXT NOT NULL,
    requirements     TEXT NOT NULL,
    about            TEXT NOT NULL,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
  );
`)

console.log('✅ Tablas creadas (o ya existían)')

/* =========================================================
   PASO 2: leer los datos del JSON
   ========================================================= */

/*
  Leo el archivo y lo convierto a objeto.
  Lo hago con readFileSync en vez de con un import porque así no
  dependo de la configuración de módulos ni de los "import attributes".
*/
const rutaJson = join(import.meta.dirname, '..', 'jobs.json')

// Describo la forma que tiene el JSON para que TypeScript me ayude
type JobDelJson = {
  id: string
  title: string
  company: string
  location: string
  description: string
  modality: 'remote' | 'onsite' | 'hybrid'
  level: 'junior' | 'mid' | 'senior'
  technologies: string[]
  content?: {
    description: string
    responsibilities: string
    requirements: string
    about: string
  }
}

const jobs: JobDelJson[] = JSON.parse(readFileSync(rutaJson, 'utf-8'))

/* =========================================================
   PASO 3: preparar las sentencias
   =========================================================
   db.prepare() "compila" una sentencia SQL una sola vez y devuelve
   un objeto reutilizable. Ejecutarla 10 veces con .run() es mucho
   más rápido que mandar 10 sentencias sueltas.

   Los ? son PLACEHOLDERS: los valores van aparte, no pegados al
   texto del SQL. Eso es lo que evita la inyección SQL, el ataque
   clásico en el que alguien mete "'; DROP TABLE jobs; --" en un
   campo de texto y te borra la base de datos.
   ========================================================= */

const insertarJob = db.prepare(`
  INSERT OR REPLACE INTO jobs (id, title, company, location, description, modality, level)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`)

const insertarTecnologia = db.prepare(`
  INSERT INTO job_technologies (job_id, technology) VALUES (?, ?)
`)

const insertarContenido = db.prepare(`
  INSERT INTO job_content (id, job_id, description, responsibilities, requirements, about)
  VALUES (?, ?, ?, ?, ?, ?)
`)

/*
  Estos dos DELETE son para que el seed se pueda ejecutar VARIAS
  VECES sin duplicar filas.

  En la tabla jobs no hace falta porque su id es PRIMARY KEY y uso
  INSERT OR REPLACE. Pero job_technologies y job_content pueden tener
  varias filas por job, así que si no borro primero, cada ejecución
  del seed añadiría las tecnologías otra vez encima de las anteriores.
*/
const borrarTecnologias = db.prepare('DELETE FROM job_technologies WHERE job_id = ?')
const borrarContenido = db.prepare('DELETE FROM job_content WHERE job_id = ?')

/* =========================================================
   PASO 4: insertar todo dentro de una TRANSACCIÓN
   =========================================================
   Una transacción agrupa varias operaciones en una sola: o se
   hacen TODAS, o no se hace NINGUNA.

   Sin transacción, si fallara al insertar el job número 7, los 6
   primeros ya estarían guardados y la base de datos quedaría a
   medias. Con transacción, si algo falla, SQLite lo deshace todo.

   Y de regalo, es MUCHÍSIMO más rápido: sin ella, SQLite guardaría
   en disco después de cada INSERT.
   ========================================================= */

const insertarTodos = db.transaction((listaDeJobs: JobDelJson[]) => {
  for (const job of listaDeJobs) {
    // 1. El job en sí
    insertarJob.run(
      job.id,
      job.title,
      job.company,
      job.location,
      job.description,
      job.modality,
      job.level
    )

    // 2. Sus tecnologías (una fila por cada una)
    borrarTecnologias.run(job.id)
    for (const tecnologia of job.technologies) {
      insertarTecnologia.run(job.id, tecnologia)
    }

    // 3. Su contenido largo, si lo tiene
    borrarContenido.run(job.id)
    if (job.content) {
      insertarContenido.run(
        crypto.randomUUID(),
        job.id,
        job.content.description,
        job.content.responsibilities,
        job.content.requirements,
        job.content.about
      )
    }
  }
})

// La transacción no se ejecuta hasta que la llamo
insertarTodos(jobs)

console.log(`✅ ${jobs.length} jobs insertados en la base de datos`)

/*
  Cierro la conexión: si no, el proceso se quedaría abierto y el
  comando npm run seed no terminaría nunca.
*/
db.close()
