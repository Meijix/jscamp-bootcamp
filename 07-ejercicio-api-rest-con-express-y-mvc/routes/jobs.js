/* =========================================================
   ROUTES (Rutas)
   =========================================================
   La capa más fina de las tres: solo dice qué método + qué ruta
   van con qué función del controlador. Nada más.

   Fíjate en lo bien que se lee: en 6 líneas se entiende toda la
   API. Ese es el objetivo del patrón MVC.
   ========================================================= */

import { Router } from 'express'
import { JobController } from '../controllers/jobs.js'

/*
  Router() crea un "mini servidor" independiente que luego engancho
  en app.js con app.use('/jobs', jobsRouter).

  Gracias a eso, aquí las rutas se escriben SIN el prefijo /jobs:
    '/'     -> en realidad es /jobs
    '/:id'  -> en realidad es /jobs/:id

  Si mañana quiero mover todo a /api/jobs, solo cambio app.js.
*/
export const jobsRouter = Router()

/*
  Fíjate en que paso la función SIN paréntesis:
    JobController.getAll     ✅ le doy la función a Express
    JobController.getAll()   ❌ la ejecutaría ahora mismo

  Express la guarda y la llama cuando llegue una petición,
  pasándole (req, res) automáticamente.
*/

// GET /jobs -> listar con filtros y paginación
jobsRouter.get('/', JobController.getAll)

// GET /jobs/:id -> obtener uno concreto
jobsRouter.get('/:id', JobController.getId)

// POST /jobs -> crear
jobsRouter.post('/', JobController.create)

// PUT /jobs/:id -> reemplazar entero
jobsRouter.put('/:id', JobController.update)

// PATCH /jobs/:id -> actualizar solo algunos campos
jobsRouter.patch('/:id', JobController.partialUpdate)

// DELETE /jobs/:id -> eliminar
jobsRouter.delete('/:id', JobController.delete)
