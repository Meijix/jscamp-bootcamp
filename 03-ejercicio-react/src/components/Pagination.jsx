/* =========================================================
   Paginación
   =========================================================
*/

import styles from './Pagination.module.css'

/*
  se indican VALORES POR DEFECTO.
  Si el padre se olvida de pasar la prop, se usa ese valor
  y el componente no revienta.
*/
export function Pagination({ currentPage = 1, totalPages = 1, onPageChange }) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  // Guardo estas dos comprobaciones en variables para que se lea mejor abajo
  const isFirstPage = currentPage === 1
  const isLastPage = currentPage === totalPages

  const handlePrevClick = (event) => {
    // preventDefault evita que el <a href="#"> salte al principio de la página
    event.preventDefault()
    if (!isFirstPage) onPageChange(currentPage - 1)
  }

  const handleNextClick = (event) => {
    event.preventDefault()
    if (!isLastPage) onPageChange(currentPage + 1)
  }

  const handlePageClick = (page) => (event) => {
    event.preventDefault()
    if (page !== currentPage) onPageChange(page)
  }

  return (
    <nav className={styles.pagination} aria-label="Paginación de resultados">
      {}
      <a
        href="#"
        /*
          Si estamos en la primera página, le añado la clase isDisabled
          (que en el CSS lo apaga y le quita los clicks).
          Si no, le pongo cadena vacía = ninguna clase extra.
        */
        className={isFirstPage ? styles.isDisabled : ''}
        onClick={handlePrevClick}
        aria-label="Página anterior"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M15 6l-6 6l6 6" />
        </svg>
      </a>

      {/* --- Un enlace por cada número de página --- */}
      {pages.map((page) => (
        <a
          key={page}
          href="#"
          className={page === currentPage ? styles.isActive : ''}
          onClick={handlePageClick(page)}
          /* aria-current le dice al lector de pantalla cuál es la página actual */
          aria-current={page === currentPage ? 'page' : undefined}
        >
          {page}
        </a>
      ))}

      {/* --- Flecha SIGUIENTE --- */}
      <a
        href="#"
        className={isLastPage ? styles.isDisabled : ''}
        onClick={handleNextClick}
        aria-label="Página siguiente"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 6l6 6l-6 6" />
        </svg>
      </a>
    </nav>
  )
}
