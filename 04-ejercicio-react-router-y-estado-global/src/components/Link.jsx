/* =========================================================
   PRIMERA PARTE: modificar el Link para que use React Router
   =========================================================
   El enunciado insiste en algo importante: hay que cambiar el
   INTERIOR de este componente, NO reemplazar los <Link> por
   toda la app.

   ¿Por qué? Porque el resto de archivos siguen importando
   { Link } de aquí. Si el "contrato" (las props que acepta) no
   cambia, puedo cambiar las tripas sin tocar nada más.
   Eso es encapsulación, y es una de las grandes ventajas de
   componentizar bien.
   ========================================================= */

/*
  Importo el Link de React Router pero le cambio el nombre con "as".
  Si los dos se llamaran Link, chocarían: uno es el que importo y
  el otro es el que exporto yo.
*/
import { Link as RouterLink } from 'react-router'

export function Link({ href, children, ...restOfProps }) {
  /*
    Ya no necesito useRouter, ni handleClick, ni preventDefault:
    React Router hace todo eso por dentro (y mejor: respeta el
    Ctrl+Click, el botón central del ratón, prefetch...).

    La única traducción que tengo que hacer es el nombre de la prop:
      mi componente usa   href  (como un <a> normal)
      React Router usa    to
  */
  return (
    <RouterLink to={href} {...restOfProps}>
      {children}
    </RouterLink>
  )
}
