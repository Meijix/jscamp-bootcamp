import styles from './Pagination.module.css'

export function Pagination({ currentPage = 1, totalPages = 10, onPageChange }) {
  // generar un array de páginas a mostrar
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  const isFirstPage = currentPage === 1
  const isLastPage = currentPage === totalPages

  const handlePrevClick = () => {
    // event.preventDefault() -> con <button> ya no hace falta: un botón no navega a ningún lado
    if (isFirstPage === false) {
      onPageChange(currentPage - 1)
    }
  }

  const handleNextClick = () => {
    // event.preventDefault() -> tampoco hace falta acá
    if (isLastPage === false) {
      onPageChange(currentPage + 1)
    }
  }

  const handlePageClick = (page) => () => {
    // event.preventDefault() -> tampoco hace falta
    if (page !== currentPage) {
      onPageChange(page)
    }
  }

  return (
    /*
      aria-label le da un NOMBRE a esta navegación.
      Hace falta por dos motivos:
        1. Accesibilidad: una página puede tener varios <nav> (el menú
           y la paginación) y el lector de pantalla necesita
           distinguirlos.
        2. Los tests E2E la localizan con
           getByRole('navigation', { name: 'Paginación de resultados' }),
           que es el selector recomendado.
    */
    <nav className={styles.pagination} aria-label="Paginación de resultados">
      <button
        type="button"
        disabled={isFirstPage}
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
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M15 6l-6 6l6 6" />
        </svg>
      </button>

      {pages.map((page) => (
        <button
          key={page}
          type="button"
          /* data-page={page} -> ya no hace falta: el número viene por cierre */
          className={currentPage === page ? styles.isActive : ''}
          onClick={handlePageClick(page)}
          aria-current={currentPage === page ? 'page' : undefined}
        >
          {page}
        </button>
      ))}

      <button
        type="button"
        disabled={isLastPage}
        onClick={handleNextClick}
        aria-label="Página siguiente"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="icon icon-tabler icons-tabler-outline icon-tabler-chevron-right"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M9 6l6 6l-6 6" />
        </svg>
      </button>
    </nav>
  )
}
