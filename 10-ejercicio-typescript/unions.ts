/* =========================================================
   EJERCICIO 8: Union Types y Type Narrowing avanzado
   ========================================================= */

import { searchJobs } from './functions.ts'
import type { Job } from './objects.ts'

/*
  Esto es una UNIÓN DISCRIMINADA (discriminated union), y es uno de
  los patrones más útiles de TypeScript.

  La clave está en la propiedad "success", que es un tipo literal
  (true en un caso, false en el otro). A esa propiedad se le llama
  el "discriminante": es la que permite distinguir un caso del otro.

  ¿Por qué es tan buena idea?
  Porque hace IMPOSIBLE representar un estado incoherente. No puedes
  crear un resultado con success: false y jobs a la vez: TypeScript
  no te deja. El propio tipo impide el error.
*/
export type SearchResult =
  | { success: true; jobs: Job[]; count: number }
  | { success: false; error: string }

/**
 * Busca empleos y devuelve un resultado que puede ser éxito o error.
 */
export function safeSearch(jobs: Job[], searchTerm: string): SearchResult {
  // .trim() quita los espacios: así " " tampoco cuenta como búsqueda válida
  if (!searchTerm || searchTerm.trim().length === 0) {
    return {
      success: false,
      error: 'El término de búsqueda no puede estar vacío',
    }
  }

  const results = searchJobs(jobs, searchTerm)

  return {
    success: true,
    jobs: results,
    count: results.length,
  }
}

/**
 * Muestra los resultados por consola.
 */
export function displaySearchResults(result: SearchResult): void {
  /*
    ⚠️ AQUÍ ESTABA EL ERROR QUE PEDÍA ENCONTRAR EL ENUNCIADO.

    El código original ponía "if (result.succes)", sin la segunda "s".
    En JavaScript normal, result.succes es undefined -> siempre falso
    -> SIEMPRE entraría por el else e imprimiría "Error: undefined",
    incluso cuando la búsqueda hubiera ido bien. Y sin ningún aviso.

    TypeScript lo detecta al momento: la propiedad "succes" no existe
    en el tipo SearchResult.
  */
  if (result.success) {
    /*
      Y aquí se ve la magia del narrowing con uniones discriminadas:
      dentro de este if, TypeScript SABE que result es la primera
      variante, así que me deja usar result.count y result.jobs.

      Si intentara usar result.error aquí, daría error. Y al revés
      en el else. El compilador te guía para que no te equivoques.
    */
    console.log(`Encontrados ${result.count} empleos:`)

    // No hace falta tipar job: TypeScript sabe que result.jobs es Job[]
    result.jobs.forEach((job) => {
      console.log(`- ${job.title} en ${job.company}`)
    })
  } else {
    // Y aquí sabe que es la segunda variante, con su .error
    console.error(`Error: ${result.error}`)
  }
}
