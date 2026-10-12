/* =========================================================
   PUNTO DE ENTRADA
   =========================================================
   Aquí se monta todo: los middlewares y las rutas.

   ⚠️ El ORDEN de los app.use() importa muchísimo. Express ejecuta
   los middlewares de arriba abajo, uno detrás de otro, como una
   cadena de montaje. Si pones algo en el sitio equivocado, la
   petición no llega a donde debe.
   ========================================================= */

import express from 'express'

import { jobsRouter } from './routes/jobs.js'
import { corsMiddleware } from './middlewares/cors.js'
import { DEFAULTS } from './config.js'

const app = express()

/*
  1. CORS lo primero.
     Antes de nada, el navegador manda una petición "de prueba"
     (preflight, con el método OPTIONS) para preguntar si tiene
     permiso. Si CORS no está el primero, esa petición se pierde.
*/
app.use(corsMiddleware())

/*
  2. Lectura del body.
     express.json() coge el texto JSON que manda el cliente y lo
     convierte en un objeto, dejándolo en req.body.

     Si me olvidara de esta línea, req.body sería undefined en todos
     los POST/PUT/PATCH. Es el error número 1 de todo el mundo con
     Express, y encima no da ningún mensaje que ayude.
*/
app.use(express.json())

/*
  3. Ocultar que uso Express.
     Por defecto Express manda la cabecera "X-Powered-By: Express",
     que le dice a un atacante qué tecnología usas. Es información
     gratis para él, así que la quito.
*/
app.disable('x-powered-by')

/*
  4. Las rutas.
     Todo lo que empiece por /jobs se lo paso al jobsRouter.
     Por eso dentro de routes/jobs.js las rutas se escriben sin
     el prefijo.
*/
app.use('/jobs', jobsRouter)

/*
  5. El 404, EL ÚLTIMO de todos.
     Si la petición llega hasta aquí es que no ha coincidido con
     ninguna ruta anterior. Si pusiera esto arriba, respondería
     404 a absolutamente todo.
*/
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' })
})

/*
  El puerto sale del config.js.
  process.env.PORT tiene prioridad porque los servicios de hosting
  (Vercel, Render, Railway...) te asignan un puerto por esa variable
  y hay que respetarlo.
*/
const PORT = process.env.PORT ?? DEFAULTS.PORT

app.listen(PORT, () => {
  console.log(`Servidor levantado en http://localhost:${PORT}`)
})
