/* =========================================================
   EJERCICIO 6: Interfaces
   =========================================================
   Una interface describe la forma que debe tener un objeto,
   igual que un "type". ¿Cuál usar?

     - "type"      -> más flexible (uniones, tuplas, tipos calculados)
     - "interface" -> pensada para objetos y clases; se puede EXTENDER
                      con "extends" y se lee como un contrato

   Aquí uso interface porque es exactamente eso: un contrato.
   "Cualquier cosa que quiera ser un JobSearchService tiene que
   tener estas cuatro funciones, con estos parámetros exactos."
   ========================================================= */

import {
  filterByExperience,
  filterByMinSalary,
  filterByTechnology,
  searchJobs,
} from './functions.ts'

import type { Job } from './objects.ts'
import type { ApplicationStatus, ExperienceLevel, Technology } from './types.ts'

/**
 * Contrato del servicio de búsqueda.
 */
export interface JobSearchService {
  /*
    Así se escribe una función dentro de una interface:
      nombre(parametros): tipoDeRetorno

    Las firmas tienen que coincidir con las funciones reales de
    functions.ts. Si mañana cambio una de ellas (por ejemplo, si
    filterByExperience pasa a recibir un array de niveles),
    TypeScript me avisará aquí de que el contrato ya no se cumple.
    Eso es justo lo que quiero de una interface.
  */
  searchJobs(jobs: Job[], searchTerm: string): Job[]
  filterByExperience(jobs: Job[], level: ExperienceLevel): Job[]
  filterByTechnology(jobs: Job[], tech: Technology): Job[]
  filterByMinSalary(jobs: Job[], minSalary: number): Job[]
}

/*
  Al escribir ": JobSearchService" le pido a TypeScript que
  COMPRUEBE que este objeto cumple el contrato.

  Si me olvidara de una función, o si una tuviera los parámetros
  cambiados, el error saltaría en esta línea.
*/
export const searchService: JobSearchService = {
  searchJobs,
  filterByExperience,
  filterByMinSalary,
  filterByTechnology,
}

/**
 * Una candidatura de una persona a un empleo.
 */
export interface JobApplication {
  id: string
  jobId: string // referencia al empleo
  candidateId: string // referencia al candidato
  status: ApplicationStatus // el tipo literal del ejercicio 1
  appliedDate: Date
  coverLetter?: string // la carta de presentación es opcional
}

/**
 * Un empleo con información ampliada.
 */
/*
  "extends Job" hereda TODAS las propiedades de Job (id, title,
  company, salary, technologies...) y encima añade las tres de abajo.

  Es mucho mejor que copiar y pegar las propiedades de Job aquí:
  si mañana añado un campo a Job, DetailedJob lo hereda solo.

  (Ojo: Job es un "type" y aquí lo extiendo con "interface".
  Se puede: una interface puede extender un type de objeto sin problema.)
*/
export interface DetailedJob extends Job {
  benefits: string[]
  requirements: string[]
  applicationDeadline?: Date
}
