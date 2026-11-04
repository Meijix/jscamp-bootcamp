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

  const handlePrevClick = () => {
    /*
      Antes empezaba con event.preventDefault() para que el <a href="#">
      no saltara al principio de la página. Con <button> ya no hace falta:
      un botón no navega a ningún lado.
    */
    if (!isFirstPage) onPageChange(currentPage - 1)
  }

  const handleNextClick = () => {
    // event.preventDefault() -> tampoco hace falta con <button>
    if (!isLastPage) onPageChange(currentPage + 1)
  }

  const handlePageClick = (page) => () => {
    // event.preventDefault() -> tampoco hace falta con <button>
    if (page !== currentPage) onPageChange(page)
  }

  return (
    <nav className={styles.pagination} aria-label="Paginación de resultados">
      {}
      {/*
        Antes eran <a href="#"> con la clase isDisabled + pointer-events: none.
        Eso apaga el mouse, pero para el navegador y los lectores de pantalla
        el enlace seguía estando habilitado.
        Como moverse de página es una acción (no una navegación), va <button>
        y el atributo disabled, que es el que deshabilita de verdad.
      */}
      <button
        type="button"
        disabled={isFirstPage}
        /* className={isFirstPage ? styles.isDisabled : ''} */
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
      </button>

      {/* --- Un enlace por cada número de página --- */}
      {pages.map((page) => (
        <button
          key={page}
          type="button"
          className={page === currentPage ? styles.isActive : ''}
          onClick={handlePageClick(page)}
          /* aria-current le dice al lector de pantalla cuál es la página actual */
          aria-current={page === currentPage ? 'page' : undefined}
        >
          {page}
        </button>
      ))}

      {/* --- Flecha SIGUIENTE --- */}
      <button
        type="button"
        disabled={isLastPage}
        /* className={isLastPage ? styles.isDisabled : ''} */
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
      </button>
    </nav>
  )
}
