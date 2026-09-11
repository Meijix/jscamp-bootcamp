/* =========================================================
   SÉPTIMA PARTE: SPA -> componente Link
   =========================================================
   Un <a> normal recarga TODA la página: el navegador pide el HTML
   otra vez, React se reinicia y se pierde todo el estado.

   Este <Link> se ve igual que un <a>, pero al hacer click
   cancela el comportamiento del navegador y cambia la ruta con JS.
   ========================================================= */

import { useRouter } from '../hooks/useRouter.jsx'

/*
  - children:  ¡prop especial! Es TODO lo que va entre las etiquetas.
               En <Link href="/">Inicio</Link>, children = "Inicio"
*/
export function Link({ href, children, ...restOfProps }) {
  const { navigateTo } = useRouter()

  const handleClick = (event) => {
    /*
      Si el usuario hace Ctrl+Click (o Cmd+Click en Mac) quiere abrir
      en una pestaña nueva. En ese caso NO hago nada especial y dejo
      que el navegador haga su trabajo de siempre.
      Lo mismo con el click del botón central (button === 1).
    */
    if (event.metaKey || event.ctrlKey || event.button !== 0) return

    // preventDefault cancela la recarga de página que haría el <a>
    event.preventDefault()

    // Y cambio la ruta "a la manera SPA"
    navigateTo(href)
  }

  return (
    <a href={href} {...restOfProps} onClick={handleClick}>
      {children}
    </a>
  )
}
