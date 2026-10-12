/* =========================================================
   PRIMERA PARTE: adaptar useRouter a React Router
   =========================================================
   Igual que con el Link: mantengo EXACTAMENTE la misma interfaz
   de antes ({ currentPath, navigateTo }) pero por dentro ya no
   toco window.history ni escucho el evento popstate a mano.

   Resultado: los componentes que usaban este hook siguen
   funcionando sin cambiar ni una línea.
   ========================================================= */

import { useLocation, useNavigate } from 'react-router'

export function useRouter() {
  /*
    useLocation devuelve un objeto con la URL actual troceada:
      { pathname: '/search', search: '?text=react', hash: '', ... }
    Además hace que el componente se repinte solo cuando cambia.
  */
  const location = useLocation()

  /*
    useNavigate devuelve una FUNCIÓN para cambiar de página.
    Es el equivalente a nuestro antiguo navigateTo.
  */
  const navigate = useNavigate()

  return {
    // Antes: window.location.pathname
    currentPath: location.pathname,

    // Antes: window.location.search
    currentSearch: location.search,

    /*
      Antes: pushState + dispatchEvent.
      Ahora solo delego en navigate. Mantengo el nombre navigateTo
      para no romper a quien ya lo usaba.
    */
    navigateTo: navigate,
  }
}
