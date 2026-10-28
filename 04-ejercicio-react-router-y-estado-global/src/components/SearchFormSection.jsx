/* =========================================================
   Formulario de búsqueda (ahora controlado desde la URL)
   =========================================================
   Este componente sigue siendo "tonto": no guarda filtros, solo
   los muestra y avisa al padre cuando cambian.

   La diferencia con el ejercicio 03 es que ahora el padre no guarda
   los filtros en un useState, sino en la URL. A este componente
   le da exactamente igual: recibe las mismas props.
   Esa es la ventaja de separar bien las responsabilidades.
   ========================================================= */

import { useEffect, useRef, useState } from 'react'

export function SearchFormSection({ initialText, filters, onTextChange, onFilterChange }) {
  /*
    El input necesita estado propio para responder instantáneamente
    a cada tecla. Al padre solo le aviso 400ms después (debounce),
    porque cada aviso provoca una llamada a la API.
  */
  const [searchText, setSearchText] = useState(initialText ?? '')

  const timeoutRef = useRef(null)

  /*
    Esto es lo mismo que te comenté en la corrección del ejercicio 3
    Agrego igual todos los cambios que ya hicimos para que quede registrado
  */
  const textoEnviadoRef = useRef(initialText ?? '')

  useEffect(() => {
    const textoDelPadre = initialText ?? ''

    if (textoDelPadre !== textoEnviadoRef.current) {
      textoEnviadoRef.current = textoDelPadre
      setSearchText(textoDelPadre)
    }
  }, [initialText])

  useEffect(() => {
    if (searchText === textoEnviadoRef.current) return

    // Cancelo la cuenta atrás anterior: el usuario sigue escribiendo
    if (timeoutRef.current) clearTimeout(timeoutRef.current)

    timeoutRef.current = setTimeout(() => {
      textoEnviadoRef.current = searchText
      onTextChange(searchText)
    }, 400)

    return () => clearTimeout(timeoutRef.current)
  }, [searchText, onTextChange])

  const handleTextChange = (event) => setSearchText(event.target.value)

  const handleClearInput = () => setSearchText('')

  /*
    Un único manejador para los tres selects.
    event.target.name me dice cuál cambió, así que el nombre de cada
    <select> tiene que coincidir con el parámetro de la URL/API:
    technology, type y level.
  */
  const handleSelectChange = (event) => {
    onFilterChange(event.target.name, event.target.value)
  }

  return (
    <section className="jobs-search">
      <h1>Encuentra tu próximo trabajo</h1>
      <p>Explora miles de oportunidades en el sector tecnológico.</p>

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

          {/* type="search" -> Playwright lo encuentra con getByRole('searchbox') */}
          <input
            name="search"
            id="empleos-search-input"
            type="search"
            placeholder="Buscar trabajos, empresas o habilidades"
            value={searchText}
            onChange={handleTextChange}
          />

          <button type="button" onClick={handleClearInput} aria-label="Limpiar búsqueda">
            ✖︎
          </button>
        </div>

        <div className="search-filters">
          {/*
            Los valores de las <option> son los que entiende la API.
            Por ejemplo "node" (no "nodejs"): lo comprobé llamando a
            https://jscamp-api.vercel.app/api/jobs y mirando los datos.
          */}
          <select
            name="technology"
            id="filter-technology"
            value={filters.technology}
            onChange={handleSelectChange}
          >
            <option value="">Tecnología</option>
            <optgroup label="Tecnologías populares">
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="react">React</option>
              <option value="node">Node.js</option>
              <option value="python">Python</option>
            </optgroup>
            <option value="docker">Docker</option>
            <option value="aws">AWS</option>
            <option value="kotlin">Kotlin</option>
            <option value="swift">Swift</option>
            <option value="sql">SQL</option>
          </select>

          <select name="type" id="filter-location" value={filters.type} onChange={handleSelectChange}>
            <option value="">Ubicación</option>
            <option value="remoto">Remoto</option>
            <option value="cdmx">Ciudad de México</option>
            <option value="guadalajara">Guadalajara</option>
            <option value="monterrey">Monterrey</option>
            <option value="barcelona">Barcelona</option>
            <option value="madrid">Madrid</option>
            <option value="valencia">Valencia</option>
            <option value="bogota">Bogotá</option>
            <option value="lima">Lima</option>
            <option value="santiago">Santiago de Chile</option>
            <option value="bsas">Buenos Aires</option>
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
