# Aquí puedes dejar tus dudas

## Primera parte

<!-- Dudas de la primera parte del ejercicio -->

### ¿Qué hace `<BrowserRouter>` por dentro para que funcionen los hooks?

Envuelvo la app con él y de repente `useNavigate`, `useParams` y `useSearchParams`
funcionan en componentes que están muy abajo, sin pasarles nada por props.
¿Cómo llega esa información hasta allí? Me han dicho que es "contexto", pero es
justo la parte que no entiendo.

### ¿Qué pasa si me olvido del `BrowserRouter`?

Probé a quitarlo y salta un error enorme. ¿Por qué no funciona sin más?

### ¿Cuál es la diferencia entre `BrowserRouter` y `HashRouter`?

He visto los dos nombres. Uno pone `/search` y el otro `/#/search`.
¿Cuándo tendría que usar el segundo?

### ¿Por qué modificamos el `Link` por dentro en vez de cambiar todos los `<Link>` de la app?

El enunciado insiste mucho en esto. Entiendo que hay menos cambios, pero ¿es solo
por comodidad o hay alguna razón más de fondo?

### ¿Por qué React Router usa `to` y no `href`?

Nuestro componente recibe `href` y por dentro lo traduce a `to`. ¿Por qué no usaron
`href` directamente, si al final se pinta un `<a>`?

### Después de cambiar `useRouter`, ¿por qué no hubo que tocar nada más?

Esto me sorprendió mucho: he cambiado el hook entero por dentro y el resto de la app
sigue funcionando igual. ¿Eso es lo que llaman "encapsulación"?

### ¿Puedo borrar `Route.jsx` sin miedo?

Lo hemos borrado porque React Router ya trae su propio `Route`. Pero, ¿cómo sé con
seguridad que un archivo ya no lo usa nadie? ¿Solo buscando con Ctrl+F?

## Segunda parte

<!-- Dudas de la segunda parte del ejercicio -->

### ¿Qué significan los dos puntos en `/job/:id`?

Entiendo que es "aquí va algo variable", pero ¿cómo sabe React Router dónde termina
ese trozo? ¿Y si el id tuviera una barra dentro?

### ¿`useParams` me devuelve siempre texto?

Si la URL fuera `/job/42`, ¿me llega el número 42 o el texto `"42"`? Porque en el
ejercicio 2 me pasó algo parecido con los filtros y me dio problemas.

### ¿Por qué el fetch va dentro de un `useEffect` y no directamente en el componente?

Probé a hacer el fetch a pelo dentro de la función del componente y la página se
quedó pidiendo datos sin parar. ¿Por qué pasa eso?

### ¿Qué es `AbortController` y de verdad hace falta?

Sin él parece que todo funciona. El comentario dice que es para cuando el usuario
cambia de empleo muy rápido. ¿Es un problema que pasa de verdad o es una precaución
de manual?

### ¿Por qué no puedo poner `async` directamente en el `useEffect`?

Tengo que declarar una función async dentro y llamarla justo después, lo cual parece
una vuelta innecesaria. ¿Por qué React no lo permite?

### ¿Qué es Markdown y por qué la API me lo manda así?

Me llega texto con guiones y asteriscos. ¿Por qué el servidor no me lo manda ya en
HTML y me ahorro la librería?

### `dangerouslySetInnerHTML` — ¿qué es exactamente lo peligroso?

El nombre asusta bastante. ¿Qué podría pasar en el peor de los casos? ¿Y cómo sé
cuándo puedo fiarme de un contenido y cuándo no?

### ¿Por qué el `<Link>` envuelve solo el título y no toda la tarjeta?

Si envuelvo toda la tarjeta queda más bonito de pulsar, pero el comentario dice que
entonces el botón "Aplicar" también navegaría. ¿Por qué? ¿Un click dentro de un
enlace "cuenta" como click en el enlace?

## Tercera parte

<!-- Dudas de la tercera parte del ejercicio -->

### ¿Por qué es mejor guardar los filtros en la URL que en un `useState`?

En el ejercicio anterior usaba `useState` y funcionaba. Ahora todo está en la URL.
Entiendo que así se puede compartir el enlace, pero ¿no es más complicado?

### ¿`useSearchParams` es igual que `useState`?

Se parecen mucho (devuelve el valor y un setter), pero uno guarda en la URL y el
otro en memoria. ¿Puedo pensar en ellos como lo mismo o hay diferencias que me van
a morder luego?

### ¿Por qué hay que hacer una COPIA de `searchParams` antes de modificarlo?

En el código se hace `new URLSearchParams(paramsActuales)`. Si ya tengo el objeto,
¿por qué no lo modifico y ya está? ¿Qué pasaría si lo hiciera?

### ¿Qué es `{ replace: true }` y por qué se usa aquí?

Entiendo que tiene que ver con el botón "atrás" del navegador, pero no acabo de
imaginarme la diferencia. ¿Cómo lo pruebo para verlo?

