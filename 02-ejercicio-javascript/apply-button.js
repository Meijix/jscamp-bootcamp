/* =========================================================
   DESAFÍO 2: Dar funcionalidad al botón "Aplicar"
   =========================================================
   Al hacer click en "Aplicar" el botón debe:
     - cambiar el texto a "¡Aplicado!"
     - ponerse verde
     - quedar deshabilitado
   ========================================================= */

const listaEmpleos = document.querySelector('.jobs-listings')

/* ---------------------------------------------------------
DELEGACIÓN DE EVENTOS:
   pongo el listener en el <ul>, que sí existe desde el principio,
   y dentro compruebo en qué se ha hecho click. funciona también con los botones que se creen
   más tarde al filtrar. Un solo listener para todos.
   --------------------------------------------------------- */
listaEmpleos.addEventListener('click', (evento) => {
  /* evento.target es el elemento EXACTO donde se hizo click */
  const elementoClicado = evento.target

  /* .closest() sube por los padres buscando el primer elemento
    que coincida con el selector. Devuelve null si no encuentra nada.*/
  const boton = elementoClicado.closest('.button-apply-job')

  // Si el click NO fue en un botón de aplicar, no hago nada
  if (boton === null) return

  // --- Y ahora los tres cambios que pide el ejercicio ---

  // 1. Cambio el texto. 
  boton.textContent = '¡Aplicado!'

  /*
    2. Lo pongo verde.
    añado una CLASE, porque en styles.css 
        .button-apply-job.is-applied { background: #4caf50; }*/
  boton.classList.add('is-applied')

  // 3. Lo deshabilito. disabled = true hace que el navegador
  //    ignore los clicks siguientes, así no se puede aplicar dos veces.
  boton.disabled = true
})
