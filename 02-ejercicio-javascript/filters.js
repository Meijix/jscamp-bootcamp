/* =========================================================
   DESAFÍOS 3, 4 y 5: Filtros
   =========================================================
     - Desafío 3: filtrar por ubicación y nivel de experiencia
     - Desafío 4: buscar por título
     - Desafío 5: filtrar por tecnología

   Los hago los tres juntos en una sola función porque los
   filtros se tienen que poder COMBINAR (ej: "remoto" + "junior").
   Si hiciera una función por filtro, el último machacaría al anterior.
   ========================================================= */

/*
  Importo las funciones que ya escribí en fetch-data.js.
  Esto solo funciona porque en el HTML los scripts están puestos
  con type="module". Los módulos se ejecutan una única vez, así que
  aunque los dos archivos llamen a cargarEmpleos(), el fetch se hace 1 vez.
*/
import { cargarEmpleos, mostrarEmpleos } from './fetch-data.js'

// Guardo referencias a los 4 controles del formulario
const inputBusqueda = document.querySelector('#empleos-search-input')
const selectTecnologia = document.querySelector('#filter-technology')
const selectUbicacion = document.querySelector('#filter-location')
const selectNivel = document.querySelector('#filter-experience-level')

/* lista COMPLETA de empleos, sin filtrar.
  cada vez que el usuario cambia un filtro, vuelvo a filtrar desde esta lista original.*/
let todosLosEmpleos = []

/**
 * Aplica TODOS los filtros a la vez y pinta el resultado.
 */
function aplicarFiltros() {

  const textoBuscado = inputBusqueda.value.trim().toLowerCase()
  const tecnologia = selectTecnologia.value
  const ubicacion = selectUbicacion.value
  const nivel = selectNivel.value

  /*
    .filter() recorre el array y se queda SOLO con los elementos
    para los que la función devuelve true.
  */
  const empleosFiltrados = todosLosEmpleos.filter((empleo) => {
    /* --- Filtro 1: por título (desafío 4) --- */
    /*
      .includes() comprueba si un texto contiene otro dentro.
    */
    const coincideTitulo = empleo.titulo.toLowerCase().includes(textoBuscado)

    /* --- Filtro 2: por tecnología (desafío 5) --- */
    /*
      Aquí empleo.data.technology es un ARRAY: ["react", "nodejs"].
      Por eso uso .includes() del array, que busca un elemento exacto.
    El operador || significa "O": basta con que se cumpla una de las dos.
    */
    const coincideTecnologia = tecnologia === '' || empleo.data.technology.includes(tecnologia)

    /* --- Filtro 3: por ubicación (desafío 3) --- */
    /*
      Uso empleo.data.modalidad y NO empleo.ubicacion porque en el JSON
      modalidad ya viene en el mismo formato 
    */
    const coincideUbicacion = ubicacion === '' || empleo.data.modalidad === ubicacion

    /* --- Filtro 4: por nivel de experiencia (desafío 3) --- */
    const coincideNivel = nivel === '' || empleo.data.nivel === nivel

    /*
      Devuelvo true solo si se cumplen TODAS las condiciones (operador &&).
      Así los filtros se combinan entre ellos.
    */
    return coincideTitulo && coincideTecnologia && coincideUbicacion && coincideNivel
  })

  // Reutilizo la función de fetch-data.js para pintar el resultado
  mostrarEmpleos(empleosFiltrados)
}

/* =========================================================
   ARRANQUE
   ========================================================= */
cargarEmpleos()
  .then((empleos) => {
    // Guardo la lista completa para poder filtrar sobre ella siempre
    todosLosEmpleos = empleos

    /*'input' se dispara con CADA tecla que escribe el usuario. */
    inputBusqueda.addEventListener('input', aplicarFiltros)

    /*
      Para los <select> uso 'change', que salta cuando el usuario
      elige una opción distinta. 
    */
    selectTecnologia.addEventListener('change', aplicarFiltros)
    selectUbicacion.addEventListener('change', aplicarFiltros)
    selectNivel.addEventListener('change', aplicarFiltros)

    document.querySelector('#empleos-search-form').addEventListener('submit', (evento) => {
      evento.preventDefault()
    })
  })
  .catch((error) => {
    console.error('Error preparando los filtros:', error)
  })
