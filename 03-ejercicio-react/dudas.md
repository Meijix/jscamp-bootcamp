# Aquí puedes dejar tus dudas

## Primera parte

<!-- Dudas de la primera parte del ejercicio -->

### ¿Por qué el nombre del componente tiene que empezar en mayúscula?

Si escribo `<header />` React lo trata como etiqueta HTML y si escribo `<Header />`
como componente mío. Funciona, pero me parece muy frágil que todo dependa de una
letra. ¿No hay una forma más explícita de decírselo a React?

### ¿`export function` o `export default`? No sé cuál elegir

El ejercicio pide export nombrado y `App.jsx` usa `export default`. ¿Hay alguna
diferencia real o es solo cuestión de gustos? ¿Por qué uno se importa con llaves
y el otro no?

### ¿Por qué es `className` y no `class`?

Sé que `class` es palabra reservada de JavaScript, pero el JSX no es JavaScript
normal... ¿o sí? ¿Qué está pasando realmente cuando escribo HTML dentro de un `.jsx`?

### ¿Qué es exactamente el JSX? ¿Lo entiende el navegador?

Porque yo escribo etiquetas dentro de un archivo `.js` y eso normalmente daría error
de sintaxis. ¿Quién lo traduce? ¿Vite? ¿React? ¿Y a qué lo traduce?

### ¿Por qué el `style` lleva dos llaves: `style={{ color: 'white' }}`?

Me lío siempre. ¿Una llave es "aquí va JavaScript" y la otra es el objeto?
¿Y por qué las propiedades van en `camelCase` (`textDecoration`) si en CSS se
escriben con guion?

### ¿Es normal partir el código en tantos archivos?

`App.jsx` tenía 180 líneas y ahora tengo 8 archivos. ¿No es peor tener que saltar
entre tantos sitios? ¿Cómo sé cuándo un componente ya es "demasiado grande"?

## Segunda parte

<!-- Dudas de la segunda parte del ejercicio -->

### ¿Cómo puedo importar un `.json` sin hacer `fetch`?

Vengo del ejercicio 2, donde tuve que usar `fetch` para leer `data.json`. Aquí hago
`import data from '../data.json'` y ya está. ¿Por qué ahora sí se puede? ¿Es cosa de
Vite? ¿Y eso se descarga igual cuando alguien entra en mi web?

### ¿Por qué no puedo poner un `if` dentro del JSX?

He intentado escribir `{if (jobs.length === 0) ...}` y da error, pero un `&&` o un
ternario sí funcionan. ¿Cuál es la diferencia? Alguien me dijo "expresiones sí,
sentencias no" y me quedé igual.

### ¿Por qué `{jobs.length && <p>...</p>}` pinta un 0 en pantalla?

Esto me volvió loco. Si no hay empleos, en vez de no pintar nada me sale un "0"
suelto en medio de la página. ¿Por qué React decide pintar el número?

### ¿Por qué hay que usar `.map()` y no un bucle `for`?

En JavaScript normal usaría un `for`. Aquí todo el mundo usa `.map()`. ¿Es porque
`.map()` **devuelve** algo y el `for` no?

## Tercera parte

<!-- Dudas de la tercera parte del ejercicio -->

### Las props, ¿son como los parámetros de una función?

Porque se parecen mucho. Pero entonces, ¿por qué llegan todas metidas dentro de un
objeto en vez de una a una?

### ¿Qué es eso de `{ job }` en `function JobCard({ job })`?

Sé que se llama destructuring y que es lo mismo que `props.job`, pero me cuesta
leerlo. ¿Cuándo conviene usarlo y cuándo es mejor dejar `props` a secas?

### ¿Por qué React se queja tanto con la prop `key`?

Le pongo `key={job.id}` porque me lo pide, pero no sé qué hace con ella.
Si le pongo el índice del array también funciona y no se queja... ¿entonces por qué
todo el mundo dice que no use el índice?

### Si cada `JobCard` tiene su propio `useState`, ¿son estados distintos?

Es decir: si aplico a un empleo, ¿por qué no se ponen todos los botones en
"Aplicado"? Si el código del componente es el mismo, ¿cómo sabe React que hay
que guardar un estado diferente para cada tarjeta?

### ¿Por qué `onClick={handleApplyClick}` y no `onClick={handleApplyClick()}`?

Con los paréntesis la página se me quedaba colgada o hacía cosas raras al cargar.
Entiendo que uno "pasa la función" y el otro "la ejecuta", pero me cuesta verlo
cuando lo leo.

## Cuarta parte

<!-- Dudas de la cuarta parte del ejercicio -->

### ¿Qué hace `Array.from({ length: totalPages }, (_, i) => i + 1)`?

Esta línea me parece indescifrable. ¿Por qué se le pasa un objeto con `length`?
¿Y qué es ese `_` del principio? ¿Es una variable de verdad?

### ¿Qué es un CSS Module y por qué el archivo se llama `.module.css`?

Uso `styles.pagination` en vez de `"pagination"` y no entiendo qué gano.
¿Los estilos normales de `index.css` no valían?

### ¿Por qué el hijo no puede cambiar el estado del padre directamente?

`Pagination` recibe `onPageChange` y llama a esa función. ¿Por qué no puede
modificar `currentPage` y ya? Entiendo que "los datos bajan y los eventos suben",
pero no entiendo qué problema resolvería saltarse esa regla.

### ¿Qué es esta función que devuelve otra función?

