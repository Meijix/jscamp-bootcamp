/* =========================================================
   EJERCICIO 5: Parámetros opcionales y valores por defecto
   ========================================================= */

import {
  searchJobs,
  filterByExperience,
  filterByTechnology,
  filterByMinSalary,
} from './functions.ts'

import type { Job } from './objects.ts'
import type { ExperienceLevel, Technology, WorkMode } from './types.ts'

/*
  Tipo para las opciones de búsqueda.
  TODAS las propiedades llevan "?" porque el usuario puede filtrar
  solo por lo que le interese: a lo mejor solo por texto, o solo
  por salario, o por todo a la vez.

  Le pongo nombre al tipo (en vez de escribirlo dentro del paréntesis
  de la función) por dos razones: la firma de la función se lee mucho
  mejor, y puedo exportarlo para reutilizarlo en otro sitio.
*/
export type SearchOptions = {
  text?: string
  level?: ExperienceLevel
  technology?: Technology
  minSalary?: number
  workMode?: WorkMode
}

/**
 * Búsqueda avanzada: aplica solo los filtros que se le pasen.
 */
export function advancedSearch(jobs: Job[], options: SearchOptions): Job[] {
  /*
    Uso "let" porque la variable se va reasignando en cada filtro.
    Cada .filter() devuelve un array NUEVO, así que el array original
    (jobs) no se toca en ningún momento.
  */
  let results = jobs

  /*
    Cada if hace dos cosas a la vez:
      1. Comprueba si el filtro se ha pedido
      2. "Estrecha" el tipo (type narrowing): dentro del if,
         TypeScript ya sabe que options.text es string y no
         string | undefined, así que me deja pasárselo a searchJobs.
  */
  if (options.text) {
    results = searchJobs(results, options.text)
  }

  if (options.level) {
    results = filterByExperience(results, options.level)
  }

  if (options.technology) {
    results = filterByTechnology(results, options.technology)
  }

  if (options.minSalary) {
    results = filterByMinSalary(results, options.minSalary)
  }

  if (options.workMode) {
    results = results.filter((job) => job.workMode === options.workMode)
  }

  return results
}

/**
 * Devuelve los empleos publicados en los últimos X días.
 */
/*
  "days: number = 30" es un VALOR POR DEFECTO.

  Es distinto de "days?: number":
    days?: number       -> dentro de la función es number | undefined
                           y hay que comprobarlo antes de usarlo
    days: number = 30   -> dentro de la función SIEMPRE es number,
                           porque si no viene se pone 30

  Además, al haber un valor por defecto, el parámetro ya es opcional
  al llamar a la función: getRecentJobs(jobs) funciona igual de bien.
*/
export function getRecentJobs(jobs: Job[], days: number = 30): Job[] {
  // new Date() sin argumentos = ahora mismo
  const cutoffDate = new Date()

  // setDate con un número negativo resta días (y ajusta mes y año solo)
  cutoffDate.setDate(cutoffDate.getDate() - days)

  return jobs.filter((job) => job.postedDate >= cutoffDate)
}
