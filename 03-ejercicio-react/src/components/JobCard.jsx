/* =========================================================
   JobCard
   =========================================================
   UNA tarjeta de empleo.
   Recibe el empleo por PROPS (los "parámetros" de un componente).

   Además guarda su propio ESTADO para el botón de aplicar
   ========================================================= */

import { useState } from 'react'

export function JobCard({ job }) {
  /*
    useState es el hook para guardar datos que CAMBIAN con el tiempo.
    Devuelve un array de 2 cosas:
      [0] el valor actual            -> isApplied
      [1] la función para cambiarlo  -> setIsApplied

    false es el valor inicial: al principio no hemos aplicado.
  */
  const [isApplied, setIsApplied] = useState(false)

  // Esta función se ejecuta cuando el usuario pulsa el botón
  const handleApplyClick = () => {
    setIsApplied(true)
  }

  const buttonClasses = isApplied ? 'button-apply-job is-applied' : 'button-apply-job'
  const buttonText = isApplied ? 'Aplicado' : 'Aplicar'

  return (
    <article
      className="job-listing-card"
      data-modalidad={job.data.modalidad}
      data-nivel={job.data.nivel}
      data-technology={job.data.technology}
    >
      <div>
        {}
        <h3>{job.titulo}</h3>
        <small>
          {job.empresa} | {job.ubicacion}
        </small>
        <p>{job.descripcion}</p>
      </div>

      {}
      <button className={buttonClasses} onClick={handleApplyClick} disabled={isApplied}>
        {buttonText}
      </button>
    </article>
  )
}
