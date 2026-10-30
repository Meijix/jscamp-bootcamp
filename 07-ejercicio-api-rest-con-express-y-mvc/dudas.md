<!-- Aquí puedes poner tus dudas del ejercicio -->

# Mis dudas del ejercicio de API REST con Express y MVC

## Sobre Express

### Si ya sabía hacer un servidor con Node puro, ¿para qué Express?

En el ejercicio anterior lo hice todo a mano y funcionaba. ¿Qué me ahorra Express
exactamente? Me da miedo aprender a usar una herramienta sin entender qué hay debajo.

**Respuesta:**
Todo lo que escribiste a mano en el 06, Express lo tiene resuelto y probado: comparar rutas con parámetros (`/jobs/:id`), leer el body, responder JSON, mandar un 404 cuando nada coincide, y ordenar funciones que se ejecutan antes de la ruta.

Cuándo no usarlo? Cuando tenés un handler de 20 líneas y una sola ruta: ahí `createServer` alcanza y te ahorra una dependencia.

Lo que hicimos ahora fue lo mismo que con el ejercicio de React Router. Explicamos cómo se haría sin React Router para luego intriducirlo.

Usar herramientas ahorra el trabajo.

### ¿Qué es un middleware? Es la palabra que más me cuesta

Entiendo que es "algo que se ejecuta en medio", pero ¿en medio de qué y de qué?
¿Es una función normal? ¿Quién la llama?

**Respuesta:**
Es una función normal si, con una firma específica: `(req, res, next)`. Express las guarda en una lista y, por cada petición, las llama una atrás de otra. La que llama es Express, no vos.

Se ejecuta entre que llega la petición y que responde tu controlador. Y `next()` es "pasá a la siguiente". Si una no llama a `next()` ni responde.

Un ejemplo concreto de nuestro código: `app.use(express.json())` es un middleware que mira el `Content-Type`, lee el stream del body, lo parsea y recién ahí llama a `next()`.

### ¿Por qué el ORDEN de los `app.use()` importa tanto?

Esto me parece muy frágil. Si cambio dos líneas de sitio se rompe todo.
¿Hay alguna forma de saber el orden correcto sin tener que memorizarlo?

**Respuesta:**
El orden no es un capricho de Express, es el orden en que vos querés que pasen las cosas. `app.use()` agrega al final de la lista y cada petición la recorre de arriba abajo.

La forma de no memorizarlo es preguntarte, por cada pieza: "¿qué pasa si esta responde primero?". Si responde sin llamar a `next()`, todo lo de abajo no corre. Con eso deducís el orden solo:

1. CORS primero que nada.
2. `express.json()`, porque las rutas necesitan `req.body`.
3. Las rutas.
4. El 404, último de los que responden: si llegó hasta acá es que nadie lo reconoció.
5. Los errores.

Si pusieras el 404 arriba, respondería 404 a absolutamente todo.
Es como si fuese una cadena de montaje, vamos por lo primero, luego por lo segundo, hasta llegar al final.

### Si me olvido de `app.use(express.json())`, ¿por qué `req.body` es `undefined`?

Y lo peor: no da ningún error, simplemente es `undefined` y me vuelvo loco buscando
el problema. ¿Por qué Express no avisa?

**Respuesta:**
Porque `req.body` no existe hasta que alguien lo llena. No es un objeto vacío: es `undefined`. Express lo deja así y solo un middleware que sepa leer el body lo define. Si no hay ninguno, nadie lo llena.

No avisa porque no puede saber si tu ruta espera body o no, o si lo quiere hacer o no. Un `GET /jobs` no lleva body y está perfecto que `req.body` no exista. Avisar en cada request sería ruido. Además el body es un stream: leerlo es una decisión tuya, porque solo se puede leer una vez.

### ¿Qué hace `next()` y por qué a veces no se llama?

En el middleware de CORS no veo ningún `next()`. ¿Lo llama el paquete `cors`
por dentro? ¿Qué pasa si un middleware nunca llama a `next()`?

**Respuesta:**
`next()` le dice a Express "seguí con la siguiente de la lista". Tiene dos formas:

- `next()` sin argumentos: seguí normal.
- `next(error)`: saltá directo a los manejadores de error.

En el middleware de CORS se llama a `next()` por dentro.

### ¿Cuál es la diferencia entre `app.use()` y `app.get()`?

Los dos reciben una ruta y una función. ¿`use` es para todos los métodos?

**Respuesta:**
Dos diferencias:

1. `app.use()` atiende cualquier método y `app.get()` solo GET.
2. En `app.use('/jobs', ...)` el path es un prefijo, matchea `/jobs`, `/jobs/123` y `/jobs/loquesea`. En `app.get('/jobs')` tiene que coincidir completo.

