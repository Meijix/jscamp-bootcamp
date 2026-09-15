/* =========================================================
  búsqueda con filtros
  ========================================================= */

import { useEffect, useRef, useState } from 'react'

// Los valores iniciales (initialText, filters) vienen del padre
export function SearchFormSection({ initialText, filters, onTextChange, onFilterChange }) {
  /*
    El input tiene su PROPIO estado local (searchText) porque debe
    actualizarse con cada tecla, al instante.

    Se evita recalcular los resultados 20 veces mientras escribes
  */
  const [searchText, setSearchText] = useState(initialText ?? '')

  /*
    useRef guarda el valor que sobrevive entre renders PERO que,
    al cambiar, NO provoca un repintado.
  */
  const timeoutRef = useRef(null)

  /*
    Este useEffect es el que hace el debounce.
    Se ejecuta cada vez que cambia searchText.
  */
  useEffect(() => {
    // 1. Cancelo el temporizador anterior (si el usuario sigue escribiendo)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)

    // 2. Programo uno nuevo para dentro de 400 milisegundos
    timeoutRef.current = setTimeout(() => {
      onTextChange(searchText)
    }, 400)

    // 3. Limpieza: si el componente desaparece, cancelo el timer pendiente
    return () => clearTimeout(timeoutRef.current)
  }, [searchText, onTextChange])

  const handleTextChange = (event) => {
    setSearchText(event.target.value)
  }

  const handleClearInput = (event) => {
    event.preventDefault()
    setSearchText('')
  }

  /*
    Un solo manejador para los 3 selects.
    event.target.name me dice CUÁL cambió
  */
  const handleSelectChange = (event) => {
    onFilterChange(event.target.name, event.target.value)
  }

  return (
    <section className="jobs-search">
      <h1>Encuentra tu próximo trabajo</h1>
      <p>Explora miles de oportunidades en el sector tecnológico.</p>

      {/*
        onSubmit + preventDefault: si el usuario pulsa Enter, el
        navegador querría recargar la página. Se lo impido porque
        la búsqueda ya es en vivo.
      */}
      <form id="empleos-search-form" role="search" onSubmit={(e) => e.preventDefault()}>
        <div className="search-bar">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
            <path d="M21 21l-6 -6" />
          </svg>

          {/*
            INPUT CONTROLADO: value + onChange.
            React manda sobre lo que se ve en el input. Si me olvidara
            del onChange, el input no dejaría escribir (React lo
            repintaría con el valor viejo en cada tecla).
          */}
          <input
            name="search"
            id="empleos-search-input"
            type="search"
            placeholder="Buscar trabajos, empresas o habilidades"
            value={searchText}
            onChange={handleTextChange}
          />

          {}
          <button type="button" onClick={handleClearInput} aria-label="Limpiar búsqueda">
            ✖
          </button>
        </div>

        <div className="search-filters">
          {}
          <select
            name="technology"
            id="filter-technology"
            value={filters.technology}
            onChange={handleSelectChange}
          >
            <option value="">Tecnología</option>
            <optgroup label="Tecnologías populares">
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="react">React</option>
              <option value="node">Node.js</option>
            </optgroup>
            <option value="mobile">Móvil</option>
          </select>

          <select
            name="location"
            id="filter-location"
            value={filters.location}
            onChange={handleSelectChange}
          >
            <option value="">Ubicación</option>
            <option value="remoto">Remoto</option>
            <option value="cdmx">Ciudad de México</option>
            <option value="guadalajara">Guadalajara</option>
            <option value="monterrey">Monterrey</option>
            <option value="barcelona">Barcelona</option>
            <option value="madrid">Madrid</option>
            <option value="valencia">Valencia</option>
          </select>

          <select
            name="level"
            id="filter-experience-level"
            value={filters.level}
            onChange={handleSelectChange}
          >
            <option value="">Nivel de experiencia</option>
            <option value="junior">Junior</option>
            <option value="mid">Mid-level</option>
            <option value="senior">Senior</option>
          </select>
        </div>
      </form>
    </section>
  )
}
