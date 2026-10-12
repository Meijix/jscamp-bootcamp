/* =========================================================
   TAREA 1: Schema de validación con Zod
   =========================================================
   ¿Por qué validar? Porque el cliente puede mandar CUALQUIER cosa:
   un título vacío, la edad como texto, campos que no existen...
   Si no validamos, esos datos basura entran en la base de datos y
   el problema aparece mucho más tarde, en otro sitio, sin pistas.

   Zod nos deja describir la forma que deben tener los datos y él
   se encarga de comprobarlo.
   ========================================================= */

import z from 'zod'

/*
  Schema del objeto "data" (la parte de metadatos del job).
  Lo defino aparte para que el schema principal se lea mejor.
*/
const dataSchema = z.object({
  /*
    z.array(z.string()) = "un array cuyos elementos son todos texto".
    .default([]) -> si no viene, Zod lo rellena con un array vacío
    en vez de dejarlo undefined. Así el resto del código no tiene
    que preguntarse si existe o no.
  */
  technology: z.array(z.string()).default([]),

  // .optional() = puede no venir, y no pasa nada
  modalidad: z.string().optional(),
  nivel: z.string().optional(),
})

/*
  Schema del contenido largo (descripción en markdown, requisitos...).
  Todo opcional porque no todos los jobs lo traen.
*/
const contentSchema = z.object({
  description: z.string().optional(),
  responsibilities: z.string().optional(),
  requirements: z.string().optional(),
  about: z.string().optional(),
})

/*
  EL SCHEMA PRINCIPAL.
  Se lee casi como el enunciado del ejercicio.
*/
const jobSchema = z.object({
  /*
    Encadenar reglas: tiene que ser texto Y tener entre 3 y 100
    caracteres. El segundo parámetro es el mensaje de error, para
    que quien use la API entienda qué ha hecho mal.

    Fíjate en que con esto cubro de golpe los 4 casos que pide
    el ejercicio:
      - menos de 3 caracteres  -> falla el .min(3)
      - más de 100             -> falla el .max(100)
      - sin titulo             -> falla porque no es opcional
      - titulo que no es texto -> falla el z.string()
  */
  titulo: z
    .string({ message: 'El título debe ser un texto' })
    .min(3, 'El título debe tener al menos 3 caracteres')
    .max(100, 'El título no puede superar los 100 caracteres'),

  // Campos obligatorios
  empresa: z.string().min(1, 'La empresa es obligatoria'),
  ubicacion: z.string().min(1, 'La ubicación es obligatoria'),

  // Campos opcionales
  descripcion: z.string().optional(),
  data: dataSchema.optional(),
  content: contentSchema.optional(),
})

/**
 * Valida un job COMPLETO. Se usa en POST y PUT.
 */
export function validateJob(input) {
  /*
    ¿safeParse o parse?

    - .parse()     -> si falla, LANZA una excepción (hay que hacer try/catch)
    - .safeParse() -> nunca lanza; devuelve un objeto:
                        { success: true,  data: {...} }        si va bien
                        { success: false, error: {...} }       si va mal

    Uso safeParse porque en un servidor quiero controlar yo el error
    y responder un 400 bonito, no que se caiga la petición entera.
  */
  return jobSchema.safeParse(input)
}

/**
 * Valida un job PARCIAL. Se usa en PATCH.
 */
export function validatePartialJob(input) {
  /*
    .partial() convierte TODAS las propiedades en opcionales de golpe,
    pero mantiene el resto de reglas.

    Es justo lo que necesita un PATCH: si mandas solo el título, no
    tiene sentido exigir la empresa; pero si mandas un título, sigue
    teniendo que medir entre 3 y 100 caracteres.
  */
  return jobSchema.partial().safeParse(input)
}
