/* =========================================================
   EJERCICIO 10: Utility Types
   =========================================================
   Los "utility types" son tipos que vienen incluidos en TypeScript
   y que fabrican tipos nuevos a partir de otros.

   Son la forma de NO repetirte: en vez de escribir a mano un tipo
   parecido a Job pero con todo opcional, le pido a TypeScript que
   me lo genere. Y si mañana cambio Job, todos se actualizan solos.
   ========================================================= */

import type { Job } from './objects.ts'

/**
 * Actualiza un empleo con los campos que le pases.
 */
/*
  Partial<Job> convierte TODAS las propiedades de Job en opcionales.

  Es exactamente lo que necesita una función de actualizar: quiero
  poder llamarla así...
      updateJob(job, { salary: 50000 })
  ...sin tener que repetir el resto de campos. Pero si escribo mal
  el nombre de un campo (salaryy), TypeScript me avisa igual, porque
  Partial hace las propiedades opcionales, no permite inventárselas.
*/
export function updateJob(job: Job, updates: Partial<Job>): Job {
  /*
    { ...job, ...updates }
    Copia todo lo de job y luego encima lo de updates.
    Como updates va el segundo, sus propiedades ganan.
    Y como creo un objeto NUEVO, el original no se modifica.
  */
  return { ...job, ...updates }
}

/*
  Pick<Job, 'id' | 'title' | 'company' | 'location'> significa
  "coge de Job SOLO estas cuatro propiedades".

  Escrito a mano sería:
      { id: string; title: string; company: string; location: string }

  Con Pick es más corto y, sobre todo, queda ATADO a Job: si un día
  el id pasa a ser number, JobSummary se entera solo.
*/
export type JobSummary = Pick<Job, 'id' | 'title' | 'company' | 'location'>

/**
 * Devuelve una versión resumida de cada empleo.
 */
export function getJobSummaries(jobs: Job[]): JobSummary[] {
  return jobs.map((job) => ({
    id: job.id,
    title: job.title,
    company: job.company,
    location: job.location,
  }))
}

/*
  Readonly<Job> pone todas las propiedades como "solo lectura":
  se pueden leer, pero no modificar.

  Es la forma de decir en el propio tipo "esta función NO va a tocar
  el objeto que le pasas". Y no es una promesa de palabra: el
  compilador lo hace cumplir.
*/
export type ReadonlyJob = Readonly<Job>

/**
 * Muestra un empleo por consola. No lo modifica.
 */
export function displayJob(job: ReadonlyJob): void {
  console.log(`${job.title} - ${job.company}`)

  /*
    ⚠️ AQUÍ HABÍA OTRO ERROR A PROPÓSITO.

    El código original tenía esta línea justo después:

        job.title = 'Nuevo título'

    Con Readonly<Job>, TypeScript la rechaza:
      "Cannot assign to 'title' because it is a read-only property"

    Y hace bien: una función que se llama "display" (mostrar) NO
    debería modificar nada. Modificar por sorpresa los objetos que
    recibes es una de las causas más típicas de bugs raros.

    Por eso he borrado la línea en lugar de quitar el Readonly:
    el error estaba en el código, no en el tipo.
  */
}
