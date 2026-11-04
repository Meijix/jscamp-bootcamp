<!-- Aquí puedes introducir tus dudas sobre el ejercicio, la consigna, la corrección, etc -->

# Mis dudas del ejercicio de JavaScript

## Primer desafío | fetch y mostrar los datos

### ¿Por qué `fetch` necesita DOS `.then()` seguidos?

Esto es lo que más me costó. Yo esperaba que `fetch('./data.json')` me devolviera
directamente los empleos, pero me devuelve algo llamado `Response` y hay que llamar
a `.json()` encima. ¿Por qué no me da los datos directamente? ¿Qué es esa respuesta
intermedia?

**Respuesta:**
Buena pregunta! es el punto donde todos se traban al inicio, así que no te preocupes.

`fetch` no te devuelve los datos, te devuelve un objeto `Response`.

Te doy un ejemplo, creo que se entiende mejor:

Pensa en el sobre de una carta, el sobre trae la información del envío (status, headers) pero todavía no abriste la carta. Ese es el primer `.then()`: recibís el sobre.

El contenido (el body) no llega todo junto, llega en trozos por la red. Por eso `.json()` también devuelve una promesa: es el momento en que abrís el sobre y traducís todo a un array de JS. Ese es el segundo `.then()`.

Por eso se necesitan dos.

### ¿Por qué mi `console.log(empleos)` sale `undefined` o `Promise {<pending>}`?

Me pasó al principio. Escribí algo así:

```js
const empleos = fetch('./data.json')
console.log(empleos) // Promise {<pending>}
```

Y no entendía nada. Ahora sé que hay que esperar, pero no me queda claro **por qué**
JavaScript no espera solo. ¿Sigue ejecutando el resto del código mientras tanto?

**Respuesta:**
Sí, JS sigue ejecutando el resto del código mientras tanto y esa es una de las ventajas que tiene.

`fetch` tiene que ir por la red y eso tarda. Si JavaScript esperara sentado a que termine, tu página se congelaría hasta que lleguen los datos. Entonces JS no espera: arranca el fetch y sigue de largo con la línea de abajo.

La promesa es un recibo: "te voy a dar el valor, seguí con tu vida y cuando llegue te aviso".

El aviso llega por `.then()` o con `await`. Por eso el `console.log` te muestra `pending`: le preguntaste al recibo por el valor antes de que existiera.

### ¿Cuál es la diferencia entre `.then()` y `async/await`?
¿Son dos formas de hacer exactamente lo mismo y elijo la
que más me guste, o hay casos donde uno sirve y el otro no?

**Respuesta:**
Son lo mismo por debajo, podes elegir la que más te guste.

[Spoiler del futuro]: la industria hoy usa más `async/await`.

Hay casos donde `.then()` es el que sirve, cuando corrés varias promesas en paralelo con `Promise.all([...]).then(...)` por ejemplo, ya lo verás.

### ¿Por qué hay que hacer `.join('')` después del `.map()`?

Si no lo pongo, aparecen comas entre cada empleo. Entiendo que el `.map()` me deja un
array, pero... ¿por qué al meter un array en `innerHTML` JavaScript decide poner comas?
¿Quién decide eso?

**Respuesta:**
Quién decide eso es el propio JavaScript.

Al asignar un array a `innerHTML`, JS lo convierte a string con `Array.prototype.toString()`, que une los elementos con comas. Es el comportamiento por defecto de los arrays.

`.join('')` une los elementos con el separador que tu le digas (en este caso, nada). Por eso las comas desaparecen.

### ¿Por qué hay que vaciar la lista con `listaEmpleos.innerHTML = ''` antes de pintar?

Lo entendí cuando filtré y se me acumulaban los empleos unos debajo de otros.
Pero, ¿no hay una forma más "limpia" de hacerlo que borrar todo y volver a pintar?
¿No es muy lento repintar 15 empleos cada vez que escribo una letra?

**Respuesta:**
Es la forma más simple y está bien usarla. La realidad es que 15 empleos no lleva mucho tiempo a nivel de navegador en pintarse o re pintarse.

Lo que si, cuando usemos frameworks/librerías como React, esto se hace de otra manera y mucho más cómoda y rápida.

## Segundo desafío | El botón de "Aplicar"

### ¿Por qué `querySelectorAll('.button-apply-job')` no encuentra nada?

Esta es LA duda del ejercicio. Los botones se ven en pantalla, están ahí, pero mi
código dice que hay cero. Me han explicado que es porque todavía no existen cuando
se ejecuta mi script... pero entonces, ¿cómo sé yo cuándo "ya existen"?

**Respuesta:**
Buena pregunta, la clave aquí está en que estas haciendo un `fetch` para obtener los jobs. Por lo tanto no los podes pintar en el DOM hasta que el fetch termine.

Como estamos usando un archivo local y no una API, esto demora milisegundos, pero es el tiempo suficiente para que antes se ejecute `querySelectorAll('.button-apply-job')` y no encuentre nada.

