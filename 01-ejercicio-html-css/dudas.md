<!-- Aquí puedes introducir tus dudas sobre el ejercicio, la consigna, la corrección, etc -->

# Mis dudas del ejercicio de HTML y CSS

## Sobre el HTML

### ¿Cuándo uso `<div>` y cuándo una etiqueta semántica?

Entiendo que `<header>`, `<main>` o `<footer>` describen mejor lo que hay dentro,
pero no sé dónde está el límite. Si creo una caja **solo** para poder alinear cosas
con flex, ¿eso es un `<div>` normal o me estoy perdiendo alguna etiqueta que debería
usar? Dicho de otra forma: ¿un `<div>` de más es un error o simplemente no aporta nada?

**Respuesta:**
Hola! Muy buena pregunta.
La regla es: usa semántica cuando la caja tiene significado (header, nav, article, footer...) y `<div>` cuando solo es un contenedor para estilos o layout.

Un `<div>` de más no es un error, solo no aporta nada.

La semántica tiene una parte importante en la accesibilidad, no solo para personas sino para la maquina.

Si veo el arbol de elementos HTML de mi sitio, tengo que poder saber entender que es cada sección sin necesidad de verlo en el browser, de eso se trata.
Por ejemplo:
- Veo el header con un nav y se que ahí están los links que navegan a las distintas páginas de mi sitio.
- Veo una sección con un formulario, y si tiene el `aria-label` o `label` correcto, se de que se trata ese formulario por sus propios atributos y por la sección en la que está (`section`). Dicho esto, una buena regla es que cada section tenga un `h2, h3, h4, h5 o h6` que le de contexto a la sección.
- Si veo un bloque que se repite (un article dentro de la sección), se que ese es un elemento que acompaña a la sección y que tiene un contenido individual.

### ¿Qué diferencia hay de verdad entre `<section>` y `<article>`?

Los dos me parecen "una caja con contenido dentro". He puesto `<article>` en cada
tarjeta de empleo porque leí que es contenido que "tiene sentido por sí solo",
pero no sé si eso lo estoy aplicando bien o me lo estoy inventando.

**Respuesta:**
Lo hiciste bien! La manera de pensarlo que uso es la siguiente:
- `article` es un bloque que pongas donde lo pongas, se va a entender por su propio contenido. Por ejemplo un post, un tuit, una tarjeta de empleo, etc. Si lees un article dentro de nuestro sitio ya sabes de que trata porque el title, description y acción te da el contexto que necesitas para entenderlo.
- `section` agrupa contenido de un mismo tema. Por ejemplo agrupa las preguntas frecuentes (FAQ) de un sitio, agrupa todos los tuits de un usuario, etc. Lo que hace es agrupar contenido similar y por lo general tiene un `h2, h3, h4, h5 o h6` que le da contexto a la sección (como vimos en la primera pregunta).

### ¿Por qué solo puede haber un `<h1>` por página?

Y si tengo el logo "DevJobs" arriba y el título "Encuentra tu próximo trabajo" en
medio... ¿cuál de los dos debería ser el `<h1>`? Los dos me parecen importantes.

**Respuesta:**
Bien! Buena pregunta, la realidad es que ahora no es obligatorio tener solo un H1. Es más, podes tener un h1 por cada sección de tu sitio.

La realidad es que por más que esto ahora se pueda, la industria sigue usando un solo H1 en toda la página.

Pero sacando esto, el H1 debe ser el texto principal que mejor describa lo que hace la página individual en la que estamos.

Con esta idea, podemos diferenciar dos cosas:
- Si pongo como H1 "Encuentra tu próximo trabajo", me queda claro que esa página es para encontrar mi próximo trabajo, lo cual está bien.
- Si pongo como H1 el logo, no me dice nada, el logo es solo la identidad de todas las páginas, pero no me describe que hace cada página, así que no es una buena idea ponerlo como título principal.

### ¿Para qué sirve el `<label>` si luego lo escondo con CSS?

Me confunde. Si el usuario no lo va a ver, ¿por qué no lo borro y ya?
Entiendo que es "por accesibilidad", pero no acabo de imaginarme cómo lo usa
realmente un lector de pantalla.

**Respuesta:**
Bien, aquí hay dos cosas:

