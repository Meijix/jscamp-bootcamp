<!-- Aquí puedes poner tus dudas del ejercicio -->

# Mis dudas del ejercicio de tests E2E con Playwright

## Sobre los tests E2E en general

### ¿Qué diferencia hay entre estos tests y los del ejercicio anterior?

En el 08 hacía peticiones a la API. Aquí se abre un navegador de verdad.
¿Los dos tipos hacen falta o con uno basta?

**Respuesta:**
En el 08 probabas tu servidor: `fetch` -> Express -> controlador -> modelo. Acá probás la app
desde afuera, como el usuario: navegador real, React, el router, los clics.

Hacen falta los dos porque ven cosas distintas. Un test de API no se entera de que el botón
"Aplicar" está deshabilitado, de que falta un `aria-label` o de que la paginación vuelve sola a la
página 1. Un test E2E no te dice en qué función del servidor falló. La regla práctica: muchos
tests baratos (unitarios/integración) y pocos E2E, sobre los caminos que de verdad importan
(buscar, ver el detalle, aplicar).

### ¿Se abre un navegador de verdad? Porque yo no veo nada

Ejecuto `npx playwright test` y no aparece ninguna ventana. ¿Está pasando algo?
Luego vi lo de `--headed`. ¿Qué significa "headless"?

**Respuesta:**
Sí, es un navegador de verdad (Chromium, Firefox o WebKit según el proyecto), solo que sin
ventana. Eso es "headless": el mismo motor, la misma pantalla virtual, pero sin interfaz gráfica.
El test ve el DOM igual que lo vería con ventana.

`--headed` le pone ventana; `--ui` abre el modo interactivo, que es el mejor para depurar porque
te deja avanzar paso por paso viendo la página.

### ¿Por qué se ejecutan en Chromium, Firefox y WebKit?

¿De verdad hay diferencias entre navegadores hoy en día? ¿Merece la pena el triple
de tiempo de ejecución?

**Respuesta:**
Sí hay diferencias: son tres motores distintos (Blink, Gecko, WebKit) y cambian cosas como el
manejo del foco, los eventos, los formularios y el árbol de accesibilidad.

Merece la pena. La mejor es: en local, `--project=chromium`
mientras iterás; los tres en CI o antes de entregar.

### Los tests E2E son mucho más lentos, ¿no?

Los del ejercicio 8 tardaban 200ms y estos varios segundos. ¿Se ejecutan en cada
cambio o solo de vez en cuando?

**Respuesta:**
Sí, son más lentos por diseño: cada test levanta un contexto de navegador, navega y espera a la
red. Los 21 de este ejercicio tardan unos 30 segundos.

Por eso no van en cada tecla. Van a demanda mientras trabajás.

## Sobre los selectores

### ¿Por qué `getByRole` es mejor que un selector CSS?

Es la parte que más me ha costado. Con `.job-listing-card` funciona perfectamente y
es más corto de escribir. ¿Qué gano usando roles?

**Respuesta:**
El rol describe qué es el elemento; la clase CSS describe cómo se ve. Si mañana cambiás el
diseño y la clase, el test por rol sigue andando y el de CSS se rompe sin que nada se haya
roto para el usuario.

Además el rol sale del árbol de accesibilidad: si el test encuentra el elemento por su rol, es
que un lector de pantalla también lo encuentra. El test comprueba dos cosas a la vez.

### ¿Qué es un "rol ARIA" y de dónde sale?

Yo no he escrito `role="searchbox"` en ningún sitio, pero Playwright lo encuentra.
¿El navegador se lo inventa a partir de la etiqueta? ¿Dónde puedo ver qué rol tiene
cada elemento?

**Respuesta:**
No hace falta escribir `role="..."`: el navegador calcula el rol a partir de la etiqueta y sus
atributos. `<input type="search">` -> `searchbox`, `<input type="text">` -> `textbox`,
`<article>` -> `article`, `<h3>` -> `heading` de nivel 3, `<button>` -> `button`.

Ese conjunto es el "árbol de accesibilidad", lo que consume un lector de pantalla. Se ve en
DevTools -> Elements -> panel "Accessibility".

### ¿Por qué un `<input type="text">` no vale y uno `type="search"` sí?

