<!-- Aquí puedes introducir tus dudas sobre el ejercicio, la consigna, la corrección, etc -->

# Mis dudas del ejercicio de HTML y CSS

## Sobre el HTML

### ¿Cuándo uso `<div>` y cuándo una etiqueta semántica?

Entiendo que `<header>`, `<main>` o `<footer>` describen mejor lo que hay dentro,
pero no sé dónde está el límite. Si creo una caja **solo** para poder alinear cosas
con flex, ¿eso es un `<div>` normal o me estoy perdiendo alguna etiqueta que debería
usar? Dicho de otra forma: ¿un `<div>` de más es un error o simplemente no aporta nada?

### ¿Qué diferencia hay de verdad entre `<section>` y `<article>`?

Los dos me parecen "una caja con contenido dentro". He puesto `<article>` en cada
tarjeta de empleo porque leí que es contenido que "tiene sentido por sí solo",
pero no sé si eso lo estoy aplicando bien o me lo estoy inventando.

### ¿Por qué solo puede haber un `<h1>` por página?

Y si tengo el logo "DevJobs" arriba y el título "Encuentra tu próximo trabajo" en
medio... ¿cuál de los dos debería ser el `<h1>`? Los dos me parecen importantes.

### ¿Para qué sirve el `<label>` si luego lo escondo con CSS?

Me confunde. Si el usuario no lo va a ver, ¿por qué no lo borro y ya?
Entiendo que es "por accesibilidad", pero no acabo de imaginarme cómo lo usa
realmente un lector de pantalla.

### ¿Por qué `display: none` no vale para esconder el label?

He visto que hay que usar un truco raro con `position: absolute` y `clip-path`
en vez de `display: none`. No entiendo por qué una forma de esconder algo es
"buena" y la otra "mala" si al final las dos lo esconden.

### ¿Está mal tener el mismo `<header>` copiado en los dos archivos HTML?

Me da la sensación de que estoy haciendo algo mal, porque si mañana cambio un
enlace tengo que acordarme de cambiarlo en los dos sitios. ¿Hay alguna forma de
evitarlo sin JavaScript o es normal que en HTML puro se repita?

## Sobre el CSS

### `box-sizing: border-box` — ¿por qué no es el valor por defecto?

Si con `border-box` todo el mundo dice que va mejor y es más intuitivo,
¿por qué el navegador trae el otro por defecto? ¿Hay algún caso en el que
convenga el comportamiento normal?

### ¿Cuándo uso Flexbox y cuándo Grid?

Los dos sirven para colocar cosas y me pierdo. Las tarjetas de empleo las he puesto
con flex y las categorías con grid, pero honestamente lo he hecho un poco a ojo.
¿Hay alguna regla sencilla para decidir?

### ¿Qué son `1fr`, `rem`, `vw` y por qué no uso píxeles y ya está?

Sé que los píxeles "no son responsive", pero no entiendo del todo por qué.
Un `rem`, ¿respecto a qué se calcula exactamente? ¿Y si el usuario cambia el
tamaño de letra de su navegador, cambia todo mi diseño?

### `clamp()` me parece magia, ¿lo estoy usando bien?

He puesto `font-size: clamp(1.8rem, 5vw, 3rem)` y funciona, pero no sabría
explicárselo a otra persona. ¿El valor del medio es el que se usa "normalmente"
o es algo que va cambiando todo el rato?

### ¿Por qué mis media queries casi no hacen nada?

Me esperaba escribir muchas más. Al final, con `flex-wrap: wrap` y con
`grid-template-columns: repeat(auto-fit, minmax(...))` la página ya se adapta sola
y solo he necesitado dos media queries. ¿Eso es buena señal o es que me estoy
saltando algo importante del responsive?

### ¿Por qué mi `background-color` no se aplica a veces?

Me pasó con un botón: lo tenía puesto y se veía de otro color. Luego descubrí que
había otra regla más específica ganando. ¿Cómo sé, mirando mi CSS, qué regla va
a ganar sin tener que abrir siempre las DevTools?

### ¿Las variables de CSS (`--color-primario`) son como las variables de JavaScript?

¿Puedo hacer cuentas con ellas? ¿Y por qué se declaran dentro de `:root` y no en
cualquier sitio?

## Sobre el ejercicio en general
¿Cuánto de una web de verdad es HTML fijo y cuánto se genera con JavaScript?
