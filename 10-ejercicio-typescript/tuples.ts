/* =========================================================
   EJERCICIO 9: Tuplas
   =========================================================
   Una TUPLA es un array con un número FIJO de elementos y un tipo
   concreto en cada posición.

     number[]           -> [1, 2, 3, 4, 5...] cualquier cantidad
     [number, number]   -> exactamente DOS números, ni uno más

   ¿Cuándo usarla? Cuando el ORDEN significa algo:
   [latitud, longitud], [mínimo, máximo], [valor, setValue]...
   (El useState de React devuelve justo una tupla.)
   ========================================================= */

import type { Job } from './objects.ts'

/*
  Coordenadas de una ubicación.
  El comentario de al lado no es decoración: en una tupla las
  posiciones no tienen nombre, así que hay que documentar qué es cada una.
*/
export type Coordinates = [number, number] // [latitud, longitud]

// Rango salarial
export type SalaryRange = [number, number] // [mínimo, máximo]

/**
 * Calcula el salario mínimo y máximo de una lista de empleos.
 */
export function getSalaryRange(jobs: Job[]): SalaryRange {
  /*
    El enunciado pedía quitar el "as any" que había aquí.

    El problema: job.salary es "number | undefined" (es opcional), así
    que .map() me da un array de tipo (number | undefined)[], y
    Math.min no acepta undefined.

    La solución elegante es un TYPE PREDICATE (predicado de tipo):

        (salary): salary is number => salary !== undefined

    El "salary is number" le dice a TypeScript: "si esta función
    devuelve true, puedes dar por seguro que el valor es un number".
    Con eso, el .filter() ya no devuelve (number | undefined)[]
    sino number[], que es justo lo que necesito.

    Es mucho mejor que un "as number": el "as" solo hace callar al
    compilador, mientras que aquí la comprobación se hace de verdad
    en tiempo de ejecución.
  */
  const salaries: number[] = jobs
    .map((job) => job.salary)
    .filter((salary): salary is number => salary !== undefined)

  // Sin salarios, Math.min(...[]) devolvería Infinity. Lo evito.
  if (salaries.length === 0) {
    return [0, 0]
  }

  /*
    Los tres puntos (spread) convierten el array en argumentos sueltos:
      Math.min(...[40000, 45000, 55000])  ->  Math.min(40000, 45000, 55000)
    Math.min no acepta arrays, por eso hace falta.
  */
  const min = Math.min(...salaries)
  const max = Math.max(...salaries)

  /*
    Devuelvo [min, max] y TypeScript comprueba que encaja con
    SalaryRange: dos números y en ese orden. Si devolviera tres
    valores, o los devolviera al revés en cuanto a tipos, avisaría.
  */
  return [min, max]
}