Tuve que cambiar el tipo del input para que `getByRole('searchbox')` lo encontrara.
¿Eso significa que estaba mal escrito mi HTML desde el principio?

**Respuesta:**
No estaba mal escrito: `<input type="text">` es HTML válido. Lo que pasa es que su rol es
`textbox`, no `searchbox`, así que `getByRole('searchbox')` no lo encuentra porque no lo es.

Un buscador debe ser `type="search"`: es lo semánticamente correcto y es lo que espera un lector
de pantalla. Cambiaste el HTML porque correspondía, y el test se benefició de eso.

### ¿Qué es el "strict mode" de Playwright?

Me dio este error con el `h1` del detalle y no entendía nada. ¿Por qué Playwright se
niega a elegir uno si encuentra dos, en vez de coger el primero?

**Respuesta:**
Si un locator matchea dos o más elementos, Playwright no adivina: tira error y te lista todos.
Es a propósito. Elegir el primero a ciegas puede clickear el botón equivocado y el test pasaría por casualidad.

Se arregla acotando el selector, no escondiéndolo: buscar dentro de `main`, filtrar por `name`,
por nivel del heading, por texto. En el archivo está el caso real: el logo "DevJobs" también es
un `<h1>`, así que el título del detalle se busca dentro de `<main>`.

### ¿Está mal tener dos `<h1>` en la página?

Por lo visto el logo "DevJobs" también es un `h1`. ¿Debería cambiarlo en la app o
simplemente busco dentro de `<main>` en el test?

**Respuesta:**
HTML5 permite varios `<h1>`, no es un error de validación. Pero sí es una mala señal de
estructura: el logo no es el título del contenido, y el índice del documento queda confuso.

La solución de fondo es en la app (el logo como link con su `aria-label="DevJobs"`, sin `h1`), y
es una mejora de accesibilidad, no del test. Mientras tanto, acotar a `<main>` es exactamente lo
correcto: estás diciendo "el `h1` del contenido", que es lo que querés verificar.

### ¿Cuándo uso `.first()` y cuándo es señal de que algo va mal?

Lo uso mucho para que no falle. Pero tengo la sensación de estar tapando un problema
en vez de resolverlo.

**Respuesta:**
Está bien cuando querés "la primera de una lista homogénea": el primer resultado, la primera tarjeta.
Ahí no hay ambigüedad, hay una lista ordenada y la posición es parte de lo que se prueba.

En este ejercicio saqué un `.first()` que no hacía falta: dentro de una tarjeta hay un solo
enlace (el título). Sin `.first()`, si mañana aparece un segundo, el test avisa. Con `.first()`,
seguiría verde clickeando el que no sabés cuál es.

## Sobre la espera y la asincronía

### ¿Por qué no hace falta poner esperas ni `sleep`?

Esto me parece lo mejor de Playwright, pero también lo más "mágico".
¿Cómo sabe cuándo el elemento está listo? ¿Y qué pasa si nunca aparece?

**Respuesta:**
Antes de cada acción Playwright espera a que el elemento pase los chequeos de "accionabilidad":
que esté en el DOM, visible, estable (sin animación), habilitado y que reciba eventos de puntero.
Y las assertions reintentan durante el timeout (5s por defecto).

Si nunca aparece, falla con el detalle de qué estaba esperando y el árbol de accesibilidad de la
página, así que sabés si el elemento no existía o si estaba oculto.

### ¿Por qué `expect(...)` lleva `await` si es una comprobación?

En los tests del ejercicio 8 el `assert` no llevaba `await`. ¿Qué está esperando aquí?

**Respuesta:**
Porque no es una comparación instantánea: es una assertion que reintenta contra el navegador
("web-first"). `expect(locator).toBeVisible()` devuelve una promesa que se resuelve cuando la
condición se cumple o revienta al agotar el timeout.

Sin `await` no esperás nada: el test sigue de largo y el fallo aparece después, como error
"unhandled" que no sabés de dónde salió.

Las comparaciones de valores planos (`expect(1).toBe(1)`) sí son sincrónicas; las de locators
siempre van con `await`.

### ¿Cuál es la diferencia entre `page.locator(...)` y `page.$(...)`?

He visto los dos en internet. ¿Uno es antiguo?