[Adelanto del futuro]: Para hacer testing viene muy bien tener `label` en los inputs porque nos permite encontrar muy fácilmente los elementos que necesitamos.

Por otro lado, un lector de pantalla analiza en el DOM para que sirve cada elemento que hay ahí.

Lo que hablamos antes, si hay un nav dentro de un header sabemos que es el menú principal del sitio.

Con esto mismo, si tenemos un `label` (aunque esté oculto con CSS) lo que le damos a los lectores es un super poder para saber un poco más del input que hay ahí: Ese input es para buscar empleos. No un input sin contexto alguno.

Esto ayuda tanto a:
- lectores de pantalla de manera literal: cuando una persona con discapacidad visual necesita navegar por un sitio, esto le dice para qué es el input y lo que hace.
- Para IA, al tener más contexto de uso, podemos dirigir a una IA a que haga algo con mayor precisión.
- Lo que hablamos de testing, podemos hacer mejores tests ya que usan muchos selectores de accesibilidad.
- Los bots de google pueden leer el contenido de nuestro sitio sabiendo un poco más del contexto.

### ¿Por qué `display: none` no vale para esconder el label?

He visto que hay que usar un truco raro con `position: absolute` y `clip-path`
en vez de `display: none`. No entiendo por qué una forma de esconder algo es
"buena" y la otra "mala" si al final las dos lo esconden.

**Respuesta:**
Hay un matiz aquí y es que no lo esconden igual.

`display: none` (o `visibility: hidden`) eliminan el elemento también del árbol de accesibilidad: el lector de pantalla lo ignora como si no estuviese, así que el label deja de existir para la persona con discapacidad visual.

Tiene sentido porque imagina que tenemos un modal con `display: none` esperando a aparecer en el sitio, si no se oculta en el arbol de accesibilidad, el lector de pantalla se come toda esa información cuando no es necesario. Si es algo que queremos que lea, ahí es en donde hacemos ese truco.

Cuando me toca hacerlo, copio el de tailwind: https://v1.tailwindcss.com/docs/screen-readers para no hacerlo a mano.


### ¿Está mal tener el mismo `<header>` copiado en los dos archivos HTML?

Me da la sensación de que estoy haciendo algo mal, porque si mañana cambio un
enlace tengo que acordarme de cambiarlo en los dos sitios. ¿Hay alguna forma de
evitarlo sin JavaScript o es normal que en HTML puro se repita?

**Respuesta:**
Ese es el gran problema de HTML puro que no tiene "componentes". La realidad es que hoy en día hacemos sitios con ayuda de alguna librería (Astro, Vue, React, Nextjs, etc.) y todas estas nos permiten crear componentes que se pueden reutilizar en muchos sitios. Lo cambiamos en un solo archivo y no en todos.

## Sobre el CSS

### `box-sizing: border-box` — ¿por qué no es el valor por defecto?

Si con `border-box` todo el mundo dice que va mejor y es más intuitivo,
¿por qué el navegador trae el otro por defecto? ¿Hay algún caso en el que
convenga el comportamiento normal?

**Respuesta:** 
Es por un problema histórico de compatibilidad. 
Si hoy en día hacemos ese cambio a que funcione por defecto todos los sitios que fueron creados sin reset se romperían, y estamos hablando de millones de sitios web.

Por esta misma razón no hay cambios en JS, CSS o HTML (con decir cambios me refiero cambiar el funcionamiento de cosas que ya existen). 

Usar `box-sixing: content-box` puede servir para alguna animación o estilo particular que quieras hacer, pero no es lo correcto para todos los elementos de nuestro sitio porque por cada borde que pongamos a un elemento, va a modificar la simetría del sitio.

### ¿Cuándo uso Flexbox y cuándo Grid?

Los dos sirven para colocar cosas y me pierdo. Las tarjetas de empleo las he puesto
con flex y las categorías con grid, pero honestamente lo he hecho un poco a ojo.
¿Hay alguna regla sencilla para decidir?

**Respuesta:**
- `flex` cuando quieras ordenar elementos en una sola dirección (fila o columna) y no necesites manejar individualmente cada una de ellas.
- `grid` cuando quieras ordenar elementos en dos dimensiones (filas y columnas) y manejar individualmente cada una de ellas, sea cambiando su posición, ocupando más de una linea o columna.

### ¿Qué son `1fr`, `rem`, `vw` y por qué no uso píxeles y ya está?

