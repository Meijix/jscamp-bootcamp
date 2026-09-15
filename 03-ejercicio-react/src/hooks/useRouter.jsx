/* =========================================================
   SPA -> custom hook para las rutas
   =========================================================
   Una SPA (Single Page Application) es una web que cambia de
   "página" SIN recargar el navegador. 
   propio mini React Router para entender 
   ========================================================= */

import { useCallback, useEffect, useState } from 'react'

export function useRouter() {
  /*
    Guardo la ruta actual en el estado.

    Le paso una FUNCIÓN a useState en vez de el valor directo:
      useState(() => window.location.pathname)

    Esto se llama "inicialización perezosa": la función solo se
    ejecuta la PRIMERA vez que se monta el componente, no en cada render

    window.location.pathname es la parte de la URL después del dominio:
      http://localhost:5173/search?text=react  ->  "/search"
  */
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname)

  // También guardo los parámetros de búsqueda (?text=react&page=2)
  const [currentSearch, setCurrentSearch] = useState(() => window.location.search)

  useEffect(() => {
    // Cuando cambia la URL, actualizo el estado y React repinta
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname)
      setCurrentSearch(window.location.search)
    }

    /*
      'popstate' es el evento que dispara el navegador cuando el
      usuario pulsa las flechas
    */
    window.addEventListener('popstate', handleLocationChange)
    return () => {
      window.removeEventListener('popstate', handleLocationChange)
    }
    /*
      El array vacío [] al final significa "ejecuta este efecto UNA
      sola vez, al montar". Si no lo pusiera, se ejecutaría en cada
      render y añadiría listeners infinitos.
    */
  }, [])

  /**
   * Cambia de página sin recargar el navegador.
   * @param {string} path - ruta destino, ej: "/search?text=react"
   *
   * Va envuelta en useCallback para que sea SIEMPRE la misma función.
   * Si no, cada render crearía una función nueva, y cualquier
   * useEffect que la tenga en sus dependencias se ejecutaría sin
   * parar -> bucle infinito. (Me pasó y por eso está aquí.)
   */
  const navigateTo = useCallback((path) => {
    /*
      history.pushState cambia la URL de la barra de direcciones
      y añade una entrada al historial (por eso funciona el "atrás").
    */
    window.history.pushState({}, '', path)

    /*
      Problema: pushState NO dispara el evento 'popstate'.
      Así que lo lanzo yo a mano para que el listener de arriba
      se entere y actualice el estado.
    */
    window.dispatchEvent(new PopStateEvent('popstate'))
  }, [])

  /**
   * Igual que navigateTo pero SIN crear entrada en el historial.
   * Lo uso para los filtros: si cada letra que escribes creara una
   * entrada, pulsar "atrás" 20 veces sería insoportable.
   */
  const replaceTo = useCallback((path) => {
    window.history.replaceState({}, '', path)
    window.dispatchEvent(new PopStateEvent('popstate'))
  }, [])

  // Devuelvo un objeto para poder sacar solo lo que necesite cada componente
  return { currentPath, currentSearch, navigateTo, replaceTo }
}