**Respuesta:**
`page.locator()` es el API actual: perezoso (no busca hasta que lo usás), con auto-waiting y
strict mode.

`page.$()` y `page.$$()` devuelven un `ElementHandle`: buscan en ese instante, sin esperar, y
quedan atados a un elemento concreto que puede desaparecer en el próximo render. Por eso están
marcados como legacy en la documentación.

Regla: `locator` siempre. Si ves `page.$` en un tutorial, es código viejo.

### ¿Por qué `textContent()` lleva paréntesis y `toBeVisible()` también, pero uno lleva await y el otro no?

Me lío mucho con qué es una promesa y qué no en Playwright.

**Respuesta:**
Los dos llevan `await`; lo que cambia es dónde se pone: `await expect(locator).toBeVisible()`.
El `await` cubre el `expect` entero, no el método.

La regla que sirve para no pensarlo más: si la llamada cruza al navegador y te devuelve un dato o
ejecuta una acción, es promesa -> `await` (`textContent`, `click`, `fill`, `count`, `all`,
`isVisible`). Y las assertions de locator también.

## Sobre la configuración

### ¿Qué hace el bloque `webServer` de la configuración?

Entiendo que arranca la app de React solo. ¿Y la apaga al terminar? ¿Qué pasa si ya
la tenía abierta en otra terminal?

**Respuesta:**
Antes del primer test ejecuta el comando (`npm run dev` en `../04-...`), espera a que responda la
`url`, corre la suite y al final mata el proceso. Así no dependés de acordarte de levantarla.

`reuseExistingServer: !process.env.CI` significa: en local, si ya hay algo escuchando en ese
puerto, lo reutiliza; en CI arranca siempre uno propio, para no depender de la máquina.

La trampa real: si tenés OTRA app en 5173 (un build viejo, otro ejercicio), Playwright la
reutiliza y estás testeando otra cosa. Si algo no cierra, lo primero es verificar qué está
corriendo en ese puerto.

### ¿Qué es `baseURL` y por qué puedo escribir `page.goto('/')`?

¿Se junta con la URL base automáticamente? ¿Puedo tener varias?

**Respuesta:**
Sí, se resuelve como `new URL('/search', baseURL)`. Por eso `page.goto('/')` termina en
`http://localhost:5173/`, y también sirve para las assertions de URL y para los links relativos.

### ¿Qué es un "trace" y cómo se ve?

El comentario dice que es lo mejor para depurar, pero no sé abrirlo ni qué voy a
encontrarme dentro.

**Respuesta:**
Es una grabación del test: screenshots, snapshots del DOM paso por paso, todas las requests de
red, la consola y los tiempos. Se abre con `npx playwright show-trace ruta/trace.zip`
(el reporte HTML completo, con `npx playwright show-report`).

**Y acá había un problema real:** la config tenía `trace: 'on-first-retry'`, que graba en el
primer reintento. Como en local `retries` es 0, en local NUNCA se grababa un trace, justo cuando
estás depurando. Lo comprobé haciendo fallar un test en los tres navegadores: quedaba solo el
`error-context.md`, cero `.zip`.

Ahora quedó así: `process.env.CI ? 'on-first-retry' : 'retain-on-failure'`. En local graba siempre y
guarda solo el del test que falló; en CI ahorra disco.

### ¿Por qué se reintentan los tests en CI y no en local?

Si un test falla y al segundo intento pasa... ¿está bien o mal ese test?
Me da la sensación de que los reintentos esconden problemas.

**Respuesta:**
En CI se reintenta para absorber fallos de infraestructura (máquina
lenta, red); en local no, justamente para que te enteres de los tests inestables.

La regla: si un test necesita reintentos para pasar, es flaky, no verde. Se investiga.

### ¿Qué significa `fullyParallel` y por qué obliga a que los tests sean independientes?

¿Se abren varios navegadores a la vez? ¿Comparten algo entre ellos (como el login)?

**Respuesta:**
`fullyParallel: true` hace que los tests de un mismo archivo también se repartan entre workers
(por defecto, uno por test en paralelo, hasta el límite de la máquina). Y sí, son varios navegadores a la vez.

