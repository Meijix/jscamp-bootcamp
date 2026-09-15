/* =========================================================
   página 404
   =========================================================
   cuando la URL no coincide con ninguna ruta conocida.
   con enlace de vuelta al inicio
   ========================================================= */

import { Link } from '../components/Link.jsx'

export function NotFoundPage() {
  return (
    <main style={{ textAlign: 'center', padding: '4rem 1rem' }}>
      <h1>404 - Página no encontrada</h1>
      <p>Lo sentimos, la página que buscas no existe.</p>

      {//Uso <Link> y no <a> para no recargar la aplicación entera.
      }
      <Link href="/" style={{ display: 'inline-block', marginTop: '1rem' }}>
        Volver al inicio
      </Link>
    </main>
  )
}
