/* =========================================================
   SEXTA PARTE - Tarea 1: Store de autenticación
   =========================================================
   ¿Qué problema resuelve Zustand?

   El botón de "Iniciar sesión" está en el Header, pero el botón
   de "Aplicar" (que solo debería funcionar si hay sesión) está en
   JobCard, en la otra punta del árbol de componentes.

   Con useState tendría que subir el estado hasta App y luego
   bajarlo por props pasando por 5 componentes que no lo necesitan.
   A eso se le llama "prop drilling" y es un dolor.

   Con Zustand el estado vive FUERA de React, en un sitio global,
   y cualquier componente lo lee directamente.
   ========================================================= */

import { create } from 'zustand'

/*
  create() recibe una función que devuelve el estado inicial
  y las acciones para modificarlo.

  El parámetro "set" es la función que Zustand me da para cambiar
  el estado. Cuando llamo a set(), Zustand avisa automáticamente
  a TODOS los componentes que estén usando esta store y los repinta.

  Por convención los hooks de Zustand se llaman useAlgoStore.
*/
export const useAuthStore = create((set) => ({
  // --- ESTADO ---
  // Al arrancar la app nadie ha iniciado sesión
  isLoggedIn: false,

  // --- ACCIONES ---
  /*
    set() recibe un objeto con SOLO las propiedades que cambian.
    Zustand las mezcla con el resto del estado automáticamente
    (hace un merge superficial), así que no tengo que copiar
    todo el objeto anterior a mano.
  */
  login: () => set({ isLoggedIn: true }),

  logout: () => set({ isLoggedIn: false }),
}))