Por eso `app.use('/jobs', jobsRouter)` significa "todo lo que empiece con /jobs se lo paso a este router".

## Sobre el patrón MVC

### ¿No es complicar las cosas tener 3 archivos para una sola funcionalidad?

Para listar unos empleos tengo que abrir `routes`, `controllers` y `models`.
Todo cabía en 30 líneas en un solo archivo. ¿Cuándo empieza a merecer la pena?

**Respuesta:**
Para listar 34 jobs, no la merece. La pregunta correcta no es "cuántas líneas tengo hoy" sino "qué me va a pedir el próximo cambio". Y el próximo cambio está en el ejercicio 08 (tests) y en el 11 (cambiar el JSON por SQL). Con MVC, pasar a SQL es tocar solo `models/jobs.js`: los controladores y las rutas ni se enteran. Con todo en un archivo, hay que reescribirlo.

Esto escala en proyectos profesionales de mediano/gran tamaño. Por eso lo enseñamos.

### ¿Cómo sé qué código va en el modelo y cuál en el controlador?

La regla que he leído es "el modelo no sabe de HTTP", pero en la práctica dudo
mucho. Por ejemplo, decidir si algo es un 404, ¿es cosa del modelo (que sabe si
existe) o del controlador (que sabe de códigos HTTP)?

**Respuesta:**
El 404 es del controlador siempre. El modelo contesta una pregunta de datos ("¿existe este job?" -> el job, o `undefined` / `false`); el controlador traduce esa respuesta a HTTP ("no existe" -> 404 con `{ error: 'Job not found' }`).

La prueba de fuego es esta: si mañana usás `JobModel.getById(id)` desde un script de consola, ¿tiene sentido que ese script "devuelva un 404"? No. Un 404 es un concepto de HTTP, y el modelo no sabe que existe HTTP. Por eso no puede estar ahí.

### ¿Por qué el modelo devuelve `false` en vez de lanzar un error?

Me parece raro devolver un booleano. ¿No sería más claro un `throw`?

**Respuesta:**
Porque un `throw` significa "algo se rompió": corta el flujo y, si nadie lo atrapa, termina en un 500. Que un id no exista no es una rotura, es una respuesta esperada: el cliente preguntó por algo que no está.

Lo que sí justificaría un `throw` es un fallo de infraestructura: no se puede leer el archivo, el JSON está corrupto, la base no responde. Eso sí es un 500.

Ahora, devolver `false` también tiene un costo: mezcla dos significados ("no existe" y "no pude") en un solo valor. Con más casos conviene devolver `null` o un objeto con el resultado.

Lo hicimos así por el alcance del ejercicio, en proyectos medianos/grandes es una mejor idea devolver un objeto.

### ¿Qué son los métodos `static` y por qué no usamos `new JobModel()`?

Nunca creo un objeto de la clase. Entonces, ¿para qué uso una clase?
¿No sería lo mismo exportar cuatro funciones sueltas?

**Respuesta:**
Sería exactamente lo mismo. En este caso es una cuestión de gustos y orden. Se acostumbró en Backend escribir métodos a partir de clases, pero tranquilamente podrías hacerlo con funciones.

### ¿Por qué el `Router()` no lleva el prefijo `/jobs` dentro?

En `routes/jobs.js` las rutas son `/` y `/:id`, pero luego responden en `/jobs`.
Me confundió mucho al principio. ¿Dónde se "pega" ese prefijo?

**Respuesta:**
Se pega en `app.js`, en `app.use('/jobs', jobsRouter)`. Sus rutas son relativas a él.

Cuando llega `/jobs/123`, Express ve el prefijo `/jobs` del `app.use`, le pasa al router la parte que sobra (`/123`) y ahí matchea `/:id`. El prefijo no se "concatena" al texto de la ruta: se recorta antes de entrar al router.

## Primer ejercicio | GET con filtros

### ¿Por qué `??` y no `||` para los valores por defecto?

El comentario dice que con `||` el `offset=0` se rompería. Lo he leído tres veces
y creo que lo pillo, pero ¿qué otros valores dan problemas con `||`?
(¿El texto vacío también?)

**Respuesta:**
`||` se activa con cualquier valor *falso*: `0`, `''`, `false`, `NaN`, `null` y `undefined`. `??` solo con `null` y `undefined`. Esa es toda la diferencia.

### ¿Por qué se guarda el `total` ANTES de paginar?

Si lo calculo después, ¿qué sale mal exactamente? Me lo imagino, pero quiero
confirmarlo.

