/* =========================================================
   CONFIGURACIÓN
   =========================================================
   Todos los "números mágicos" de la aplicación en un solo sitio.

   ¿Por qué? Porque si el 10 de la paginación estuviera escrito
   dentro del controlador, para cambiarlo habría que ir a buscarlo
   entre la lógica. Aquí se ve de un vistazo qué se puede ajustar.

   Se llaman en MAYÚSCULAS por convención: es la forma de avisar de
   que son constantes que no cambian mientras corre el programa.
   ========================================================= */

export const DEFAULTS = {
  LIMIT_PAGINATION: 10, // cuántos jobs devuelve /jobs si no piden otra cosa
  LIMIT_OFFSET: 0, // desde qué posición empieza
  PORT: 1234, // puerto del servidor
}

/*
  Lista de dominios a los que dejo llamar a mi API (ver middlewares/cors.js).
  La pongo aquí porque es configuración, no lógica.
*/
export const ACCEPTED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:1234',
  'https://midu.dev',
  'http://jscamp.dev',
  'http://localhost:5173',
]
