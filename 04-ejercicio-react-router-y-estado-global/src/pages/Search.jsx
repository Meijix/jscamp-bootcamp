/* =========================================================
   TERCERA PARTE: filtros sincronizados con useSearchParams
   =========================================================
   Antes tenía TRES useState (texto, filtros, página) y encima un
   useEffect para copiarlos a la URL. Eso es duplicar información:
   el mismo dato vivía en dos sitios y había que mantenerlos a mano.

   Ahora la ÚNICA fuente de verdad es la URL.
     - Leer un filtro    -> searchParams.get('text')
     - Cambiar un filtro -> setSearchParams({...})

   Ventajas que salen gratis:
     - al recargar (F5) los filtros siguen puestos
     - el botón "atrás" del navegador funciona solo
     - puedes copiar y compartir el enlace de una búsqueda
   ========================================================= */

import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'

import { SearchFormSection } from '../components/SearchFormSection.jsx'
import { JobListings } from '../components/JobListings.jsx'
import { Pagination } from '../components/Pagination.jsx'

const RESULTS_PER_PAGE = 5

export function SearchPage() {
  /*
    useSearchParams funciona igual que useState, pero el estado
    guardado es la parte "?...=..." de la URL.
      searchParams    -> objeto para LEER (es un URLSearchParams)
      setSearchParams -> función para ESCRIBIR
  */
  const [searchParams, setSearchParams] = useSearchParams()

  // Leo los filtros de la URL. || '' porque .get() devuelve null si no existe.
  const text = searchParams.get('text') || ''
  const technology = searchParams.get('technology') || ''
  const type = searchParams.get('type') || ''
  const level = searchParams.get('level') || ''
  const page = Number(searchParams.get('page')) || 1

  // Estos SÍ son estado normal: son la respuesta del servidor, no filtros
  const [jobs, setJobs] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  /* -------------------------------------------------------
     Pedir los datos a la API cada vez que cambia un filtro
     ------------------------------------------------------- */
  useEffect(() => {
    const controller = new AbortController()

    async function cargarEmpleos() {
      try {
        setLoading(true)

        // Construyo la query de la API a partir de los filtros
        const params = new URLSearchParams()
        if (text) params.set('text', text)
        if (technology) params.set('technology', technology)
        if (type) params.set('type', type)
        if (level) params.set('level', level)

        // La API pagina con limit/offset, no con "página"
        params.set('limit', RESULTS_PER_PAGE)
        params.set('offset', (page - 1) * RESULTS_PER_PAGE)

        const respuesta = await fetch(
          `https://jscamp-api.vercel.app/api/jobs?${params.toString()}`,
          { signal: controller.signal }
        )
        const json = await respuesta.json()

        setJobs(json.data)
        setTotal(json.total)
      } catch (error) {
        if (error.name === 'AbortError') return
        console.error('Error cargando empleos:', error)
      } finally {
        setLoading(false)
      }
    }

    cargarEmpleos()
    return () => controller.abort()

    /*
      Pongo valores sueltos como dependencias (text, technology...)
      y no el objeto searchParams entero.

      Motivo: React compara las dependencias con ===. searchParams es
      un objeto nuevo en cada render, así que el efecto se dispararía
      siempre. Los strings sí se comparan por valor y funcionan bien.
    */
  }, [text, technology, type, level, page])

  const totalPages = Math.max(Math.ceil(total / RESULTS_PER_PAGE), 1)

  /* -------------------------------------------------------
     Actualizar la URL cuando el usuario toca algo
     ------------------------------------------------------- */

  /**
   * Cambia un parámetro de la URL sin tocar los demás.
   */
  const actualizarParametro = useCallback(
    (clave, valor, reiniciarPagina = true) => {
      /*
        setSearchParams acepta una función que recibe los params
        actuales, igual que setState. Así me aseguro de partir del
        valor más reciente.
      */
      setSearchParams(
        (paramsActuales) => {
          /*
            Hago una COPIA. URLSearchParams es mutable, y modificar
            el objeto que me da React directamente puede provocar
            comportamientos raros.
          */
          const nuevos = new URLSearchParams(paramsActuales)

          /*
            Si el valor está vacío, borro el parámetro en vez de
            dejar "?text=" colgando. La URL queda mucho más limpia.
          */
          if (valor) {
            nuevos.set(clave, valor)
          } else {
            nuevos.delete(clave)
          }

          // Cualquier búsqueda nueva vuelve a la página 1
          if (reiniciarPagina) nuevos.delete('page')

          return nuevos
        },
        /*
          replace: true -> sustituye la entrada del historial en vez
          de añadir una nueva. Si no, escribir "react" letra a letra
          dejaría 5 entradas y el botón "atrás" sería inservible.
        */
        { replace: true }
      )
    },
    [setSearchParams]
  )

  const handleTextChange = useCallback(
    (nuevoTexto) => actualizarParametro('text', nuevoTexto),
    [actualizarParametro]
  )

  const handleFilterChange = useCallback(
    (nombre, valor) => actualizarParametro(nombre, valor),
    [actualizarParametro]
  )

  const handlePageChange = useCallback(
    (nuevaPagina) => {
      // Aquí NO reinicio la página (es justo lo que estoy cambiando)
      actualizarParametro('page', String(nuevaPagina), false)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    [actualizarParametro]
  )

  // Título de la pestaña con los resultados
  useEffect(() => {
    document.title = loading
      ? 'Cargando... | DevJobs'
      : `Resultados ${total} | Página ${page} | DevJobs`
  }, [loading, total, page])

  return (
    <main>
      <SearchFormSection
        initialText={text}
        /* Le paso los filtros leídos de la URL: así los selects
           aparecen ya seleccionados al recargar la página.
           Las claves coinciden con el name de cada <select>. */
        filters={{ technology, type, level }}
        onTextChange={handleTextChange}
        onFilterChange={handleFilterChange}
      />

      <section>
        <h2 style={{ textAlign: 'center' }}>Resultados de búsqueda ({total})</h2>

        {loading ? <p style={{ textAlign: 'center' }}>Cargando empleos...</p> : <JobListings jobs={jobs} />}

        {total > 0 && (
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />
        )}
      </section>
    </main>
  )
}
