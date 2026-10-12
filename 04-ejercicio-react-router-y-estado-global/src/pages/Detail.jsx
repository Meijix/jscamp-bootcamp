/* =========================================================
   SEGUNDA PARTE: página de detalle de un empleo
   =========================================================
   Se muestra en la ruta /job/:id.
   Tiene que:
     1. leer el id de la URL
     2. pedir ese empleo a la API
     3. pintar el contenido, que viene en formato Markdown
   ========================================================= */

import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import snarkdown from 'snarkdown'

import { Link } from '../components/Link.jsx'
import { useAuthStore } from '../store/authStore.js'
import { useFavoritesStore } from '../store/favoritesStore.js'

export function DetailPage() {
  /*
    useParams lee las partes variables de la ruta.
    Como en App.jsx definí la ruta como "/job/:id", aquí recibo
    un objeto { id: '7a4d1d8b-...' } y saco el id con destructuring.
  */
  const { id } = useParams()

  /*
    Tres estados para las tres situaciones posibles de una petición:
      - cargando (todavía no ha llegado nada)
      - error    (algo salió mal)
      - éxito    (ya tengo el empleo)

    Manejar los tres casos es lo que diferencia una app "de verdad"
    de una demo: si solo contemplas el caso bueno, el usuario ve
    una pantalla en blanco cuando falla algo.
  */
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const isLoggedIn = useAuthStore((state) => state.isLoggedIn)
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite)
  const isFavorite = useFavoritesStore((state) => state.favorites.includes(id))

  const [isApplied, setIsApplied] = useState(false)

  useEffect(() => {
    /*
      AbortController sirve para CANCELAR el fetch.
      ¿Por qué lo necesito? Imagina que el usuario entra en un empleo
      y a los 0.2 segundos se va a otro. La primera petición sigue
      en marcha y, al terminar, intentaría guardar los datos del
      empleo equivocado. Con el abort la corto en seco.
    */
    const controller = new AbortController()

    /*
      Declaro la función async DENTRO del efecto.
      No puedo poner async en el useEffect directamente porque una
      función async siempre devuelve una promesa, y React espera que
      el return de un efecto sea la función de limpieza.
    */
    async function cargarEmpleo() {
      try {
        setLoading(true)
        setError(null)

        const respuesta = await fetch(`https://jscamp-api.vercel.app/api/jobs/${id}`, {
          signal: controller.signal,
        })

        // fetch no lanza error con un 404: hay que comprobarlo a mano
        if (!respuesta.ok) throw new Error('No se ha encontrado el empleo')

        const datos = await respuesta.json()
        setJob(datos)
      } catch (err) {
        /*
          Cuando yo mismo cancelo la petición, el catch salta con
          un error de tipo AbortError. Eso NO es un fallo real,
          así que lo ignoro para no enseñar un mensaje de error falso.
        */
        if (err.name === 'AbortError') return
        setError(err.message)
      } finally {
        // finally se ejecuta siempre, salga bien o mal
        setLoading(false)
      }
    }

    cargarEmpleo()

    // Limpieza: si cambio de empleo o me voy, cancelo la petición
    return () => controller.abort()

    /*
      [id] como dependencia: el efecto se vuelve a ejecutar cuando
      cambia el id de la URL. Así al ir de /job/1 a /job/2 se pide
      el empleo nuevo.
    */
  }, [id])

  // --- Los tres casos, uno detrás de otro ---
  if (loading) return <main style={{ padding: '2rem' }}>Cargando empleo...</main>

  if (error) {
    return (
      <main style={{ padding: '2rem' }}>
        <h1>Ups...</h1>
        <p>{error}</p>
        <Link href="/search">Volver a la búsqueda</Link>
      </main>
    )
  }

  if (!job) return null

  return (
    <main style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
      <Link href="/search">← Volver a los resultados</Link>

      <h1>{job.titulo}</h1>
      <p>
        {job.empresa} | {job.ubicacion}
      </p>

      <div style={{ display: 'flex', gap: '0.5rem', margin: '1rem 0' }}>
        <button
          className={isApplied ? 'button-apply-job is-applied' : 'button-apply-job'}
          onClick={() => setIsApplied(true)}
          disabled={isApplied || !isLoggedIn}
        >
          {isApplied ? 'Aplicado' : 'Aplicar'}
        </button>

        <button
          className="button-favorite"
          onClick={() => toggleFavorite(job.id)}
          aria-pressed={isFavorite}
        >
          {isFavorite ? '★ En favoritos' : '☆ Agregar a favoritos'}
        </button>
      </div>

      {/*
        job.content puede no venir en algunos empleos.
        El "?." (optional chaining) evita que reviente: si content
        es undefined, devuelve undefined en vez de lanzar
        "Cannot read properties of undefined".
      */}
      <Markdown titulo="Descripción" texto={job.content?.description} />
      <Markdown titulo="Responsabilidades" texto={job.content?.responsibilities} />
      <Markdown titulo="Requisitos" texto={job.content?.requirements} />
      <Markdown titulo="Sobre la empresa" texto={job.content?.about} />
    </main>
  )
}

/* ---------------------------------------------------------
   Componente auxiliar para pintar Markdown.
   Lo saco aparte porque lo uso 4 veces: mejor una vez bien
   hecho que copiar y pegar el dangerouslySetInnerHTML.
   --------------------------------------------------------- */
function Markdown({ titulo, texto }) {
  // Si no hay texto, no pinto ni el título (evito secciones vacías)
  if (!texto) return null

  return (
    <section>
      <h2>{titulo}</h2>

      {/*
        La API devuelve Markdown ("- item", "**negrita**"), pero el
        navegador solo entiende HTML. snarkdown hace la traducción.

        dangerouslySetInnerHTML es la forma de inyectar HTML "crudo"
        en React. Se llama "dangerously" (peligrosamente) a propósito:
        si el texto viniera de un usuario cualquiera, podría colar
        un <script> y ejecutar código en la página (ataque XSS).

        Aquí lo acepto porque el contenido viene de la API del
        bootcamp, que es de confianza. Con contenido de usuarios
        habría que limpiarlo antes con algo como DOMPurify.

        El nombre de la propiedad tiene que ser exactamente __html.
      */}
      <div dangerouslySetInnerHTML={{ __html: snarkdown(texto) }} />
    </section>
  )
}
