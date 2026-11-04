# Aquí puedes dejar tus dudas

## Primera parte

<!-- Dudas de la primera parte del ejercicio -->

### ¿Por qué el nombre del componente tiene que empezar en mayúscula?

Si escribo `<header />` React lo trata como etiqueta HTML y si escribo `<Header />`
como componente mío. Funciona, pero me parece muy frágil que todo dependa de una
letra. ¿No hay una forma más explícita de decírselo a React?

**Respuesta:**
Hola! Buena pregunta.
En realidad es la forma más explícita que hay. JSX no es HTML, y la mayúscula es lo único que le dice al compilador cómo interpretar la etiqueta:

- `<header />` (minúscula) se convierte en un string: `jsx('header')`. Es "creá la etiqueta HTML header".
- `<Header />` (mayúscula) se convierte en una variable: `jsx(Header)`. Busca lo que importaste con ese nombre.
(Así es como funciona internamente)

React no adivina tu intención: mira el tipo. String = etiqueta del navegador, función = tu componente. Si te olvidás el import, el error es "Header is not defined" y no un `<header>` silencioso, lo cual está buenísimo.

### ¿`export function` o `export default`? No sé cuál elegir

El ejercicio pide export nombrado y `App.jsx` usa `export default`. ¿Hay alguna
diferencia real o es solo cuestión de gustos? ¿Por qué uno se importa con llaves
y el otro no?

**Respuesta:**
Hay diferencias reales si.

- Nombrado: `export function Header()`. Se importa con llaves y el nombre tiene que coincidir: `import { Header } from './Header.jsx'`. Podés exportar varios componentes o variables del mismo archivo.
- Default: `export default App`. Se importa sin llaves y con el nombre que quieras: `import LoQueSea from './App.jsx'`. Uno por archivo.

El default es más cómodo pero más peligroso: podés escribir `import CualquierCosa from './Header.jsx'` y nadie te avisa; al renombrar, el editor no siempre te sigue. El nombrado obliga al mismo nombre en todos lados, el autocompletado anda mejor y los errores de import salen temprano.

A modo personal prefiero nombrado (por eso lo pide el ejercicio). En `App.jsx` default está bien: es el componente que monta `main.jsx` y tiene sentido que sea el export del archivo. Lo importante es no mezclar criterios dentro del mismo archivo.

Como regla, App.jsx no hay problema que sea default (es el único archivo que va a tener esa responsabilidad), pero a la hora de montar componentes, cuyos nombres pueden ser repetidos a lo largo de una palicación, es importante que sean nombrados para no confundirnos.

### ¿Por qué es `className` y no `class`?

Sé que `class` es palabra reservada de JavaScript, pero el JSX no es JavaScript
normal... ¿o sí? ¿Qué está pasando realmente cuando escribo HTML dentro de un `.jsx`?

**Respuesta:**
Ahí está el truco, JSX sí es JavaScript: Se le dice "azúcar para llamar a una función" que arma un objeto. Ese "HTML" no es texto, es código, así que `class` te choca con la palabra reservada del lenguaje (en modo estricto ni siquiera podés usar `class` como identificador).

React eligió `className` porque así se llama la propiedad en el DOM (`elemento.className`) y porque historicamente no se puede usar `class` por ser palabra resrvada. Igual te comento algo... a partir de React 19 ahora se puede aceptar `class` pero con algunas matices:
- aparece un Warning avisandote (sin romper la aplicación)
- Internamente hace algunos procesos para detectar que es un `className` y no un `class` de JS.

### ¿Qué es exactamente el JSX? ¿Lo entiende el navegador?

Porque yo escribo etiquetas dentro de un archivo `.js` y eso normalmente daría error
de sintaxis. ¿Quién lo traduce? ¿Vite? ¿React? ¿Y a qué lo traduce?

**Respuesta:**
Bien, por partes: El navegador no entiende JSX (ningún navegador sabe qué es `<h1>` escrito en un `.jsx`). Lo traduce Vite: en desarrollo al vuelo, y en el build con algo llamado esbuild y/o SWC.

