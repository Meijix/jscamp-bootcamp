/* =========================================================
   EJERCICIO 2: Tipos de objeto
   =========================================================
   Aquí describo la "forma" que debe tener cada objeto de la app.
   ========================================================= */

/*
  Fíjate en el "import type".

  Le dice a TypeScript: "esto solo lo importo para los tipos, no
  para ejecutarlo". Al compilar, la línea desaparece del JavaScript
  final. Es más eficiente y deja claro que no hay código detrás.
*/
import type { ExperienceLevel, WorkMode, Technology } from './types.ts'

export type Job = {
  id: string
  title: string
  company: string
  location: string
  description: string

  /*
    El "?" hace la propiedad OPCIONAL.
    salary?: number significa que su tipo es number | undefined:
    puede venir o no venir.

    Por eso más adelante, antes de usar salary, hay que comprobar
    que existe. TypeScript te obliga y así te ahorra el clásico
    "Cannot read property of undefined".
  */
  salary?: number

  /*
    Technology[] = "un array cuyos elementos son todos Technology".
    Así no se puede colar un string cualquiera dentro del array.
  */
  technologies: Technology[]

  experienceLevel: ExperienceLevel
  workMode: WorkMode
  isActive: boolean

  // Date es un tipo que ya trae JavaScript (fechas)
  postedDate: Date
}

export type Company = {
  id: string
  name: string
  description: string
  website?: string // opcional: hay empresas sin web
  employees: number
  foundedYear: number
}

export type Candidate = {
  id: string
  name: string
  email: string
  phone?: string // opcional: no todos dejan el teléfono
  skills: Technology[]
  experienceYears: number
  resume?: string // opcional: el CV en PDF puede no estar subido
}
