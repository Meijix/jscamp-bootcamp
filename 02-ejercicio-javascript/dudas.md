<!-- Aquí puedes introducir tus dudas sobre el ejercicio, la consigna, la corrección, etc -->

# Mis dudas del ejercicio de JavaScript

## Primer desafío | fetch y mostrar los datos

### ¿Por qué `fetch` necesita DOS `.then()` seguidos?

Esto es lo que más me costó. Yo esperaba que `fetch('./data.json')` me devolviera
directamente los empleos, pero me devuelve algo llamado `Response` y hay que llamar
a `.json()` encima. ¿Por qué no me da los datos directamente? ¿Qué es esa respuesta
intermedia?

### ¿Por qué mi `console.log(empleos)` sale `undefined` o `Promise {<pending>}`?

Me pasó al principio. Escribí algo así:

```js
const empleos = fetch('./data.json')
console.log(empleos) // Promise {<pending>}
```

Y no entendía nada. Ahora sé que hay que esperar, pero no me queda claro **por qué**
JavaScript no espera solo. ¿Sigue ejecutando el resto del código mientras tanto?

### ¿Cuál es la diferencia entre `.then()` y `async/await`?
¿Son dos formas de hacer exactamente lo mismo y elijo la
que más me guste, o hay casos donde uno sirve y el otro no?

### ¿Por qué hay que hacer `.join('')` después del `.map()`?

Si no lo pongo, aparecen comas entre cada empleo. Entiendo que el `.map()` me deja un
array, pero... ¿por qué al meter un array en `innerHTML` JavaScript decide poner comas?
¿Quién decide eso?

### ¿Por qué hay que vaciar la lista con `listaEmpleos.innerHTML = ''` antes de pintar?

Lo entendí cuando filtré y se me acumulaban los empleos unos debajo de otros.
Pero, ¿no hay una forma más "limpia" de hacerlo que borrar todo y volver a pintar?
¿No es muy lento repintar 15 empleos cada vez que escribo una letra?

## Segundo desafío | El botón de "Aplicar"

### ¿Por qué `querySelectorAll('.button-apply-job')` no encuentra nada?

Esta es LA duda del ejercicio. Los botones se ven en pantalla, están ahí, pero mi
código dice que hay cero. Me han explicado que es porque todavía no existen cuando
se ejecuta mi script... pero entonces, ¿cómo sé yo cuándo "ya existen"?

### La delegación de eventos: ¿el evento sube o baja?

Pongo el listener en el `<ul>` y funciona al hacer click en un botón que está dentro.
Sé que se llama "burbujeo", pero no me imagino bien qué pasa por dentro.
¿El click se dispara primero en el botón y luego en el `<ul>`, o al revés?

### ¿Qué diferencia hay entre `event.target` y `event.currentTarget`?

No me queda clara la diferencia. ¿Uno es donde hice click y el otro donde puse el
listener? ¿Cuál uso en cada caso?

### ¿Y para qué sirve `.closest()` exactamente?

Si el click ya fue en el botón, ¿por qué necesito subir por los padres?
El comentario del código dice que es "por si el botón tuviera un icono dentro",
pero mi botón no tiene iconos. ¿Lo estoy poniendo por si acaso o hay más razones?

### ¿Es mejor `classList.add('is-applied')` o `style.backgroundColor = 'green'`?

Al principio lo hice con `style` y el color no cambiaba (resultó ser la `transition`).
Ahora uso una clase. ¿Cuál es la forma "correcta" y por qué? ¿Cuándo está bien usar
`style` directamente?

### `disabled = true` y `pointer-events: none` hacen lo mismo, ¿no?

Los dos impiden pulsar el botón. ¿Por qué usar los dos? ¿Alguno es "más de verdad"
que el otro?

## Tercer, cuarto y quinto desafío | Los filtros

### ¿Por qué hay que guardar la lista completa en `todosLosEmpleos`?

Al principio filtraba sobre la lista que ya estaba pintada, y cuando borraba el texto
del buscador los empleos no volvían. Ya entendí que es porque los había perdido...
pero, ¿hay alguna forma de "recuperar" lo que había sin guardarlo aparte?

### ¿Por qué comparo con `empleo.data.modalidad` y no con `empleo.ubicacion`?

En el JSON hay dos cosas parecidas: `ubicacion` dice `"Ciudad de México"` y
`data.modalidad` dice `"cdmx"`. Entiendo que el segundo coincide con el `value` del
`<select>`, pero ¿por qué los datos vienen así, con la misma información dos veces?
¿Es normal en una API real?

### ¿Por qué el filtro de tecnología usa `.includes()` y el de nivel usa `===`?

Me confundí bastante aquí. Ahora sé que `technology` es un **array** y `nivel` es un
**texto**, y que el `.includes()` del array no es el mismo `.includes()` del texto.
¿Es normal que dos métodos con el mismo nombre hagan cosas distintas?

### ¿Por qué `input` y no `change` en el buscador?

Probé con `change` y no pasaba nada hasta que hacía click fuera del input.
¿Cuándo se dispara exactamente cada uno? ¿Y por qué en los `<select>` sí uso `change`?

## Sobre la organización del código

### ¿Por qué los tres scripts pueden importarse entre ellos?

`filters.js` hace `import { cargarEmpleos } from './fetch-data.js'`, pero los dos
archivos están puestos como `<script>` en el HTML. ¿No se están ejecutando dos veces?
¿Qué hace exactamente el `type="module"` del HTML para que esto funcione?

### ¿El `fetch` se hace una vez o dos?

Si `fetch-data.js` pide los datos y `filters.js` también llama a `cargarEmpleos()`,
¿el navegador descarga el archivo dos veces? Entiendo que el truco de guardar la
promesa lo evita, pero no sé si lo he entendido bien o simplemente me funciona.

### ¿Por qué se pone `event.preventDefault()` en el `submit` del formulario?

Si yo no he puesto ningún `action` en el `<form>`, ¿qué intenta hacer el navegador
al pulsar Enter? ¿A dónde iría?
