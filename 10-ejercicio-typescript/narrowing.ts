/* =========================================================
   EJERCICIO 7: Type Narrowing
   =========================================================
   "Narrowing" = estrechar un tipo.

   Cuando una variable puede ser de varios tipos (por ejemplo
   number | undefined), TypeScript no te deja usarla sin más.
   Tienes que "estrecharla" comprobándola con un if, y a partir de
   ahí el compilador ya sabe con qué está tratando.
   ========================================================= */

import type { Candidate, Job } from './objects.ts'

/**
 * ¿Este candidato cumple los requisitos del empleo?
 */
export function isQualified(candidate: Candidate, job: Job): boolean {
  /*
    ⚠️ AQUÍ ESTABAN LOS ERRORES QUE PEDÍA CORREGIR EL ENUNCIADO.

    El código original comparaba con 'junlor', 'mib' y 'seni0r':
    tres erratas. En JavaScript normal eso NO da ningún error: las
    comparaciones simplemente son false siempre y la función devuelve
    resultados mal, sin avisar. Un bug silencioso y muy difícil de pillar.

    En TypeScript, como experienceLevel es un tipo literal
    ('junior' | 'mid' | 'senior' | 'lead'), el compilador sabe que
    'junlor' no puede ser nunca uno de esos valores y te lo marca
    en rojo al momento.

    ESTE es el mejor ejemplo de para qué sirven los tipos literales.
  */
  const requiredYears =
    job.experienceLevel === 'junior'
      ? 0
      : job.experienceLevel === 'mid'
        ? 2
        : job.experienceLevel === 'senior'
          ? 5
          : 8 // el que queda es 'lead'

  if (candidate.experienceYears < requiredYears) {
    return false
  }

  /*
    .some() devuelve true si AL MENOS UNO cumple la condición.
    Fíjate en que ya no hace falta poner (tech: any): TypeScript
    sabe que job.technologies es Technology[], así que deduce solo
    que tech es Technology.
  */
  const hasRequiredSkill = job.technologies.some((tech) => candidate.skills.includes(tech))

  return hasRequiredSkill
}

/**
 * Formatea un salario para mostrarlo por pantalla.
 */
/*
  El tipo del parámetro es "number | undefined" a propósito: quiero
  poder llamar a esta función con job.salary, que es opcional.
*/
export function formatSalary(salary: number | undefined): string {
  /*
    Este if es el NARROWING en acción.

    - Antes del if: salary es number | undefined
    - Dentro del if: TypeScript sabe que es undefined
    - Después del if: sabe que es number, sin ninguna duda

    Por eso en la línea de abajo me deja llamar a .toLocaleString()
    sin quejarse. Si borrara este if, daría error: "el objeto puede
    ser undefined".
  */
  if (salary === undefined) {
    return 'Salario no especificado'
  }

  // toLocaleString pone los separadores de miles: 45000 -> "45.000"
  return `€${salary.toLocaleString()}`
}

/**
 * Comprueba si un email tiene pinta de ser válido.
 */
export function isValidEmail(email: string): boolean {
  /*
    Una expresión regular. Traducida:
      ^[^\s@]+  -> al principio, uno o más caracteres que NO sean
                   espacio ni arroba
      @         -> una arroba
      [^\s@]+   -> el dominio
      \.        -> un punto (escapado, porque el punto suelto
                   significa "cualquier carácter")
      [^\s@]+$  -> la extensión, hasta el final
  */
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}
