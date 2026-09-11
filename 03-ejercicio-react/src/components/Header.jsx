/* =========================================================
   Header
   ========================================================= */

import { Link } from './Link.jsx'

export function Header() {
  return (
    <header>
      {/*
        <a> recarga la página entera; <Link> cambia
        la URL sin recargar (eso es lo que hace que sea una SPA).
      */}
      <Link href="/" style={{ textDecoration: 'none' }}>
        <h1 style={{ color: 'white' }}>
          {}
          <svg
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <polyline points="16 18 22 12 16 6"></polyline>
            <polyline points="8 6 2 12 8 18"></polyline>
          </svg>
          DevJobs
        </h1>
      </Link>

      <nav>
        <Link href="/">Inicio</Link>
        <Link href="/search">Empleos</Link>
      </nav>
    </header>
  )
}