`<h1>Hola</h1>` se convierte en algo así como `jsx('h1', { children: 'Hola' })`, que devuelve un objeto plano que describe lo que hay que pintar. Después React compara esa descripción con el DOM real y aplica el mínimo cambio necesario aplicando las operaciones necesarias para actualizar el DOM.

### ¿Por qué el `style` lleva dos llaves: `style={{ color: 'white' }}`?

Me lío siempre. ¿Una llave es "aquí va JavaScript" y la otra es el objeto?
¿Y por qué las propiedades van en `camelCase` (`textDecoration`) si en CSS se
escriben con guion?

**Respuesta:**
Exacto: una llave es de JSX ("acá va JavaScript") y la otra es el objeto literal.

En JSX, los atributos con llaves esperan una expresión. Y `style` no recibe un string como en HTML, recibe un objeto: `{ color: 'white' }`. Juntando las dos cosas queda `style={{ color: 'white' }}`.

camelCase porque es un objeto de JavaScript que termina aplicándose sobre `elemento.style`, y las propiedades del DOM también van en camelCase (`elemento.style.textDecoration = 'none'`). El guion solo existe dentro del texto de un `.css` y aquí seguimos en `.js`.

### ¿Es normal partir el código en tantos archivos?

`App.jsx` tenía 180 líneas y ahora tengo 8 archivos. ¿No es peor tener que saltar
entre tantos sitios? ¿Cómo sé cuándo un componente ya es "demasiado grande"?

**Respuesta:**
Sí, es normal, y es una de las cosas que React premia.

No midas por líneas, medí por responsabilidad: si para entender qué pinta un componente tenés que scrollear medio archivo, se parte. Cada componente debería encargarse de una cosa (el header, una tarjeta, la paginación).

Lo que ganás es reutilización (`JobCard` sirve en cualquier lista) y aislamiento (tocás `Pagination` y no podés romper `Header`). Lo que si perdés es: saltar entre archivos, y eso se compensa con nombres claros y Ctrl+Click en el editor.

Al revés también vale: si un subcomponente vive dentro del mismo archivo y nunca se reutiliza, no hay drama en dejarlo ahí.

## Segunda parte

<!-- Dudas de la segunda parte del ejercicio -->

### ¿Cómo puedo importar un `.json` sin hacer `fetch`?

Vengo del ejercicio 2, donde tuve que usar `fetch` para leer `data.json`. Aquí hago
`import data from '../data.json'` y ya está. ¿Por qué ahora sí se puede? ¿Es cosa de
Vite? ¿Y eso se descarga igual cuando alguien entra en mi web?

**Respuesta:**
Sí, es cosa de Vite en su parte de bundler. Al hacer el build, Vite lee el JSON, lo convierte en un objeto y lo mete dentro del bundle. No hay request en el navegador: los datos ya vienen en el `.js` que se descarga al abrir la app.

Es distinto de `fetch`: ahí el archivo vive aparte y se pide en runtime. Con `import` es sincrónico y ya está en memoria.

El costo de esto y por eso aquí está bien pero en proyectos reales no: ese JSON viaja siempre en el bundle, lo uses o no. 8 KB no importa; un dataset de 5 MB sí (y encima no se puede cachear aparte). Por eso los datos grandes o que cambian seguido van por API.

Así que sí: se descarga igual que el resto del código de la app, pero no como una request aparte.

### ¿Por qué no puedo poner un `if` dentro del JSX?

He intentado escribir `{if (jobs.length === 0) ...}` y da error, pero un `&&` o un
ternario sí funcionan. ¿Cuál es la diferencia? Alguien me dijo "expresiones sí,
sentencias no" y me quedé igual.

**Respuesta:**
Dentro de `{}` solo puede ir una expresión: algo que produce un valor. `if (...) { ... }` es una sentencia: una instrucción de control, no produce nada.