```js
const handlePageClick = (page) => (event) => { ... }
```

He tenido que mirarla diez veces. ¿Cuándo se ejecuta cada una de las dos flechas?

## Quinta parte

<!-- Dudas de la quinta parte del ejercicio -->

### ¿Qué es un input "controlado" y por qué no me deja escribir si me olvido del `onChange`?

Puse `value={searchText}` y el input se quedó congelado. Es de los errores más raros
que me han pasado: parece que el teclado no funciona. ¿Por qué React lo hace así?

### ¿Por qué el resultado del filtro NO se guarda en un `useState`?

Yo habría hecho `const [empleosFiltrados, setEmpleosFiltrados] = useState([])` y un
`useEffect` para actualizarlo. En el código simplemente se calcula con un `.filter()`
en medio del componente. ¿No se recalcula eso en cada render? ¿No es un desperdicio?

### El debounce: ¿por qué hace falta un `useRef` para el temporizador?

¿No podría guardar el id del `setTimeout` en una variable normal? ¿O en un `useState`?
No termino de ver qué problema resuelve el `useRef` aquí.

### ¿Qué es `useCallback` y por qué solo hace falta en algunos sitios?

El comentario del código dice que sin él se rompe el debounce. Lo he leído tres veces
y sigo sin visualizar el bucle. ¿Cómo sé, mirando mi código, cuándo lo necesito de
verdad y cuándo lo estoy poniendo por miedo?

### El array de dependencias del `useEffect`, ¿qué pasa si me equivoco?

¿Qué diferencia hay entre dejarlo vacío `[]`, ponerle cosas, o no ponerlo?
He visto que si no lo pongo se ejecuta infinitas veces, pero no entiendo por qué.

## Sexta parte

<!-- Dudas de la sexta parte del ejercicio -->

### ¿Por qué `Math.ceil` y no `Math.round` para calcular las páginas?

Con 12 resultados y 5 por página me salen 2.4 páginas. `Math.round` daría 2 y se
perderían 2 empleos, ¿verdad? ¿Es por eso que siempre se redondea hacia arriba?

### ¿`slice` modifica el array original o no?

Me lío mucho con qué métodos de array modifican y cuáles no (`slice` vs `splice`,
`sort`, `push`...). ¿Hay alguna forma de acordarse o hay que memorizarlo?

### ¿Por qué hay que volver a la página 1 al filtrar?

Me pasó jugando: estaba en la página 3, escribí en el buscador y me quedé mirando una
página vacía porque ya solo había 1 página de resultados. ¿Se soluciona solo poniendo
`setCurrentPage(1)` o hay más casos parecidos que se me escapan?

## Séptima parte

<!-- Dudas de la séptima parte del ejercicio -->

### ¿Qué diferencia hay entre `<a href="/search">` y mi `<Link href="/search">`?

Visualmente son idénticos. Sé que uno recarga la página y el otro no, pero
¿por qué recargar es tan malo? La página vuelve a aparecer igual...

### ¿Qué es `history.pushState` y por qué hay que "inventarse" un evento después?

Esta parte me parece un apaño rarísimo:

```js
window.history.pushState({}, '', path)
window.dispatchEvent(new PopStateEvent('popstate'))
```

¿Por qué el navegador no avisa solo de que la URL ha cambiado?

### ¿Qué es `children` y por qué es especial?

Entiendo que es "lo que va entre las etiquetas de apertura y cierre", pero
¿por qué se llama así? ¿Se lo pone React automáticamente?

### ¿Qué hacen los tres puntos en `...restOfProps`?

A veces los veo para copiar objetos (`{...job}`), a veces para arrays, y aquí para
recoger props. ¿Es el mismo operador haciendo tres cosas distintas?

### Si cada componente llama a `useRouter()`, ¿hay un estado o muchos?

`Header`, `Route` y `App` llaman todos al hook. ¿Cada uno tiene su propio
`currentPath` por separado? Si es así, ¿cómo es que se mantienen sincronizados?

### ¿Por qué el 404 no funcionaba leyendo `window.location.pathname` directamente?

La URL cambiaba pero la página del 404 se quedaba en pantalla. ¿Por qué React no se
entera de que `window.location` ha cambiado? ¿Qué tiene que pasar para que un
componente se vuelva a pintar?

### Si recargo la página en `/search`, ¿por qué da error 404 del servidor?

En el navegador funciona todo, pero si pulso F5 en `/search` a veces falla.
¿Eso es culpa de mi router o del servidor? ¿Cómo lo arreglan las webs reales?

## Ejercicio extra

<!-- Dudas del ejercicio extra -->

### Si uso la API en vez del JSON, ¿el filtrado lo hace mi código o el servidor?

Me cuesta ver dónde conviene hacer cada cosa. ¿Cuándo es mejor traerse todos los
datos y filtrar en el navegador, y cuándo es mejor pedirle al servidor ya filtrado?

### ¿Qué pasa si el usuario cambia de filtro mientras la petición anterior sigue en camino?

Se me ocurrió que podrían llegar en orden equivocado y mostrarse resultados viejos.
¿Es un problema real? ¿Se soluciona con algo o me estoy preocupando de más?

### ¿Está bien cambiar el título de la pestaña con `document.title` en un `useEffect`?

Me suena a "hacer trampa", porque estoy tocando el DOM a mano en una app de React,
que es justo lo que React intenta evitar. ¿Hay una forma más correcta?
