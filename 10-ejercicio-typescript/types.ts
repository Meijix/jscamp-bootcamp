/* =========================================================
   EJERCICIO 1: Tipos primitivos y literales
   =========================================================
   Un TIPO LITERAL es un tipo cuyo valor solo puede ser uno de
   los que yo escriba, ni uno más.

     let nivel: string           -> vale cualquier texto, hasta "patata"
     let nivel: ExperienceLevel  -> solo 'junior' | 'mid' | 'senior' | 'lead'

   La barra | es una UNIÓN y se lee como "o".

   ¿Qué gano con esto? Que el error salta MIENTRAS ESCRIBO, no
   cuando el usuario usa la app. Si me equivoco y pongo 'Junior'
   con mayúscula, el editor me lo subraya al momento.
   Además el autocompletado me sugiere los valores válidos.
   ========================================================= */

// Nivel de experiencia que pide un empleo
export type ExperienceLevel = 'junior' | 'mid' | 'senior' | 'lead'

// Modalidad de trabajo
export type WorkMode = 'remoto' | 'presencial' | 'hibrido'

// Estado en el que puede estar una candidatura
export type ApplicationStatus = 'pending' | 'reviewing' | 'accepted' | 'rejected'

/*
  Tecnologías conocidas.

  ⚠️ Nota: además de las del enunciado he añadido 'tailwind' y 'css'
  al final. Motivo: los datos de arrays.ts las usan
  (technologies: ['react', 'typescript', 'tailwind'] y skills con 'css').
  Sin añadirlas, TypeScript daría error al tipar esos arrays como
  Job[] y Candidate[], que es justo lo que pide el ejercicio 3.

  Es un ejemplo real de para qué sirven los tipos: al escribirlos,
  he descubierto una incoherencia entre el enunciado y los datos.
*/
export type Technology =
  | 'react'
  | 'node'
  | 'python'
  | 'java'
  | 'javascript'
  | 'typescript'
  | 'flutter'
  | 'android'
  | 'ios'
  | 'swift'
  | 'kotlin'
  | 'dart'
  | 'go'
  | 'rust'
  | 'php'
  | 'ruby'
  | 'c#'
  | 'tailwind'
  | 'css'