### ¿Por qué las dependencias del `useEffect` son `text, technology, type, level` y no `searchParams`?

El comentario dice que `searchParams` es un objeto nuevo cada vez y que React los
compara con `===`. ¿Eso significa que dos objetos con el mismo contenido no son
"iguales" para JavaScript? Eso me parece rarísimo.

### Los filtros se guardan como `type` en la URL pero el select se llama `location`, ¿por qué?

Me lié bastante con los nombres. ¿Es porque la API los llama así? ¿Está bien tener
nombres distintos para lo mismo según la capa?

## Cuarta parte

<!-- Dudas de la cuarta parte del ejercicio -->

### ¿Qué significa que el código se "descargue por trozos"?

Entiendo la idea general (no bajar lo que no uso), pero no sé qué está pasando
técnicamente. ¿Se hacen más peticiones al servidor? ¿Cuándo exactamente?

### ¿Qué es la pestaña Coverage de las DevTools y cómo la leo?

El enunciado dice que mire ahí, pero al abrirla veo un montón de barras rojas y
verdes y no sé qué significan.

### ¿Por qué `lazy()` necesita esa vuelta con `.then()`?

```js
lazy(() => import('./pages/Home.jsx').then((m) => ({ default: m.HomePage })))
```

Esta línea es horrible de leer. ¿No hay una forma más simple? ¿Y por qué exige un
`export default`?

### ¿Qué pasa si me olvido del `<Suspense>`?

¿Da error o simplemente se ve mal un momento?

### ¿El `fallback` se ve siempre o solo la primera vez?

Porque cuando navego entre páginas apenas veo el "Cargando...". ¿Se queda guardado
el trozo descargado?

### ¿Merece la pena hacer lazy loading en una app tan pequeña?

Con 4 páginas, ¿no estoy complicando el código para ganar unos milisegundos?
¿A partir de qué tamaño empieza a compensar?

## Quinta parte

<!-- Dudas de la quinta parte del ejercicio -->

### ¿Qué diferencia hay entre `Link` y `NavLink`?

Los dos navegan igual. Entiendo que `NavLink` "sabe si está activo", pero
¿cómo lo sabe? ¿Compara la URL solo?

### ¿Por qué `className` puede ser una función en `NavLink`?

En todos los demás sitios `className` es un texto. Aquí le paso una función y React
no se queja. ¿Eso es cosa de React o de React Router?

### ¿Para qué sirve la prop `end` del `NavLink`?

Sin ella, el enlace de "Inicio" se me marcaba como activo estando en `/search`.
No entiendo por qué React Router considera que `/search` "empieza por" `/`.

### ¿Cómo sé si un botón necesita estado local o estado global?

Esta es mi duda más grande del ejercicio. ¿Por qué "¿he aplicado?" es local y
"¿he iniciado sesión?" es global? Los dos son booleanos que cambian al pulsar un botón.

## Sexta parte

<!-- Dudas de la sexta parte del ejercicio -->

### ¿Qué problema resuelve Zustand exactamente?

Entiendo lo del "prop drilling", pero ¿es tan grave pasar una prop por tres
componentes? ¿A partir de cuántos niveles deja de merecer la pena?

### ¿Dónde vive el estado de Zustand si no está dentro de React?

Esto me descoloca: el store se crea fuera de cualquier componente, en un archivo
suelto. ¿Cómo se entera React de que ha cambiado algo?

### ¿Por qué se pasa un "selector" como `useAuthStore((state) => state.isLoggedIn)`?

¿Qué pasaría si escribo `useAuthStore()` a secas? El comentario dice que el
componente se repintaría de más, pero no entiendo cómo el selector lo evita.

### ¿Por qué NO puedo usar el helper `isFavorite()` de la store dentro del componente?

Esta me parece la trampa más sutil de todo el ejercicio. El helper existe, lo llamo,
me devuelve el valor correcto... y aun así el botón no se actualiza. ¿Por qué leer
con `get()` no "suscribe" al componente?

### ¿Por qué no se puede usar `.push()` para añadir un favorito?

Entiendo que hay que crear un array nuevo con `[...state.favorites, jobId]`, pero
no me entra en la cabeza. Si el array tiene los mismos elementos al final,
¿qué más da cómo lo haya metido?

### ¿Qué significa que React "compara por referencia"?

Creo que esta es la raíz de la duda anterior. ¿Puede haber dos arrays idénticos que
para JavaScript sean distintos? ¿Y dos distintos que sean "iguales"?

### ¿Se pierde el estado de Zustand al recargar la página?

Porque si inicio sesión y pulso F5, vuelvo a estar desconectado. ¿Eso es normal?
¿Cómo lo hacen las webs reales para acordarse de ti?

### ¿Qué ventaja tiene Zustand frente al Context de React?

Los dos parecen servir para lo mismo. ¿Por qué el bootcamp nos enseña Zustand?