`cond ? a : b` y `cond && a` son expresiones: devuelven un valor, así que React puede pintarlo. `if` devuelve nada, entonces no hay nada que pintar.

No es capricho de React sino que es JavaScript puro. `const x = if (true) 1` tampoco compila.

Cuando necesitás un if de verdad, va fuera del JSX:

```jsx
if (jobs.length === 0) return <p>No hay resultados</p>
return <div>...</div>
```

### ¿Por qué `{jobs.length && <p>...</p>}` pinta un 0 en pantalla?

Esto me volvió loco. Si no hay empleos, en vez de no pintar nada me sale un "0"
suelto en medio de la página. ¿Por qué React decide pintar el número?

**Respuesta:**
Porque `&&` no devuelve `true`/`false`: devuelve uno de los dos operandos.

- Si `jobs.length` es 3 -> devuelve `<p>...</p>` y lo pinta.
- Si es 0 (falsy) -> devuelve `0`... y React pinta el `0` como texto.

React ignora `false`, `null`, `undefined` y `''`, pero `0` es un número y los números se pintan.

Se arregla haciendo que el operando de la izquierda sea booleano:

```jsx
{jobs.length > 0 && <p>...</p>}
```

En tu `JobListings` ya usás `=== 0`, así que estás a salvo. Esta es de las trampas más clásicas de React.

### ¿Por qué hay que usar `.map()` y no un bucle `for`?

En JavaScript normal usaría un `for`. Aquí todo el mundo usa `.map()`. ¿Es porque
`.map()` **devuelve** algo y el `for` no?

**Respuesta:**
Sí, exactamente por eso. `.map()` devuelve un array nuevo con el resultado de la función, y React sabe pintar un array de nodos. Un `for` no devuelve nada, así que no podés ponerlo donde se espera un valor.

Se puede hacer con `for`, pero te obliga a armarlo antes:

```jsx
const items = []
for (const job of jobs) items.push(<JobCard key={job.id} job={job} />)
```

Funciona, pero es más verboso y te tenés que acordar del `push`. `.map()` es la versión declarativa: "tomá cada elemento y transformalo", sin decirle cómo iterar.

## Tercera parte

<!-- Dudas de la tercera parte del ejercicio -->

### Las props, ¿son como los parámetros de una función?

Porque se parecen mucho. Pero entonces, ¿por qué llegan todas metidas dentro de un
objeto en vez de una a una?

**Respuesta:**
Sí, es la misma idea: datos que entran desde afuera y que el componente no debería modificar.

Llegan en un solo objeto porque un componente es una función, y para poder llamarlo con props distintas sin cambiar su firma, React arma un objeto con todo. `function JobCard(props)` recibe `props = { job: {...} }`.

Así, si mañana querés agregar `onApply`, lo pasás y listo: no cambió la definición del componente. Ese objeto también trae cosas especiales como `children`.

### ¿Qué es eso de `{ job }` en `function JobCard({ job })`?

Sé que se llama destructuring y que es lo mismo que `props.job`, pero me cuesta
leerlo. ¿Cuándo conviene usarlo y cuándo es mejor dejar `props` a secas?

**Respuesta:**
Bien, si el componente usa una o dos props, `{ job }` se lee mucho mejor que repetir `props.job` cinco veces. Si son muchas (5+), es más legible `props` a secas, o destructurar en el cuerpo solo lo que uses:

```jsx
export function JobCard(props) {
  const { job } = props
```

Ninguna es incorrecta: es legibilidad.

### ¿Por qué React se queja tanto con la prop `key`?

Le pongo `key={job.id}` porque me lo pide, pero no sé qué hace con ella.
Si le pongo el índice del array también funciona y no se queja... ¿entonces por qué
todo el mundo dice que no use el índice?

**Respuesta:**
`key` no es una prop normal: React la consume para sí y no llega al componente. Para qué la usa: para identificar cada elemento entre renders.