**Respuesta:**
Si contás después de paginar, contás la página, no la colección. Con `limit=10`, `total` sería siempre 10 (o menos, si quedan pocos), y el cliente no puede calcular cuántas páginas hay porque necesita el total real.

### ¿Por qué la respuesta es `{ data, total, limit, offset }` y no solo el array?

En el ejercicio anterior devolvía el array pelado. ¿Por qué ahora se envuelve?
¿Es una convención de las APIs?

**Respuesta:**
Porque un array no puede contar cosas sobre sí mismo. La paginación necesita metadata (cuántos hay en total, qué página estás viendo, cuántos pediste), y en JSON esa metadata tiene que ir en un objeto con los datos adentro.

Es convención de APIs REST: el cuerpo de una colección trae los datos + la info de la colección. Y te deja lugar para crecer sin romper a nadie: mañana agregás `links: { next, prev }` y los clientes que ya funcionaban siguen funcionando.

Un array pelado obliga al cliente a adivinar: si viene lleno o hay más; si viene vacío o si no hay nada. Con `total` sabe si hay página siguiente sin pedir nada extra.

## Segundo, tercero y cuarto ejercicio | El resto de verbos

### ¿Cuál es la diferencia real entre PUT y PATCH?

Sé la teoría ("uno reemplaza, el otro actualiza parcialmente"), pero en el código
la diferencia son unos puntos suspensivos:

```js
{ ...input, id }            // PUT
{ ...jobs[indice], ...input, id }  // PATCH
```

¿De verdad es solo eso? ¿No podría usar siempre PATCH y ya?

**Respuesta:**
En el código es chica la diferencia, pero el contrato es distinto:

- PUT dice: "este es el recurso completo". Si no mandás un campo, se borra. Es idempotente: mandar lo mismo dos veces da el mismo resultado.
- PATCH dice: "aplicá estos cambios". Lo que no mandás queda como estaba.

Por eso un PUT con `{ titulo }` deja el job sin `empresa` ni `ubicacion`: no es un bug.

Podés usar siempre PATCH, y muchas APIs lo hacen. Pero perdés la forma de decir "borrá este campo" y confundís a quien lee el código esperando la semántica estándar. Lo que no se puede es llamar a un endpoint PUT y que se comporte como PATCH.

### ¿Por qué PUT y PATCH devuelven 204 y no el objeto actualizado?

A mí me vendría bien recibir el objeto para no tener que pedirlo otra vez.
¿Por qué se hace así? ¿Es una norma o una elección?

**Respuesta:**
Es una elección si. El estándar permite las dos cosas: 200 con el recurso actualizado, o 204 ("listo, no te devuelvo nada").

Podes optar por los dos caminos.

### ¿Por qué el id lo genera el servidor y no el cliente?

Si el cliente manda un `id` en el body, lo ignoramos. ¿Qué pasaría si le hiciéramos
caso? ¿Podría alguien machacar otro empleo?

**Respuesta:**
Exacto, y ese es el motivo. Si el cliente elige el id, puede mandar uno que ya existe y pisar otro job sin querer (o a propósito). El servidor es el único que conoce los ids que hay.

### ¿Qué diferencia hay entre `.find()`, `.findIndex()` y `.filter()`?

Los uso en sitios distintos y a veces no sé cuál toca. ¿Hay alguna forma sencilla
de recordarlo?

**Respuesta:**
Me gusta pensarlo así:

- `.find()` -> el primer elemento que cumple, o `undefined`.
- `.findIndex()` -> la posición del primero, o `-1`.
- `.filter()` -> todos los que cumplen.


### ¿Por qué `splice` devuelve un array y hay que sacar el `[0]`?

```js
const [eliminado] = jobs.splice(indice, 1)
```

Esa línea tiene destructuring dentro de un `const` y me cuesta leerla.

**Respuesta:**
`splice(posicion, cuantos)` modifica el array original y devuelve los eliminados, que pueden ser ninguno, uno o varios. Por eso devuelve un array siempre.

El `const [eliminado] = ...` es destructuring de array: saca el primer elemento y le pone el nombre `eliminado`. Es lo mismo que:

```js
const eliminados = jobs.splice(indice, 1)
const eliminado = eliminados[0]
```

Si te queda más cómodo lo podes hacer así.

### Si reinicio el servidor, ¿se pierde todo lo que he creado?

Los cambios están en el array en memoria, ¿verdad? Entonces, ¿el `jobs.json` no se
modifica nunca? ¿Es normal que una API "de mentira" funcione así?

**Respuesta:**
Sí, se pierde todo, y es normal para aprender. En aplicaciones reales esto está en una Base de Datos que sí persiste las modificaciones.

## Quinto ejercicio | CORS

### ¿Qué es CORS y por qué existe?

