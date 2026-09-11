/* =========================================================
   mapeo de datos y renderizado condicional
   =========================================================
   SOLO la lista:
     - si no hay empleos -> mensaje de "no hay resultados"
     - si hay empleos    -> una <JobCard /> por cada uno
   ========================================================= */

import { JobCard } from './JobCard.jsx'

export function JobListings({ jobs }) {
  return (
    <div className="jobs-listings">
      {}
      {jobs.length === 0 && (
        <p style={{ textAlign: 'center', padding: '1rem' }}>
          No se han encontrado empleos que coincidan con los criterios de búsqueda.
        </p>
      )}

      {/*
        La prop "key" es OBLIGATORIA en las listas.
        Uso job.id porque es único y estable. 
      */}
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  )
}