Cuando la lista cambia (filtrás, ordenás, borrás uno), React compara "esto es el mismo elemento que antes, solo que en otra posición" y reutiliza el DOM y el ESTADO de ese componente. Sin `key`, se guía por la posición.

Por eso el índice es mala idea: tenés [A, B, C] con keys 0,1,2 y filtrás B -> quedan [A, C] con keys 0,1. React cree que C es el viejo B y le pasa su estado... en tu app, la tarjeta de C aparecería como "Aplicado". Con `job.id` cada tarjeta mantiene su identidad. No se si quedó claro o entreveré más, pero la idea es que siempre cada elemento necesita un identificador único que no dependa de su mapeo.

### Si cada `JobCard` tiene su propio `useState`, ¿son estados distintos?

Es decir: si aplico a un empleo, ¿por qué no se ponen todos los botones en
"Aplicado"? Si el código del componente es el mismo, ¿cómo sabe React que hay
que guardar un estado diferente para cada tarjeta?

**Respuesta:**
Son estados distintos. Cada vez que React renderiza `<JobCard />`, crea una instancia del componente con su propio espacio de estado. No existe "el estado de JobCard": existen 15 estados independientes que casualmente usan el mismo código.

¿Cómo los distingue? Por la posición en el árbol, el tipo de componente y la `key`. Por eso la `key` importa tanto: le dice "esta instancia es la del empleo X", y cuando filtrás o reordenás se queda con el estado correcto.

### ¿Por qué `onClick={handleApplyClick}` y no `onClick={handleApplyClick()}`?

Con los paréntesis la página se me quedaba colgada o hacía cosas raras al cargar.
Entiendo que uno "pasa la función" y el otro "la ejecuta", pero me cuesta verlo
cuando lo leo.

**Respuesta:**
Exacto! Uno pasa la función, el otro la ejecuta en ese mismo momento y pasa su resultado.

- `onClick={handleApplyClick}` -> "cuando hagan click, llamá a esto". Es lo que querés.
- `onClick={handleApplyClick()}` -> "llamá a esto ahora y pasale a `onClick` lo que devuelva" (undefined).

Y ahí viene el cuelgue: llamarla en el render ejecutaba `setIsApplied(true)` durante el render -> render -> setState -> render -> setState... bucle infinito practicamente.

Cuando necesitás pasarle un argumento, se usa la flecha: `onClick={() => handlePageClick(2)}`, o la función que devuelve otra que usaste en `Pagination`.

## Cuarta parte

<!-- Dudas de la cuarta parte del ejercicio -->

### ¿Qué hace `Array.from({ length: totalPages }, (_, i) => i + 1)`?

Esta línea me parece indescifrable. ¿Por qué se le pasa un objeto con `length`?
¿Y qué es ese `_` del principio? ¿Es una variable de verdad?

**Respuesta:**
`Array.from` tiene dos formas. Esta es la segunda: `Array.from(algo, funcionDeMapeo)`.

El primer argumento, `{ length: totalPages }`, es un objeto que se le llama "array-like": no es un array, pero tiene `length`, y `Array.from` lo lee para saber cuántos elementos crear (los rellena con `undefined`). El segundo argumento es el map: recibe el valor y el índice, y devuelve `índice + 1` -> `[1, 2, 3, ...]`.

El `_` es una variable de verdad (el valor, que acá es `undefined`); se llama `_` por convención para decir "no la uso". Podés llamarla `valor` y funciona igual. Esto lo vas a ver en mucho JS para descartar variables que no queremos utilizar.

### ¿Qué es un CSS Module y por qué el archivo se llama `.module.css`?

Uso `styles.pagination` en vez de `"pagination"` y no entiendo qué gano.
¿Los estilos normales de `index.css` no valían?

**Respuesta:**
El `.module.css` es una señal para Vite que dice "estos estilos son de este componente, renombralos para que no choquen con nadie".

Vite convierte el archivo en un objeto con el mapeo: `{ pagination: '_pagination_x7k2a_1', isActive: '_isActive_x7k2a_7' }`. Cuando escribís `className={styles.pagination}`, el HTML final dice `_pagination_x7k2a_1`. Da igual si en otro archivo hay otra clase `.pagination`: son nombres distintos.

