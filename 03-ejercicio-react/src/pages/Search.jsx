/* =========================================================
   página de resultados
   =========================================================

   Este patrón se llama "smart component / dumb components":
     - Search (smart)  -> piensa
     - JobListings, Pagination, SearchFormSection (dumb) -> pintan
   ========================================================= */

import { useCallback, useEffect, useState } from 'react'

// Importo el JSON directamente, sin fetch (lo permite Vite)
import data from '../data.json'

import { SearchFormSection } from '../components/SearchFormSection.jsx'
import { JobListings } from '../components/JobListings.jsx'
import { Pagination } from '../components/Pagination.jsx'
import { useRouter } from '../hooks/useRouter.jsx'

const RESULTS_PER_PAGE = 5

// no usa hooks ni estado, solo transforma datos.
function leerFiltrosDeLaUrl() {
  /*
    URLSearchParams - para leer los parámetros de la URL sin tener que partir strings a mano.
  */
  const params = new URLSearchParams(window.location.search)

  return {
    /*
      params.get() devuelve null si el parámetro no existe.
      El "|| ''" convierte ese null en cadena vacía, que es lo que
      esperan mis inputs (un input con value={null} da warning).
    */
    text: params.get('text') || '',
    technology: params.get('technology') || '',
    location: params.get('type') || '',
    level: params.get('level') || '',
    // Number('2') -> 2. Si no hay parámetro, Number(null) es 0, por eso el || 1
    page: Number(params.get('page')) || 1,
  }
}

export function SearchPage() {
  const { replaceTo } = useRouter()

  /*
    Inicializo el estado LEYENDO LA URL.
    Así, si compartes el enlace .../search?technology=react, quien
    lo abra ve directamente los resultados filtrados.
  */
  const [searchText, setSearchText] = useState(() => leerFiltrosDeLaUrl().text)
  const [filters, setFilters] = useState(() => {
    const desdeUrl = leerFiltrosDeLaUrl()
    return {
      technology: desdeUrl.technology,
      location: desdeUrl.location,
      level: desdeUrl.level,
    }
  })
  const [currentPage, setCurrentPage] = useState(() => leerFiltrosDeLaUrl().page)

  /* -------------------------------------------------------
     1. FILTRAR
     -------------------------------------------------------
     valor DERIVADO: se puede calcular a partir del estado que ya tengo
     ------------------------------------------------------- */
  const empleosFiltrados = data.filter((job) => {
    // Búsqueda por texto, sin distinguir mayúsculas
    const texto = searchText.trim().toLowerCase()
    const coincideTexto =
      job.titulo.toLowerCase().includes(texto) || job.empresa.toLowerCase().includes(texto)

    // Los tres filtros de los selects. '' significa "sin filtro".
    const coincideTecnologia = filters.technology === '' || job.data.technology === filters.technology
    const coincideUbicacion = filters.location === '' || job.data.modalidad === filters.location

    /*
      Uso startsWith y no === porque en data.json hay empleos con
      nivel "mid" y otros con "mid-level"
    */
    const coincideNivel = filters.level === '' || job.data.nivel.startsWith(filters.level)

    // && = tienen que cumplirse TODAS las condiciones
    return coincideTexto && coincideTecnologia && coincideUbicacion && coincideNivel
  })

  /* -------------------------------------------------------
     2. PAGINAR
     ------------------------------------------------------- */
  const total = empleosFiltrados.length

  /*
    Math.ceil redondea SIEMPRE hacia arriba.
    Con 12 resultados y 5 por página: 12/5 = 2.4 -> 3 páginas.
    (Las 2 sobrantes también necesitan su página.)

    Math.max(..., 1) evita que totalPages sea 0 cuando no hay
    resultados, lo que rompería la paginación.
  */
  const totalPages = Math.max(Math.ceil(total / RESULTS_PER_PAGE), 1)

  /*
    .slice(desde, hasta) corta un trozo del array.
    Página 1 -> slice(0, 5)   (elementos 0,1,2,3,4)
    Página 2 -> slice(5, 10)  (elementos 5,6,7,8,9)
  */
  const desde = (currentPage - 1) * RESULTS_PER_PAGE
  const empleosDeLaPagina = empleosFiltrados.slice(desde, desde + RESULTS_PER_PAGE)

  /* -------------------------------------------------------
     3. MANEJADORES
     -------------------------------------------------------
     useCallback "memoriza" la función para que sea la MISMA en
     cada render, en lugar de una función nueva.
     ------------------------------------------------------- */
  const handleTextChange = useCallback((texto) => {
    setSearchText(texto)
    // Cada búsqueda nueva vuelve a la página 1 (lo pide el ejercicio)
    setCurrentPage(1)
  }, [])

  const handleFilterChange = useCallback((nombre, valor) => {
    setFilters((filtrosAnteriores) => ({ ...filtrosAnteriores, [nombre]: valor }))
    setCurrentPage(1)
  }, [])

  const handlePageChange = useCallback((pagina) => {
    setCurrentPage(pagina)
    // Detalle de usabilidad: al cambiar de página, subo arriba del todo
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  /* -------------------------------------------------------
     4. SINCRONIZAR LA URL 
     -------------------------------------------------------
     Cada vez que cambia un filtro, reescribo la URL para que
     refleje la búsqueda. Así se puede compartir y recargar.
     ------------------------------------------------------- */
  useEffect(() => {
    const params = new URLSearchParams()

    // Solo añado a la URL los filtros que tienen valor (URL más limpia)
    if (searchText) params.set('text', searchText)
    if (filters.technology) params.set('technology', filters.technology)
    if (filters.location) params.set('type', filters.location)
    if (filters.level) params.set('level', filters.level)
    if (currentPage > 1) params.set('page', currentPage)

    const query = params.toString() // ej: "text=react&page=2"
    const nuevaUrl = query ? `/search?${query}` : '/search'

    /*
      Uso replaceTo (replaceState) y NO navigateTo (pushState):
      no quiero que cada letra que escribes cree una entrada nueva
      en el historial del navegador.
    */
    replaceTo(nuevaUrl)
  }, [searchText, filters, currentPage, replaceTo])

  /* -------------------------------------------------------
     5. TÍTULO DE LA PESTAÑA
     ------------------------------------------------------- */
  useEffect(() => {
    document.title = `Resultados ${total} | Página ${currentPage} | DevJobs`
  }, [total, currentPage])

  return (
    <main>
      <SearchFormSection
        initialText={searchText}
        filters={filters}
        onTextChange={handleTextChange}
        onFilterChange={handleFilterChange}
      />

      <section>
        <h2 style={{ textAlign: 'center' }}>Resultados de búsqueda ({total})</h2>

        <JobListings jobs={empleosDeLaPagina} />

        {/*
          Renderizado condicional: si no hay resultados, no tiene
          sentido enseñar la paginación.
        */}
        {total > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </section>
    </main>
  )
}