No comparten nada del lado del navegador: cada test recibe su propio contexto, con cookies, localStorage y memoria limpios.
Lo que no aíslan es el servidor: si tu backend guarda en una
base, dos tests en paralelo pueden pisarse. Acá la API es externa y de solo lectura, así que no hay problema.

## Sobre los tests concretos

### ¿Por qué hay que hacer `page.goto()` en cada test?

¿Cada test empieza con un navegador completamente limpio? ¿Se borra el estado de
Zustand y todo lo demás?

**Respuesta:**
Sí: cada test estrena contexto y página. Navegador limpio, sin storage, sin estado en memoria.
Por eso el login de un test no contamina al siguiente, y por eso el estado de Zustand arranca en
`isLoggedIn: false` siempre.

El costo es repetir la navegación en cada test. Cuando hay login de verdad, eso se evita con
`storageState`: se autentica una vez, se guardan cookies y storage, y los tests arrancan ya logueados sin repetir el flujo.

### En el test del flujo completo, ¿por qué el botón "Aplicar" está deshabilitado al principio?

Tuve que hacer click en "Iniciar sesión" primero. ¿Está bien que un test dependa de
tantos pasos seguidos? Si falla, ¿cómo sé cuál de los 6 pasos fue el que se rompió?

**Respuesta:**
Porque así está diseñado en el ejercicio 04: `disabled={isApplied || !isLoggedIn}`. Sin sesión no
se puede aplicar, y el test refleja el flujo real del usuario.

Que dependa de varios pasos está bien: es el recorrido que importa.

Sobre saber qué paso se rompió: el reporte te dice la línea exacta, el locator y te deja el trace.

### ¿Por qué recorro TODAS las tarjetas en el test del filtro y no solo la primera?

El comentario dice que si solo miro la primera se me podría colar un fallo en la
segunda. ¿Eso pasa de verdad?

**Respuesta:**
Pasa. Mirar una sola tarjeta prueba "la primera del listado cumple el filtro", que no es lo
mismo que "el filtro está bien aplicado". Si el filtrado se aplicara a medias (o se mezclara lo
que llega de la API con lo anterior), las demás podrían estar mal.

Lo probé con una mutación: intercepté las requests y borré el parámetro `type`. Con eso, la API
devuelve todo mezclado y el test falla.

### En el test de paginación, ¿por qué comparo el título antes y después?

¿No bastaría con comprobar que la URL tiene `page=2`?

**Respuesta:**
No basta: la URL puede cambiar y los resultados quedarse iguales (por ejemplo si la app no
aplicara el offset). Estarías verificando la barra de direcciones, no lo que ve el usuario.

### ¿Y si mañana cambio el texto de un botón? ¿Se rompen todos los tests?

Esa es mi mayor preocupación: que los tests sean tan frágiles que dé pereza tocar la
app. ¿Cómo se evita eso?

**Respuesta:**
Si cambiás la copia visible, el test que busca por ese texto se rompe. Es el costo real: el test acordó un contrato con la interfaz.

Se mitiga así: roles con nombres accesibles estables (los labels son accesibilidad, no solo tests), evitar CSS y estructura del DOM, centralizar los textos en un solo lugar si la copia
cambia seguido, y `data-testid` como último recurso para lo que no tiene semántica.

Y conviene tener una opinión: si cambiás "Buscar" por "Buscar empleos", es un cambio de producto
visible y que el test te avise es una señal de que sirve. Fragilidad de verdad es cuando el test
se rompe por cosas que al usuario le dan igual: un `div` de más, una clase CSS renombrada.

## Sobre la parte opcional con IA

### ¿Qué aporta Stagehand frente a Playwright normal?

Si le describo lo que quiero en lenguaje natural, ¿no será menos fiable?
¿Un test que "interpreta" puede fallar de forma distinta cada vez?

**Respuesta:**
Sí, y ese es justamente el costo. Stagehand es Playwright con una capa de IA: `act("aplica al
primer empleo")`, `extract(...)` con un schema para sacar datos, `observe(...)` para descubrir
qué se puede hacer. No reemplaza a Playwright: lo maneja.

Aporta cuando la UI cambia mucho.

Para una suite de regresión de tu propia app: Playwright a mano. Si probás Stagehand, dejalo para
lo que no tiene selectores estables, y mantené las assertions en código.