Ganás dos cosas: nadie te pelea por el nombre de la clase y podés borrar el archivo sabiendo que no rompe nada afuera. `index.css` es global a propósito (reset, variables, estilos base) y está perfecto; los CSS Modules son para lo específico de un componente.

### ¿Por qué el hijo no puede cambiar el estado del padre directamente?

`Pagination` recibe `onPageChange` y llama a esa función. ¿Por qué no puede
modificar `currentPage` y ya? Entiendo que "los datos bajan y los eventos suben",
pero no entiendo qué problema resolvería saltarse esa regla.

**Respuesta:**
Porque el estado es del padre y el hijo no tiene acceso: solo recibe lo que le pasan por props.

Técnicamente podría pasarle el `setCurrentPage` y que el hijo lo use, y funciona. El problema es que el padre pierde el control: hoy cambiar de página es solo `setCurrentPage`, mañana querés además scrollear arriba, cerrar un modal o registrar el evento... y eso vive en el padre. Con `onPageChange`, el hijo solo avisa "el usuario quiere la página 3" y el padre decide qué hacer (en tu caso, además hace `scrollTo`).

También te desacopla: `Pagination` no sabe si el estado es `useState`, un Context o un store (cosas que vamos a ver despues). Sabe pedir, no sabe guardar, y eso es lo mejor.

### ¿Qué es esta función que devuelve otra función?

```js
const handlePageClick = (page) => (event) => { ... }
```

He tenido que mirarla diez veces. ¿Cuándo se ejecuta cada una de las dos flechas?

**Respuesta:**
Bien, esto tiene lo suyo jaja vamos por partes:

- La primera flecha se ejecuta cuando la llamás vos: `handlePageClick(3)` "se acuerda" del 3 y devuelve el manejador.
- La segunda se ejecuta cuando ocurre el evento: React la llama con el evento al hacer click.

En el JSX escribís `onClick={handlePageClick(page)}`: la primera corre en el render (una vez por botón) y `onClick` recibe la segunda.

Es el mismo efecto que `onClick={() => onPageChange(page)}`, pero acá la función se crea una sola vez por render y no en cada click. Las dos son válidas.

## Quinta parte

<!-- Dudas de la quinta parte del ejercicio -->

### ¿Qué es un input "controlado" y por qué no me deja escribir si me olvido del `onChange`?

Puse `value={searchText}` y el input se quedó congelado. Es de los errores más raros
que me han pasado: parece que el teclado no funciona. ¿Por qué React lo hace así?

**Respuesta:**
Controlado significa que el valor visible lo manda React, no el navegador. `value={searchText}` dice "mostrá siempre esto, nada más".

Sin `onChange`, el navegador registra la tecla pero React vuelve a pintar el input con el mismo `searchText` de antes y te pisa lo escrito. No es que el teclado no funcione: React está respetando la orden.

La ventaja: el estado de JS y lo que se ve nunca se desincronizan. Ya tenés el valor para filtrar, y si querés limpiar el input, `setSearchText('')` y listo (es lo que hace tu botón x).

### ¿Por qué el resultado del filtro NO se guarda en un `useState`?

Yo habría hecho `const [empleosFiltrados, setEmpleosFiltrados] = useState([])` y un
`useEffect` para actualizarlo. En el código simplemente se calcula con un `.filter()`
en medio del componente. ¿No se recalcula eso en cada render? ¿No es un desperdicio?

**Respuesta:**
Se recalcula en cada render, sí. Y está bien: es un valor derivado, se calcula a partir de cosas que ya tenés (`data`, `searchText`, `filters`) y no tiene vida propia como si pueden ser otros valores.

Guardarlo en estado duplica la verdad: ahora tenés que acordarte de actualizarlo cada vez que cambien las cuatro cosas de las que depende, y un olvido = resultados viejos en pantalla. Calculándolo en el render es imposible que quede desincronizado y ahí está lo bueno.

