/* =========================================================
   MIDDLEWARE DE CORS
   =========================================================
   ¿Qué es CORS y por qué molesta tanto?

   Los navegadores tienen una norma de seguridad: una web que está
   en localhost:5173 NO puede llamar por fetch a una API que está en
   localhost:1234. Son "orígenes" distintos y lo bloquean.

   Es una protección real: si no existiera, cualquier web maliciosa
   podría hacer peticiones a tu banco usando tus cookies.

   CORS es la forma que tiene el servidor de decir "tranquilo,
   navegador, a estos dominios sí les doy permiso". Lo hace mandando
   la cabecera Access-Control-Allow-Origin en la respuesta.

   ⚠️ Ojo: esto solo afecta a NAVEGADORES. Con curl o Postman las
   peticiones funcionan igual aunque no haya CORS, porque ellos no
   aplican esa norma.
   ========================================================= */

import cors from 'cors'
import { ACCEPTED_ORIGINS } from '../config.js'

/*
  Un middleware es una función que Express ejecuta ANTES de llegar
  a las rutas. Aquí uso el paquete "cors", que ya me devuelve una.

  En vez de pasar la lista directamente, le paso una FUNCIÓN a
  "origin". Así puedo decidir caso por caso y, de paso, dejar pasar
  las peticiones que no traen origen.
*/
export const corsMiddleware = () =>
  cors({
    origin: (origin, callback) => {
      /*
        Caso 1: el origen está en mi lista blanca -> permitido.
      */
      if (ACCEPTED_ORIGINS.includes(origin)) {
        /*
          El callback sigue la convención de Node:
            primer parámetro  -> el error (null si no hay)
            segundo parámetro -> el resultado (true = permitido)
        */
        return callback(null, true)
      }

      /*
        Caso 2: no hay origen (origin es undefined).
        Pasa con curl, Postman, apps móviles o peticiones del propio
        servidor. Como no vienen de un navegador, no hay riesgo de
        CORS: las dejo pasar para poder probar la API cómodamente.
      */
      if (!origin) {
        return callback(null, true)
      }

      // Caso 3: cualquier otro origen -> bloqueado
      return callback(new Error('No permitido por CORS'))
    },
  })
