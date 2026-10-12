/* =========================================================
   EJERCICIO 4: Funciones tipadas
   =========================================================
   En una función hay que tipar DOS cosas:
     - los parámetros que entran
     - el valor que sale (el tipo de retorno)

   Aquí el tipo de retorno lo escribo explícitamente aunque
   TypeScript sabría deducirlo solo. Lo hago a propósito: si un día
   me equivoco dentro de la función y devuelvo otra cosa, el error
   salta AQUÍ, en la propia función, y no 10 archivos más allá donde
   se usa. Es mucho más fácil de encontrar.
   ========================================================= */

import type { Job } from './objects.ts'
import type { ExperienceLevel, Technology } from './types.ts'

/**
 * Filtra empleos por nivel de experiencia.
 */
export function filterByExperience(jobs: Job[], level: ExperienceLevel): Job[] {
  return jobs.filter((job) => job.experienceLevel === level)
}

/**
 * Filtra empleos por tecnología.
 */
export function filterByTechnology(jobs: Job[], tech: Technology): Job[] {
  /*
    Ojo con el .toLowerCase(): devuelve un string genérico, no un
    Technology. Como .includes() de un Technology[] espera un
    Technology, TypeScript se quejaría.

    Por eso hago la comparación al revés: paso a minúsculas y comparo
    contra cada elemento del array. Es igual de correcto y no hace
    falta ningún "as" para engañar al compilador.
    (Y "engañar al compilador" casi siempre acaba en bug.)
  */
  const tecnologiaEnMinusculas = tech.toLowerCase()

  return jobs.filter((job) =>
    job.technologies.some((tecnologia) => tecnologia.toLowerCase() === tecnologiaEnMinusculas)
  )
}

/**
 * Filtra empleos con un salario mínimo.
 */
export function filterByMinSalary(jobs: Job[], minSalary: number): Job[] {
  /*
    La comprobación "job.salary !== undefined" no es opcional:
    como salary es opcional, TypeScript NO me deja compararlo con
    >= sin asegurarme antes de que existe. Aquí el compilador te
    está evitando un bug de verdad.
  */
  return jobs.filter((job) => job.salary !== undefined && job.salary >= minSalary)
}

/**
 * Busca empleos por texto, en el título o en la descripción.
 */
export function searchJobs(jobs: Job[], searchTerm: string): Job[] {
  const term = searchTerm.toLowerCase()

  return jobs.filter(
    (job) => job.title.toLowerCase().includes(term) || job.description.toLowerCase().includes(term)
  )
}