¿El costo? Filtrar 15 (o 500) objetos con cuatro comparaciones es despreciable al lado del trabajo del DOM. La regla de oro creo que es: optimizá cuando midas un problema real, si algún día fuera caro, ahí sí `useMemo`.

### El debounce: ¿por qué hace falta un `useRef` para el temporizador?

¿No podría guardar el id del `setTimeout` en una variable normal? ¿O en un `useState`?
No termino de ver qué problema resuelve el `useRef` aquí.

**Respuesta:**
Porque el id tiene que sobrevivir entre renders sin provocar un render.

- Variable normal (`let id`): se reinicia en cada render y perdés la referencia del timer anterior, así que no podés cancelarlo.
- `useState`: guarda el id, pero cada `set` dispara un render -> un render extra por cada tecla, y encima cambiar el id no debería repintar nada.
- `useRef`: una caja que persiste entre renders y que al cambiar `.current` NO repinta. Es lo que necesitás para "acordate del timer para poder cancelarlo".

Por eso `timeoutRef.current = setTimeout(...)` y después `clearTimeout(timeoutRef.current)`.

### ¿Qué es `useCallback` y por qué solo hace falta en algunos sitios?

El comentario del código dice que sin él se rompe el debounce. Lo he leído tres veces
y sigo sin visualizar el bucle. ¿Cómo sé, mirando mi código, cuándo lo necesito de
verdad y cuándo lo estoy poniendo por miedo?

**Respuesta:**
`useCallback` devuelve la misma función entre renders (mientras sus dependencias no cambien). Sin él, cada render del padre crea una función nueva.

Si la función está en el array de dependencias de un `useEffect`, o la pasás a un hijo envuelto en `memo`, son dos cosas que avisan que es buena idea usar `useCallback`. Si no se cumple ninguna, no lo pongas por miedo: no aporta nada. En tu `SearchPage` las tres (`handleTextChange`, `handleFilterChange`, `handlePageChange`) cumplen la primera, y la tercera además se la pasás a `Pagination`.

### El array de dependencias del `useEffect`, ¿qué pasa si me equivoco?

¿Qué diferencia hay entre dejarlo vacío `[]`, ponerle cosas, o no ponerlo?
He visto que si no lo pongo se ejecuta infinitas veces, pero no entiendo por qué.

**Respuesta:**
Es el interruptor de "cuándo se vuelve a ejecutar".

- `[]` -> solo al montar (y la limpieza al desmontar). Para listeners, suscripciones, el fetch inicial.
- `[a, b]` -> al montar y cada vez que `a` o `b` cambien (comparación con `Object.is`).
- Sin array -> después de cada render, por eso se ejecutaba infinitas veces.

## Sexta parte

<!-- Dudas de la sexta parte del ejercicio -->

### ¿Por qué `Math.ceil` y no `Math.round` para calcular las páginas?

Con 12 resultados y 5 por página me salen 2.4 páginas. `Math.round` daría 2 y se
perderían 2 empleos, ¿verdad? ¿Es por eso que siempre se redondea hacia arriba?

**Respuesta:**
Exacto, por eso mismo :)

### ¿`slice` modifica el array original o no?

Me lío mucho con qué métodos de array modifican y cuáles no (`slice` vs `splice`,
`sort`, `push`...). ¿Hay alguna forma de acordarse o hay que memorizarlo?

**Respuesta:**
Esto es una cosa que hay que revisar todo el tiempo cuando la memoria falla, a mi me pasa también.

`slice` no modifica: devuelve un array nuevo con la copia del rango. `splice` si modifica: saca y mete cosas en el array original.

### ¿Por qué hay que volver a la página 1 al filtrar?

Me pasó jugando: estaba en la página 3, escribí en el buscador y me quedé mirando una
página vacía porque ya solo había 1 página de resultados. ¿Se soluciona solo poniendo
`setCurrentPage(1)` o hay más casos parecidos que se me escapan?