Sé que los píxeles "no son responsive", pero no entiendo del todo por qué.
Un `rem`, ¿respecto a qué se calcula exactamente? ¿Y si el usuario cambia el
tamaño de letra de su navegador, cambia todo mi diseño?

**Respuesta:**
Si, un `rem` se calcula respecto al `font-size` del elemento `<html>` (16px es por defecto, y se puede configurar desde el navegador). La idea es usar esto para que, independientemente del tamaño de letra que el usuario elija, los elementos se van a ver de manera proporcional.

``` con esto no va a haber problema:
Si tengo un font-size en el navegador de 16px:
text-size: 16px;
padding: 1rem; // <- 16px;
```

``` pero si cambio el font-size a 32px:
text-size: 16px;
padding: 1rem; // <- 32px
```

Aquí va a quedar el contenido desproporcionado, porque voy a tener un padding enorme y un texto muy chico. La idea es que si aumento la medida, se vea todo mas grande de manera proporcional.

Por otro lado, `vw` es 1% del tamaño de la ventana, solo sirve si queremos que algo ocupe un % del ancho de la ventana.

### `clamp()` me parece magia, ¿lo estoy usando bien?

He puesto `font-size: clamp(1.8rem, 5vw, 3rem)` y funciona, pero no sabría
explicárselo a otra persona. ¿El valor del medio es el que se usa "normalmente"
o es algo que va cambiando todo el rato?

**Respuesta:** Bien, esto es un tema interesante jaja la verdad es que si, va cambiando y encontrar un valor que vaya con tus tamaños de letra es algo que hay que probar en cada proyecto según el tamaño de los title que quieras.

Yo uso esto para calcular: https://www.fluid-type-scale.com/

Si lo revisas, verás que es simple y visualmente queda muy claro.

### ¿Por qué mis media queries casi no hacen nada?

Me esperaba escribir muchas más. Al final, con `flex-wrap: wrap` y con
`grid-template-columns: repeat(auto-fit, minmax(...))` la página ya se adapta sola
y solo he necesitado dos media queries. ¿Eso es buena señal o es que me estoy
saltando algo importante del responsive?

**Respuesta:** es buena señal! Significa que usaste las propiedades correctas para evitar media queries innecesarias.

### ¿Por qué mi `background-color` no se aplica a veces?

Me pasó con un botón: lo tenía puesto y se veía de otro color. Luego descubrí que
había otra regla más específica ganando. ¿Cómo sé, mirando mi CSS, qué regla va
a ganar sin tener que abrir siempre las DevTools?

**Respuesta:** Mirando tu CSS lo puedes hacer buscando explícitamente que clase se aplica y todas sus especificidades. No lo recomiendo, lo que si te recomiendo es usar las herramientas de desarrollo, porque ahí te dirá todas las clases que se aplican a ese elemento y cual gana sobre todas.

Esto con librerías (Astro, React, etc) ya no pasa porque se genera un hash de clases en cada elemento a la que se aplica un estilo, así que no habrá problemas de especificidad.

### ¿Las variables de CSS (`--color-primario`) son como las variables de JavaScript?

¿Puedo hacer cuentas con ellas? ¿Y por qué se declaran dentro de `:root` y no en
cualquier sitio?

**Respuesta:**
Se ponen en el :root por herencia, todo lo que pongas en el :root se aplica a toda la página. Por eso se estila poner ahí.

Pero puedes poner variables en cualquier elemento y solo las clases que heredan hacia abajo pueden acceder a ellas.

Y si, puedes hacer operaciones con esas variables, no con tanta libertad como con JS pero usando `calc()` puedes hacer magias.

## Sobre el ejercicio en general
¿Cuánto de una web de verdad es HTML fijo y cuánto se genera con JavaScript?

**Respuesta:**
Todo lo dinámico: Ofertas de trabajo, información de usuario, comentarios, etc. se generan por JS, esto es porque necesitan de una API para obtener los datos y pintar el contenido.
El resto, lo que no cambia como el header, nav, footer, y alguna que otra sección si es solo HTML estático.

Esto tiene un matiz y es mas avanzado, pero hay frameworks como NextJS que lo que hace es cachear las peticiones de una API y devolver HTML estático sin hacer una consulta (es algo más avanzado que va unos cuantos escalones más adelante).