/* =========================================================
   DESAFÍO 1: Mostrar los resultados de búsqueda
   =========================================================
     1. Traer los empleos del archivo data.json (con fetch)
     2. Mostrarlos dentro del <ul class="jobs-listings">
   ========================================================= */

/*
  document.querySelector busca el PRIMER elemento que coincida
  con un selector de CSS. Aquí busco por clase (el punto).
*/
const listaEmpleos = document.querySelector('.jobs-listings')

/*
  Esta variable va a guardar la PROMESA del fetch.
  Empieza en null = "todavía no he pedido los datos".

  Para hacer el fetch UNA SOLA VEZ aunque la llamen dos archivos distintos.
*/
let promesaDeEmpleos = null

export function cargarEmpleos() {
  if (promesaDeEmpleos === null) {
    promesaDeEmpleos = fetch('./data.json')
      /* convertir el texto del archivo en un array/objeto de JS.  */
      .then((respuesta) => {
        if (!respuesta.ok) {
          throw new Error('No se pudo cargar data.json')
        }
        return respuesta.json()
      })
  }

  // Si ya la había pedido antes, devuelvo la misma promesa (datos cacheados)
  return promesaDeEmpleos
}

/**
 * Pinta un array de empleos dentro del <ul>.
 * @param {Array} empleos - la lista de empleos a mostrar
 */
export function mostrarEmpleos(empleos) {
  /*
    Antes de pintar, VACÍO la lista.
    Si no lo hiciera, al filtrar se irían acumulando los empleos
    nuevos debajo de los viejos.
  */
  listaEmpleos.innerHTML = ''

  // Si no hay ningún empleo, muestro un mensaje y salgo de la función
  if (empleos.length === 0) {
    listaEmpleos.innerHTML = '<li><p>No se han encontrado empleos.</p></li>'
    return // "return" corta la función aquí: no sigue ejecutando lo de abajo
  }

  /*
    .map() recorre el array y devuelve un array NUEVO.
    Aquí convierto cada objeto empleo en un trozo de HTML (texto).

    Uso template literals (comillas invertidas ``) porque me dejan:
      - escribir HTML en varias líneas
      - meter variables dentro con ${...}
  */
  const html = empleos
    .map((empleo) => {
      return `
        <li>
          <article class="job-listing-card">
            <div>
              <h3>${empleo.titulo}</h3>
              <small>${empleo.empresa} | ${empleo.ubicacion}</small>
              <p>${empleo.descripcion}</p>
            </div>
            <button class="button-apply-job">Aplicar</button>
          </article>
        </li>
      `
    })
    .join('')

  // Y ahora sí, todo el HTML de golpe en el <ul>
  listaEmpleos.innerHTML = html
}

/* =========================================================
   ARRANQUE
   =========================================================
   Nada más cargar la página: pido los datos y los pinto todos.
   ========================================================= */
cargarEmpleos()
  .then((empleos) => mostrarEmpleos(empleos))
  .catch((error) => {
    console.error('Error cargando los empleos:', error)
    listaEmpleos.innerHTML = '<li><p>Hubo un error al cargar los empleos.</p></li>'
  })