**Respuesta:**
Exacto, de hecho en cada cambio que se haga en el filtrado, debemos reiniciar el número de página a 1.

## Séptima parte

<!-- Dudas de la séptima parte del ejercicio -->

### ¿Qué diferencia hay entre `<a href="/search">` y mi `<Link href="/search">`?

Visualmente son idénticos. Sé que uno recarga la página y el otro no, pero
¿por qué recargar es tan malo? La página vuelve a aparecer igual...

**Respuesta:**
Recargar no es malo en si, el problema es lo que se pierde en una SPA:

- Se pierde todo el estado: filtros, página, lo que tenías escrito, la posición del scroll.
- Se vuelve a pedir el HTML y el bundle al servidor (aunque esté cacheado, hay trabajo).

`<Link>` cambia la URL y le pide a React que pinte otra página, sin reiniciar nada. Visualmente es igual; lo que cambia es que la app sigue viva.

### ¿Qué es `history.pushState` y por qué hay que "inventarse" un evento después?

Esta parte me parece un apaño rarísimo:

```js
window.history.pushState({}, '', path)
window.dispatchEvent(new PopStateEvent('popstate'))
```

¿Por qué el navegador no avisa solo de que la URL ha cambiado?

**Respuesta:**
Por diseño: `pushState`/`replaceState` cambian la URL sin navegar. Desde el punto de vista del navegador no pasó nada (podrías llamarlo 100 veces sin que nadie escuche), así que no dispara ningún evento.

El navegador sí dispara `popstate` cuando el usuario usa atrás/adelante, porque ahí sí hubo navegación. Como en tu caso el cambio lo hiciste vos por JS, el evento no va a llegar nunca: lo disparás a mano para que tus listeners se enteren.

Así funcionan todos los routers. React Router, por ejemplo, no depende de `popstate` para navegar: mantiene la ruta adentro de React y actualiza el estado cuando llamás a `navigate()`. Por eso nuestra versión necesita el evento y ellos no.

### ¿Qué es `children` y por qué es especial?

Entiendo que es "lo que va entre las etiquetas de apertura y cierre", pero
¿por qué se llama así? ¿Se lo pone React automáticamente?

**Respuesta:**
Sí, lo pone React: todo lo que va entre la etiqueta de apertura y la de cierre se pasa como una prop llamada `children` y es una decisión de diseño.

### ¿Qué hacen los tres puntos en `...restOfProps`?

A veces los veo para copiar objetos (`{...job}`), a veces para arrays, y aquí para
recoger props. ¿Es el mismo operador haciendo tres cosas distintas?

**Respuesta:**
Es el mismo operador haciendo dos cosas diferentes:

- Expandiendo (spread): `{...props}`, `[...a, ...b]`, `Math.max(...numeros)` -> se traduce como "desarmá esto y ponelo acá".
- Recolectando (rest): `function Link({ href, ...restOfProps })` -> se traduce como "todo lo demás, juntalo en un objeto".

### Si cada componente llama a `useRouter()`, ¿hay un estado o muchos?

`Header`, `Route` y `App` llaman todos al hook. ¿Cada uno tiene su propio
`currentPath` por separado? Si es así, ¿cómo es que se mantienen sincronizados?

**Respuesta:**
Hay muchos: cada llamada a `useRouter()` tiene sus propios `useState`, con su propia copia de `currentPath`.

Para compatir estados luego veremos zustand y otras store.

### ¿Por qué el 404 no funcionaba leyendo `window.location.pathname` directamente?

La URL cambiaba pero la página del 404 se quedaba en pantalla. ¿Por qué React no se
entera de que `window.location` ha cambiado? ¿Qué tiene que pasar para que un
componente se vuelva a pintar?

**Respuesta:**
Porque leer `window.location` en el render es leer un valor de afuera: React no tiene idea de que cambió. React repinta cuando cambia el estado o las props, y `window` no es ninguna de las dos cosas.