Lo que podes hacer es:
- Poner los listeners después de pintar (funciona, pero al filtrar y repintar los perdés de nuevo).
- Delegación de eventos: un solo listener en un elemento que siempre existió (el `<ul>`). Es lo que hiciste y es la forma correcta.

Luego cuando trabajemos con React quedará todo mucho más claro y visual. De momento, tener presente que siempre que haces un fetch va a demorar, y si lo usas para pintar algo, va a demorar también hasta que los datos lleguen.

### La delegación de eventos: ¿el evento sube o baja?

Pongo el listener en el `<ul>` y funciona al hacer click en un botón que está dentro.
Sé que se llama "burbujeo", pero no me imagino bien qué pasa por dentro.
¿El click se dispara primero en el botón y luego en el `<ul>`, o al revés?

**Respuesta:**
Bien, aquí podemos ir muy a detalle, te voy a pasar un video en donde explica perfecto y en profundidad este tema y el siguiente, hacerlo por texto creo que entrevera mucho más de lo que sería viendo un video.

De manera resumida:
Cuando tenes un addEventListener en un elemento (article por ejemplo), todo clic que hagas dentro lo va a capturar el addEventListener, esto da una pauta para entender que el listener escucha desde lo más profundo hasta lo más lejano, en otras palabras "el evento sube".

Por eso si queres capturar un evento de muchos botones que están dentro de un `ul`, lo mejor es poner el listener en el `ul` y con el `target` detectar cuando estás seleccionando un botón. Es una manera más óptima que poner un listener en cada botón. Con esto ya doy paso a tu siguiente pregunta.

El video es este: https://www.youtube.com/watch?v=xlci1S08Cww
Los chicos los conozco y explican genial, sobre todo estos temas.

### ¿Qué diferencia hay entre `event.target` y `event.currentTarget`?

No me queda clara la diferencia. ¿Uno es donde hice click y el otro donde puse el
listener? ¿Cuál uso en cada caso?

**Respuesta:**
Si:
- `event.target` = el elemento exacto donde hiciste el clic.
- `event.currentTarget` = el elemento donde está puesto el listener (el que está escuchando ahora).

En tu caso, el `event.target` de tu listener funciona genial porque podes detectar el clic de los botones sin tener que agregar un addEventListener en cada uno.

En la mayoría de los casos vas a querer usar `event.target` porque lo que te interesa es hacer eso mismo. Usar `event.currentTarget` te sirve en casos muy especiales, ahora no se me ocurre uno, y precisamente es porque son demasiado especiales 😅

### ¿Y para qué sirve `.closest()` exactamente?

Si el click ya fue en el botón, ¿por qué necesito subir por los padres?
El comentario del código dice que es "por si el botón tuviera un icono dentro",
pero mi botón no tiene iconos. ¿Lo estoy poniendo por si acaso o hay más razones?

**Respuesta:**
Es defensa, y está bien ponerlo siempre en delegación de eventos.

Hoy tu botón es solo texto, pero es muy común que un botón lleve un ícono adentro (un svg, un span). Cuando eso pase, el clic puede caer en el ícono y `event.target` va a ser el ícono, no el botón.

`.closest()` sube por los padres hasta encontrar el primer `.button-apply-job` y te salva.

En tu caso no es necesario, pero es una buena práctica porque no sabes como puede evolucionar tu código, y tener un listener anti-svgs te puede salvar de un error de funcionalidad grande.

Ha pasado por ejemplo (y me ha pasado en sitios para hacer trámites), que si el botón tiene un icon y le doy clic justo ahí, no pasa nada. Le tengo que dar precisamente en el texto. 

Hacerlo con `closest()` evita esto.

### ¿Es mejor `classList.add('is-applied')` o `style.backgroundColor = 'green'`?

Al principio lo hice con `style` y el color no cambiaba (resultó ser la `transition`).
Ahora uso una clase. ¿Cuál es la forma "correcta" y por qué? ¿Cuándo está bien usar
`style` directamente?

**Respuesta:**
Bien, siempre es mejor con las clases por orden de prioridad. Si le agregas directamente el style, el orden de prioridad siempre va a priorizar el color que pusiste en el style, y toda clase que pongas luego (sea con JS o CSS) no va a afectar.

### `disabled = true` y `pointer-events: none` hacen lo mismo, ¿no?

Los dos impiden pulsar el botón. ¿Por qué usar los dos? ¿Alguno es "más de verdad"
que el otro?

**Respuesta:**
El que funciona de verdad es `disabled`, es el atributo de HTML que hace que el botón en todos sus aspectos esté deshabilitado: visualmente, funcionalmente en el navegador y para los lectores de pantalla.

`pointer-events: none` es solo visual: el mouse no le pega, pero el botón sigue habilitado para el navegador y los lectores de pantalla.

Se pueden usar los dos para que `pointer-events: none` le de un aspecto visual diferente al que le puede dar `disabled`, pero solo para la parte visual. Si queremos deshabilitar un botón tenemos que usar `disabled`.

## Tercer, cuarto y quinto desafío | Los filtros

