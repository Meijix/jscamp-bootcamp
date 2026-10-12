/* =========================================================
   CLI: listar archivos y carpetas
   =========================================================
   Ejemplos de uso:
     node cli.js .
     node cli.js ./src --asc --files
     node cli.js /tmp --desc --folders

   Y con el modelo de permisos de Node activado:
     node --permission cli.js .                      -> da error explicativo
     node --permission --allow-fs-read=./ cli.js .   -> funciona

   Los 4 ejercicios están resueltos en este archivo:
     1. Leer el directorio y sacar nombre / tipo / tamaño
     2. Ordenar con --asc y --desc
     3. Filtrar con --files y --folders
     4. Avisar si faltan permisos de lectura
   ========================================================= */

import { readdir, stat } from 'node:fs/promises'
import { join } from 'node:path'

/* =========================================================
   PASO 1: leer lo que ha escrito el usuario (process.argv)
   =========================================================
   process.argv es un array con todo lo que se escribió en la terminal:

     node cli.js ./src --asc
     [0] = ruta de node        -> /usr/local/bin/node
     [1] = ruta de este script -> /.../cli.js
     [2] en adelante = lo que nos interesa

   Por eso hago .slice(2): me salto los dos primeros.
   ========================================================= */
const argumentos = process.argv.slice(2)

/*
  Separo los argumentos en dos grupos:
    - los que empiezan por "--" son FLAGS (opciones)
    - el resto es la carpeta que quiere listar

  Lo hago así porque el enunciado dice que los flags pueden ir en
  cualquier orden: "node cli --files --asc" o "node cli --asc --files".
  Al filtrar por el prefijo "--" en vez de mirar posiciones fijas,
  el orden deja de importar.
*/
const flags = argumentos.filter((argumento) => argumento.startsWith('--'))
const rutas = argumentos.filter((argumento) => !argumento.startsWith('--'))

/*
  Si no me dan carpeta, uso '.' que significa "la carpeta actual".
  rutas[0] es undefined si el array está vacío, y "undefined || '.'"
  devuelve '.'.
*/
const directorio = rutas[0] || '.'

// Compruebo qué flags ha puesto el usuario. includes() devuelve true/false.
const ordenarAscendente = flags.includes('--asc')
const ordenarDescendente = flags.includes('--desc')
const soloArchivos = flags.includes('--files')
const soloCarpetas = flags.includes('--folders')

/* =========================================================
   Función auxiliar: convertir bytes a algo legible
   =========================================================
   1536 bytes no le dice nada a nadie. "1.50 KB" sí.
   ========================================================= */
function formatearTamano(bytes) {
  const unidades = ['B', 'KB', 'MB', 'GB']
  let valor = bytes
  let indice = 0

  /*
    Mientras el número siga siendo grande, lo divido entre 1024
    y subo una unidad. 2048 B -> 2 KB -> se queda ahí.
  */
  while (valor >= 1024 && indice < unidades.length - 1) {
    valor = valor / 1024
    indice = indice + 1
  }

  // toFixed(2) deja solo 2 decimales y devuelve un string
  return `${valor.toFixed(2)} ${unidades[indice]}`
}

/* =========================================================
   Función principal
   =========================================================
   La marco como "async" porque dentro uso await: readdir y stat
   devuelven promesas (por eso los importo de fs/promises).
   ========================================================= */
