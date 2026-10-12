<!-- Aquí puedes poner tus dudas del ejercicio -->

# Mis dudas del ejercicio de tests E2E con Playwright

## Sobre los tests E2E en general

### ¿Qué diferencia hay entre estos tests y los del ejercicio anterior?

En el 08 hacía peticiones a la API. Aquí se abre un navegador de verdad.
¿Los dos tipos hacen falta o con uno basta?

### ¿Se abre un navegador de verdad? Porque yo no veo nada

Ejecuto `npx playwright test` y no aparece ninguna ventana. ¿Está pasando algo?
Luego vi lo de `--headed`. ¿Qué significa "headless"?

### ¿Por qué se ejecutan en Chromium, Firefox y WebKit?

¿De verdad hay diferencias entre navegadores hoy en día? ¿Merece la pena el triple
de tiempo de ejecución?

### Los tests E2E son mucho más lentos, ¿no?

Los del ejercicio 8 tardaban 200ms y estos varios segundos. ¿Se ejecutan en cada
cambio o solo de vez en cuando?

## Sobre los selectores

### ¿Por qué `getByRole` es mejor que un selector CSS?

Es la parte que más me ha costado. Con `.job-listing-card` funciona perfectamente y
es más corto de escribir. ¿Qué gano usando roles?

### ¿Qué es un "rol ARIA" y de dónde sale?

Yo no he escrito `role="searchbox"` en ningún sitio, pero Playwright lo encuentra.
¿El navegador se lo inventa a partir de la etiqueta? ¿Dónde puedo ver qué rol tiene
cada elemento?

### ¿Por qué un `<input type="text">` no vale y uno `type="search"` sí?

Tuve que cambiar el tipo del input para que `getByRole('searchbox')` lo encontrara.
¿Eso significa que estaba mal escrito mi HTML desde el principio?

### ¿Qué es el "strict mode" de Playwright?

Me dio este error con el `h1` del detalle y no entendía nada. ¿Por qué Playwright se
niega a elegir uno si encuentra dos, en vez de coger el primero?

### ¿Está mal tener dos `<h1>` en la página?

Por lo visto el logo "DevJobs" también es un `h1`. ¿Debería cambiarlo en la app o
simplemente busco dentro de `<main>` en el test?

### ¿Cuándo uso `.first()` y cuándo es señal de que algo va mal?

Lo uso mucho para que no falle. Pero tengo la sensación de estar tapando un problema
en vez de resolverlo.

## Sobre la espera y la asincronía

### ¿Por qué no hace falta poner esperas ni `sleep`?

Esto me parece lo mejor de Playwright, pero también lo más "mágico".
¿Cómo sabe cuándo el elemento está listo? ¿Y qué pasa si nunca aparece?

### ¿Por qué `expect(...)` lleva `await` si es una comprobación?

En los tests del ejercicio 8 el `assert` no llevaba `await`. ¿Qué está esperando aquí?

### ¿Cuál es la diferencia entre `page.locator(...)` y `page.$(...)`?

He visto los dos en internet. ¿Uno es antiguo?

### ¿Por qué `textContent()` lleva paréntesis y `toBeVisible()` también, pero uno lleva await y el otro no?

Me lío mucho con qué es una promesa y qué no en Playwright.

## Sobre la configuración

### ¿Qué hace el bloque `webServer` de la configuración?

Entiendo que arranca la app de React solo. ¿Y la apaga al terminar? ¿Qué pasa si ya
la tenía abierta en otra terminal?

### ¿Qué es `baseURL` y por qué puedo escribir `page.goto('/')`?

¿Se junta con la URL base automáticamente? ¿Puedo tener varias?

### ¿Qué es un "trace" y cómo se ve?

El comentario dice que es lo mejor para depurar, pero no sé abrirlo ni qué voy a
encontrarme dentro.

### ¿Por qué se reintentan los tests en CI y no en local?

Si un test falla y al segundo intento pasa... ¿está bien o mal ese test?
Me da la sensación de que los reintentos esconden problemas.

### ¿Qué significa `fullyParallel` y por qué obliga a que los tests sean independientes?

¿Se abren varios navegadores a la vez? ¿Comparten algo entre ellos (como el login)?

## Sobre los tests concretos

### ¿Por qué hay que hacer `page.goto()` en cada test?

¿Cada test empieza con un navegador completamente limpio? ¿Se borra el estado de
Zustand y todo lo demás?

### En el test del flujo completo, ¿por qué el botón "Aplicar" está deshabilitado al principio?

Tuve que hacer click en "Iniciar sesión" primero. ¿Está bien que un test dependa de
tantos pasos seguidos? Si falla, ¿cómo sé cuál de los 6 pasos fue el que se rompió?

### ¿Por qué recorro TODAS las tarjetas en el test del filtro y no solo la primera?

El comentario dice que si solo miro la primera se me podría colar un fallo en la
segunda. ¿Eso pasa de verdad?

### En el test de paginación, ¿por qué comparo el título antes y después?

¿No bastaría con comprobar que la URL tiene `page=2`?

### ¿Y si mañana cambio el texto de un botón? ¿Se rompen todos los tests?

Esa es mi mayor preocupación: que los tests sean tan frágiles que dé pereza tocar la
app. ¿Cómo se evita eso?

## Sobre la parte opcional con IA

### ¿Qué aporta Stagehand frente a Playwright normal?

Si le describo lo que quiero en lenguaje natural, ¿no será menos fiable?
¿Un test que "interpreta" puede fallar de forma distinta cada vez?
