/* =========================================================
   SEGUNDA PARTE  (link al detalle)
   QUINTA PARTE   (botón de favoritos)
   SEXTA PARTE    (conectarlo con las stores)
   ========================================================= */

import { useState } from 'react'

import { Link } from './Link.jsx'
import { useAuthStore } from '../store/authStore.js'
import { useFavoritesStore } from '../store/favoritesStore.js'

export function JobCard({ job }) {
  /*
    "¿He aplicado a ESTE empleo?" es información que solo le importa
    a esta tarjeta, así que se queda en un useState local.
    No todo tiene que ir a la store global: úsala solo para lo que
    de verdad comparten varios componentes lejanos.
  */
  const [isApplied, setIsApplied] = useState(false)

  // Estas dos SÍ vienen del estado global
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn)
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite)

  /*
    ⚠️ Detalle importante de Zustand:
    NO uso el helper isFavorite(job.id) de la store aquí.

    Ese helper lee con get(), que devuelve el valor en ese instante
    pero NO suscribe al componente a los cambios. La tarjeta no se
    repintaría al pulsar el botón.

    En cambio, seleccionando el array y comprobando aquí, Zustand
    sí me avisa cuando favorites cambia.
  */
  const isFavorite = useFavoritesStore((state) => state.favorites.includes(job.id))

  const handleApplyClick = () => {
    setIsApplied(true)
  }

  const handleFavoriteClick = () => {
    toggleFavorite(job.id)
  }

  const buttonClasses = isApplied ? 'button-apply-job is-applied' : 'button-apply-job'
  const buttonText = isApplied ? 'Aplicado' : 'Aplicar'

  return (
    <article
      className="job-listing-card"
      data-modalidad={job.data?.modalidad}
      data-nivel={job.data?.nivel}
      data-technology={job.data?.technology}
    >
      <div>
        {/*
          SEGUNDA PARTE (Tarea 3): navegar al detalle.

          Envuelvo SOLO el título con el Link, no la tarjeta entera.
          Así el botón de "Aplicar" sigue funcionando: si el Link
          rodeara todo, al pulsar "Aplicar" también navegaríamos
          al detalle (los clicks "burbujean" hacia los padres).
        */}
        <Link href={`/job/${job.id}`}>
          <h3>{job.titulo}</h3>
        </Link>

        <small>
          {job.empresa} | {job.ubicacion}
        </small>
        <p>{job.descripcion}</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {/*
          El botón de aplicar solo funciona con la sesión iniciada.
          Es la gracia de tener el estado de auth global: esta tarjeta
          se entera de que has pulsado "Iniciar sesión" en el Header
          sin que nadie le pase nada por props.
        */}
        <button
          className={buttonClasses}
          onClick={handleApplyClick}
          disabled={isApplied || !isLoggedIn}
          title={isLoggedIn ? 'Aplicar a este empleo' : 'Inicia sesión para aplicar'}
        >
          {buttonText}
        </button>

        <button
          className="button-favorite"
          onClick={handleFavoriteClick}
          /*
            aria-pressed le dice a un lector de pantalla que este
            botón es un interruptor y en qué posición está.
            Es la forma accesible de hacer un botón de "me gusta".
          */
          aria-pressed={isFavorite}
        >
          {/* El texto cambia para que se vea si ya está guardado */}
          {isFavorite ? '★ En favoritos' : '☆ Agregar a favoritos'}
        </button>
      </div>
    </article>
  )
}