Pasaba esto: la URL cambiaba (porque `pushState` la cambia), pero nadie actualizaba el estado -> React no volvía a renderizar -> el 404 se quedaba congelado en pantalla.

Por eso el hook guarda la ruta en `useState` y escucha el evento: el evento actualiza el estado, y ese cambio es lo que hace que React repinte. Regla general: si un dato de afuera del árbol de React afecta lo que pintás, tiene que vivir en estado (o en un store/context).

### Si recargo la página en `/search`, ¿por qué da error 404 del servidor?

En el navegador funciona todo, pero si pulso F5 en `/search` a veces falla.
¿Eso es culpa de mi router o del servidor? ¿Cómo lo arreglan las webs reales?

**Respuesta:**
Es el servidor, no tu router.

Al recargar, el navegador le pide al servidor la URL `/search`. En el proyecto no existe ningún archivo con ese nombre, así que responde 404. Tu router ni se enteró: el JS nunca llegó a ejecutarse.

## Ejercicio extra

<!-- Dudas del ejercicio extra -->

### Si uso la API en vez del JSON, ¿el filtrado lo hace mi código o el servidor?

Me cuesta ver dónde conviene hacer cada cosa. ¿Cuándo es mejor traerse todos los
datos y filtrar en el navegador, y cuándo es mejor pedirle al servidor ya filtrado?

**Respuesta:**
Regla general: si los datos son pocos y querés respuestas instantáneas (cada tecla), filtrás en el cliente. Si el dataset es grande, paginado de verdad o cambia seguido, filtrás en el servidor.

- Cliente (lo que hiciste con el JSON): una sola descarga, filtros instantáneos. Escala bien hasta miles de registros.
- Servidor (lo que soporta la API): cada cambio de filtro es una request (ahí el debounce deja de ser un lujo), el servidor hace el trabajo y te tiene que devolver el total para calcular las páginas (`limit`/`offset`).

### ¿Qué pasa si el usuario cambia de filtro mientras la petición anterior sigue en camino?

Se me ocurrió que podrían llegar en orden equivocado y mostrarse resultados viejos.
¿Es un problema real? ¿Se soluciona con algo o me estoy preocupando de más?

**Respuesta:**
Es un problema real y tiene nombre: race condition. Si pedís "react" y después "python", la respuesta de "react" puede llegar última y pisar la pantalla con resultados que no corresponden.

Dos soluciones estándar:

1. `AbortController`: cancelás el request anterior cuando arranca uno nuevo (`fetch(url, { signal })`). Te doy las bases para que después lo busques, es muy interesante.
2. Un id de request: guardás `const id = ++requestId.current` y cuando llega la respuesta comparás; si no es la última, la descartás. (Prefiero el AbortController).

Hoy no te afecta porque el JSON es local y sincrónico, pero el día que pases a la API sí.

### ¿Está bien cambiar el título de la pestaña con `document.title` en un `useEffect`?

Me suena a "hacer trampa", porque estoy tocando el DOM a mano en una app de React,
que es justo lo que React intenta evitar. ¿Hay una forma más correcta?

**Respuesta:**
El `<title>` vive en el `<head>`, que está fuera del árbol de React (tu root es `#root`), así que React no lo controla. Tocarlo a mano es lo estándar.

El `useEffect` es el lugar correcto porque estás sincronizando algo externo (el documento) con el estado (`total`, `currentPage`). Esto lo podes llevar a un siguiente nivel y desmontar:

```jsx
useEffect(() => {
  const tituloAnterior = document.title
  document.title = `Resultados ${total} | Página ${currentPage} | DevJobs`

  return () => {
    document.title = tituloAnterior
  }
}, [total, currentPage])
```

Eso además arregla un detalle: hoy, si volvés a la Home, el título se queda con el de la última búsqueda porque nadie lo resetea.

Espero haya ayudado las respuestas, fueron muchas preguntas así que intenté ser claro y conciso en cada una sin perder detalle :)

Cualquier duda me avisas si?
