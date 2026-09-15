/* =========================================================
   SÉPTIMA PARTE: SPA -> componente Route
   =========================================================
   Este componente decide si la página se pinta o no.

   "Si la URL actual es /search, pinta SearchPage. Si no, nada."
   ========================================================= */

import { useRouter } from '../hooks/useRouter.jsx'

export function Route({ path, component }) {
  const { currentPath } = useRouter()
  const Component = component
  
  //Si la ruta no coincide, devuelvo null= no renderizar 
  if (currentPath !== path) return null

  // Si coincide, pinto la página
  return <Component />
}