Es lo que menos entiendo del ejercicio. Si mi API es pública, ¿por qué el navegador
se pone en medio y bloquea? ¿No debería decidirlo yo?

**Respuesta:**
El navegador no te protege a vos: protege al usuario que navega. Si cualquier web pudiera hacer `fetch` a tu banco usando las cookies de tu sesión, no haría falta atacarte, alcanzaría con que entres a una página maliciosa.

Por eso el navegador aplica la "política de mismo origen": una web solo puede leer respuestas de su propio origen, salvo que el servidor diga lo contrario. Y quien dice lo contrario es CORS: el servidor manda `Access-Control-Allow-Origin` y el navegador deja leer.

### ¿Por qué con `curl` sí funciona y desde el navegador no?

Esto me volvió loco: probé con curl, todo perfecto; abrí la web y error de CORS.
¿La API responde distinto según quién pregunte?

**Respuesta:**
La API responde igual; el que aplica la política es el navegador. `curl` no implementa CORS: no es su trabajo, y por eso te deja leer todo. Es también la razón por la que CORS no protege tu API de un atacante con `curl`.

### ¿Qué es una petición "preflight" con OPTIONS?

He visto ese método en la pestaña Network y yo no lo he llamado. ¿Quién la hace?
¿Por qué hay dos peticiones en vez de una?

**Respuesta:**
La hace el navegador solo, y no la llamás vos.

Antes de mandar una request "no simple", el navegador pregunta si puede. Por ejemplo: métodos `PUT`, `PATCH` o `DELETE`, o un `Content-Type: application/json` (que es justo lo que usás en el POST). Un `GET` simple no lleva preflight.

Es una petición `OPTIONS` al mismo endpoint con dos cabeceras: `Origin` (de dónde vengo) y `Access-Control-Request-Method` (qué pienso hacer). El middleware de CORS contesta `204` con `Access-Control-Allow-Origin` y `Access-Control-Allow-Methods`. Si esa respuesta no convence al navegador, la request real nunca se manda: por eso te enterás de un problema de CORS y no de un 400 del servidor.

Por eso el `app.use(corsMiddleware())` va antes de las rutas: si el OPTIONS cayera en tu 404, el navegador se quedaría sin permiso.

### ¿Por qué se dejan pasar las peticiones sin `origin`?

El código permite las que no tienen origen (curl, Postman). ¿Eso no es un agujero?
Si un atacante puede hacer una petición sin origen, ¿de qué sirve la lista blanca?

**Respuesta:**
No es un agujero, porque CORS no es un control de acceso. La lista blanca limita quién puede leer desde un navegador, nada más. Un atacante con `curl` nunca estuvo limitado por CORS, tenga o no la cabecera: se la puede inventar, la puede omitir, le da igual. CORS lo aplica el cliente.

Por eso dejar pasar sin origen es correcto: no hay navegador, no hay política que aplicar. Y es lo que te permite probar la API.

### ¿Podría poner `origin: '*'` y olvidarme?

Veo ese asterisco en muchos tutoriales. ¿Qué riesgo tiene?

**Respuesta:**
Para una API pública sin cookies está bien, y es lo que se usa cuando no hay nada privado que proteger (una API de datos abiertos, por ejemplo). El asterisco significa "cualquier origen puede leer".

Ahora, tres cosas que sí importan:

1. Con credenciales no funciona: si el cliente manda cookies (`credentials: 'include'`), el navegador rechaza `*` y exige el origen exacto. Ahí la función `origin` con la lista blanca es obligatoria.
2. Perdés visibilidad: con la lista blanca te enterás cuando un origen nuevo intenta entrar. Con `*`, no.
3. No te protege de nada: el que quiere tus datos no usa un navegador, usa `curl`.

## Sobre el `config.js`

### ¿Qué gano sacando el `10` de la paginación a un archivo aparte?

Al final es un número que uso en un solo sitio. ¿No es más fácil dejarlo donde se usa?

**Respuesta:**
Si, hoy es más fácil porque el proyecto es muy chico. Pero para proyectos que empiezan a ser medianos es muy importante tener centralizados los valores constantes para evitar duplicaciones incorrectas.

### ¿Por qué `process.env.PORT` tiene prioridad sobre mi configuración?

El comentario menciona servicios de hosting. ¿Ellos deciden el puerto y yo no puedo
elegir? ¿Por qué?

**Respuesta:**
Porque en un hosting el puerto no lo elegís vos, la plataforma te asigna uno por variable de entorno y enruta el tráfico público a ese puerto interno. Si tu app escucha fijo en 1234, el deploy arranca, no recibe nada, y parece que estuviera roto.

Depende del Hosting.