async function listarDirectorio() {
  let nombres

  /* -------------------------------------------------------
     EJERCICIO 4: permisos y errores claros
     -------------------------------------------------------
     Envuelvo el readdir en try/catch. Si no lo hiciera, el usuario
     vería un stack trace de 20 líneas en rojo en vez de un mensaje
     útil. Un buen CLI explica qué ha pasado Y cómo arreglarlo.
     ------------------------------------------------------- */
  try {
    nombres = await readdir(directorio)
  } catch (error) {
    /*
      error.code es un código corto que dice EXACTAMENTE qué falló.
      Es mucho más fiable que mirar el texto del mensaje (que además
      cambia según el idioma del sistema).
    */
    if (error.code === 'ERR_ACCESS_DENIED') {
      // Node arrancó con --experimental-permission pero sin permiso de lectura
      console.error('❌ No tienes permisos para leer este directorio.')
      console.error('   Node se ha ejecutado con --permission, que bloquea el acceso a archivos.')
      console.error('   Vuelve a lanzarlo habilitando la lectura:')
      console.error(`   node --permission --allow-fs-read=${directorio} cli.js ${directorio}`)
    } else if (error.code === 'EACCES') {
      // El sistema operativo (no Node) deniega el acceso
      console.error(`❌ El sistema operativo no te deja leer "${directorio}".`)
      console.error('   Comprueba los permisos de la carpeta con: ls -la')
    } else if (error.code === 'ENOENT') {
      console.error(`❌ La carpeta "${directorio}" no existe.`)
    } else if (error.code === 'ENOTDIR') {
      console.error(`❌ "${directorio}" es un archivo, no una carpeta.`)
    } else {
      console.error(`❌ Error inesperado: ${error.message}`)
    }

    /*
      process.exit(1) termina el programa con código de error.
      El 0 significa "todo bien" y cualquier otro número "algo falló".
      Esto es importante para que otros scripts sepan que fue mal.
    */
    process.exit(1)
  }

  /* -------------------------------------------------------
     EJERCICIO 1: sacar la info de cada elemento
     ------------------------------------------------------- */

  /*
    OJO con este detalle: NO puedo hacer
      nombres.map(async (nombre) => { await stat(...) })
    y esperar tener los datos, porque .map con async devuelve un
    array de PROMESAS, no de resultados.

    Promise.all() espera a que TODAS terminen y me devuelve el array
    de valores ya resueltos. Además las lanza en paralelo, así que
    es mucho más rápido que un for con await dentro.
  */
  const elementos = await Promise.all(
    nombres.map(async (nombre) => {
      /*
        join() une trozos de ruta poniendo la barra correcta según
        el sistema operativo (/ en Mac y Linux, \ en Windows).
        Concatenar con + y "/" a mano rompería en Windows.
      */
      const rutaCompleta = join(directorio, nombre)

      /*
        stat() da la "ficha técnica" de un archivo: tamaño, fechas,
        permisos y si es carpeta o no.
      */
      const informacion = await stat(rutaCompleta)

      return {
        nombre,
        // isDirectory() es un método, no una propiedad: lleva paréntesis
        esCarpeta: informacion.isDirectory(),
        tamano: informacion.size,
      }
    })
  )

  /* -------------------------------------------------------
     EJERCICIO 3: filtrar con --files y --folders
     ------------------------------------------------------- */

  // Empiezo con la lista completa y le voy quitando cosas
  let resultado = elementos

  if (soloArchivos) {
    resultado = resultado.filter((elemento) => !elemento.esCarpeta)
  }

  if (soloCarpetas) {
    resultado = resultado.filter((elemento) => elemento.esCarpeta)
  }

  /*
    Si el usuario pone los dos flags a la vez (--files --folders),
    el primer filtro quita las carpetas y el segundo quita los
    archivos: no queda nada. Se lo aviso en vez de mostrar una
    lista vacía sin explicación.
  */
  if (soloArchivos && soloCarpetas) {
    console.log('⚠️  Has usado --files y --folders a la vez, así que no queda nada que mostrar.')
    return
  }

  /* -------------------------------------------------------
     EJERCICIO 2: ordenar con --asc y --desc
     ------------------------------------------------------- */

  /*
    .sort() necesita una función que compare DOS elementos y devuelva:
      un número negativo -> a va antes que b
      0                  -> da igual el orden
      un número positivo -> b va antes que a

    localeCompare() compara textos respetando el idioma: sabe que
    la "ñ" va después de la "n" y que "á" y "a" son casi lo mismo.
    Con < y > a secas, las mayúsculas irían todas antes que las
    minúsculas ("Zapato" antes que "avión"), que no es lo que queremos.
  */
  if (ordenarAscendente) {
    resultado.sort((a, b) => a.nombre.localeCompare(b.nombre))
  }

  if (ordenarDescendente) {
    // Igual pero al revés: comparo b con a
    resultado.sort((a, b) => b.nombre.localeCompare(a.nombre))
  }

  // Si no pone ningún flag de orden, se queda el orden original (no toco nada)

  /* -------------------------------------------------------
     PINTAR EL RESULTADO
     ------------------------------------------------------- */

  if (resultado.length === 0) {
    console.log('(La carpeta está vacía)')
    return
  }

  resultado.forEach((elemento) => {
    // Icono según el tipo
    const icono = elemento.esCarpeta ? '📁' : '📄'

    // El enunciado pide un guion para las carpetas
    const tamano = elemento.esCarpeta ? '-' : formatearTamano(elemento.tamano)

    /*
      padEnd(25) rellena el texto con espacios por la derecha hasta
      llegar a 25 caracteres. Así todos los tamaños quedan alineados
      en la misma columna y la salida se lee mucho mejor.
    */
    console.log(`${icono} ${elemento.nombre.padEnd(25)} ${tamano}`)
  })
}

// Arranco el programa
listarDirectorio()