### ¿Por qué hay que guardar la lista completa en `todosLosEmpleos`?

Al principio filtraba sobre la lista que ya estaba pintada, y cuando borraba el texto
del buscador los empleos no volvían. Ya entendí que es porque los había perdido...
pero, ¿hay alguna forma de "recuperar" lo que había sin guardarlo aparte?

**Respuesta:**
No, y de hecho tiene sentido que sea así.
El estado tiene que vivir en JavaScript, el DOM solo lo pinta.

Con esto en mente, lo que hacemos es actualizar el estado del array que tenemos guardado y luego solo lo pintamos con HTML.

Pensando así separamos responsabilidades, la lógica y estado se la dejamos a JS y el HTML solo lo usamos para mostrar.

### ¿Por qué comparo con `empleo.data.modalidad` y no con `empleo.ubicacion`?

En el JSON hay dos cosas parecidas: `ubicacion` dice `"Ciudad de México"` y
`data.modalidad` dice `"cdmx"`. Entiendo que el segundo coincide con el `value` del
`<select>`, pero ¿por qué los datos vienen así, con la misma información dos veces?
¿Es normal en una API real?

**Respuesta:**
Bueno, aquí hacemos un poco de culpa porque fue un mal diseño de datos nuestro. Lo pudimos hacer mejor y evitar este tipo de confusiones.

Si es normal en una API: lo normal es que venga bien, pero hay APIs que dejan mucho que desear, sea por mal diseño o porque la usan muchas personas y cada actualización que hacen tienen que conservar los datos antiguos + los nuevos.

### ¿Por qué el filtro de tecnología usa `.includes()` y el de nivel usa `===`?

Me confundí bastante aquí. Ahora sé que `technology` es un **array** y `nivel` es un
**texto**, y que el `.includes()` del array no es el mismo `.includes()` del texto.
¿Es normal que dos métodos con el mismo nombre hagan cosas distintas?

**Respuesta:**
Es normal, la funcionalidad en sí es la misma, lo que cambia es el comportamiento que tienen en base al dato con el que trabajan.

Nosotros en un array podemos hacer un `.includes()` para saber si un elemento está en el array. Pero en un texto, lo que viene siendo "elemento" es una unidad de él, por lo tanto una letra por ejemplo.

### ¿Por qué `input` y no `change` en el buscador?

Probé con `change` y no pasaba nada hasta que hacía click fuera del input.
¿Cuándo se dispara exactamente cada uno? ¿Y por qué en los `<select>` sí uso `change`?

**Respuesta:**
- `input` dispara con cada cambio del campo: cada tecla, cada borrado.
- `change` dispara cuando el valor "se confirma": haces clic fuera del input o cambiás de campo. Por eso con `change` no pasaba nada hasta que hacias clic afuera.

En los `<select>` se usa `change` porque su valor cambia de golpe con un click (no hay teclas intermedias): elegir una opción ya es el cambio confirmado.

## Sobre la organización del código

### ¿Por qué los tres scripts pueden importarse entre ellos?

`filters.js` hace `import { cargarEmpleos } from './fetch-data.js'`, pero los dos
archivos están puestos como `<script>` en el HTML. ¿No se están ejecutando dos veces?
¿Qué hace exactamente el `type="module"` del HTML para que esto funcione?

**Respuesta:**
Me gustó esta pregunta.
No se ejecuta dos veces precisamente por el `type="module"`.
Lo que hace es que cada archivo se transforme en un módulo y el navegador hace que:
- Cada módulo se evalúe una sola vez, no importa cuántos archivos lo importen.
- Los módulos se puedan compartir entre ellos con `import`/`export`.

Por eso es que no lo ejecutamos dos veces.

El navegador cuando lee el HTML evalúa cada archivo que tenemos como `<script>` y luego se ejecuta cuando nosotros lo solicitamos.

### ¿El `fetch` se hace una vez o dos?

Si `fetch-data.js` pide los datos y `filters.js` también llama a `cargarEmpleos()`,
¿el navegador descarga el archivo dos veces? Entiendo que el truco de guardar la
promesa lo evita, pero no sé si lo he entendido bien o simplemente me funciona.

**Respuesta:**
Se hace una sola vez.

Si seguimos la lógica de la respuesta anterior:
Los módulos se evalúan una vez -> `promesaDeEmpleos` se crea una vez -> la segunda llamada a `cargarEmpleos()` encuentra que ya no es `null` y devuelve esa misma promesa guardada.

### ¿Por qué se pone `event.preventDefault()` en el `submit` del formulario?

Si yo no he puesto ningún `action` en el `<form>`, ¿qué intenta hacer el navegador
al pulsar Enter? ¿A dónde iría?

**Respuesta:**
Si no pones `action` el valor por defecto es hacer submit del formulario a la misma URL en la que está.

Por eso recarga el sitio de igual forma. La manera de evitar esto es con `event.preventDefault()` independientemente de si cambiamos el valor de `action` o si usamos el que le queda por defecto.