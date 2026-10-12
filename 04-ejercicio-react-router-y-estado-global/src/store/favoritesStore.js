/* =========================================================
   SEXTA PARTE - Tarea 2: Store de favoritos
   =========================================================
   Guardo solo los IDs de los empleos favoritos, no los empleos
   enteros. Motivos:
     - ocupa muchísimo menos
     - si mañana cambia el título de un empleo, no me queda una
       copia vieja guardada por aquí
   ========================================================= */

import { create } from 'zustand'

/*
  Fíjate en que aquí uso DOS parámetros: (set, get).
    set -> para CAMBIAR el estado
    get -> para LEER el estado actual desde dentro de una acción
*/
export const useFavoritesStore = create((set, get) => ({
  // --- ESTADO ---
  favorites: [], // array de IDs, ej: ['7a4d...', 'd35b...']

  // --- ACCIONES ---

  /**
   * Añade un empleo a favoritos.
   */
  addFavorite: (jobId) =>
    /*
      Le paso una FUNCIÓN a set en vez de un objeto.
      Así Zustand me da el estado anterior (state) y puedo
      construir el nuevo a partir de él.

      [...state.favorites, jobId] crea un array NUEVO con lo que
      había más el id nuevo. Esto es clave: NO uso .push().

      ¿Por qué? Porque .push() modifica el array original, y React
      compara por referencia (¿es el mismo objeto en memoria?).
      Si es el mismo array, React piensa "no ha cambiado nada" y
      no repinta. Con un array nuevo sí se entera.
    */
    set((state) => ({ favorites: [...state.favorites, jobId] })),

  /**
   * Quita un empleo de favoritos.
   */
  removeFavorite: (jobId) =>
    /*
      .filter() ya devuelve un array nuevo, así que aquí no hay
      que hacer nada especial. Me quedo con todos los ids MENOS
      el que quiero borrar.
    */
    set((state) => ({ favorites: state.favorites.filter((id) => id !== jobId) })),

  /**
   * Añade o quita según cómo esté ahora. Es lo que usa el botón.
   */
  toggleFavorite: (jobId) => {
    /*
      get() me da el estado actual completo.
      Lo uso para consultar y luego decidir qué acción llamar.
      Reutilizo mis propias acciones en vez de repetir la lógica.
    */
    const { favorites, addFavorite, removeFavorite } = get()

    if (favorites.includes(jobId)) {
      removeFavorite(jobId)
    } else {
      addFavorite(jobId)
    }
  },

  /**
   * Helper: ¿este empleo está en favoritos?
   * Devuelve true o false.
   */
  isFavorite: (jobId) => get().favorites.includes(jobId),
}))
