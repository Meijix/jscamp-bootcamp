/* =========================================================
   QUINTA PARTE (links activos + botón de sesión)
   SEXTA PARTE (conectar el botón con la store de auth)
   ========================================================= */

import { NavLink } from 'react-router'

import { Link } from './Link.jsx'
import { useAuthStore } from '../store/authStore.js'

/*
  Esta función decide el estilo de cada link del menú.

  NavLink le pasa a className un OBJETO con { isActive, isPending }.
  isActive es true cuando la URL actual coincide con el "to" del link.
  Así no tengo que comparar rutas a mano en ningún sitio.

  La saco fuera del componente porque no depende de nada de dentro:
  así no se vuelve a crear en cada render.
*/
const estiloDelLink = ({ isActive }) => (isActive ? 'nav-link is-active' : 'nav-link')

export function Header() {
  /*
    Así se lee una store de Zustand: le paso un "selector", una
    función que dice QUÉ trozo del estado me interesa.

    Es importante seleccionar solo lo justo. Si hiciera
    useAuthStore() a secas, me traería el objeto entero y este
    componente se repintaría aunque cambiara algo que no uso.
  */
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn)
  const login = useAuthStore((state) => state.login)
  const logout = useAuthStore((state) => state.logout)

  return (
    <header>
      {/* Mi componente Link sigue usando la prop "href", igual que antes */}
      <Link href="/" style={{ textDecoration: 'none' }}>
        <h1 style={{ color: 'white' }}>
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
        {/*
          NavLink es un Link que además SABE si está activo.
          Es exactamente para esto: menús de navegación.

          "end" significa "coincidencia exacta". Sin él, el link "/"
          se marcaría como activo también en /search y en /job/123,
          porque todas esas rutas empiezan por "/".
        */}
        <NavLink to="/" className={estiloDelLink} end>
          Inicio
        </NavLink>

        <NavLink to="/search" className={estiloDelLink}>
          Empleos
        </NavLink>
      </nav>

      {/*
        QUINTA PARTE (Tarea 2) + SEXTA PARTE (Tarea 3):
        el botón cambia de texto y de acción según el estado global.

        Fíjate: aquí no hay ningún useState. El estado vive en la
        store y este componente solo lo lee y lo modifica.
      */}
      <button className="button-login" onClick={isLoggedIn ? logout : login}>
        {isLoggedIn ? 'Cerrar sesión' : 'Iniciar sesión'}
      </button>
    </header>
  )
}
