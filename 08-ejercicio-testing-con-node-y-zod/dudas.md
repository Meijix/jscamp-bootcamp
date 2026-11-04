<!-- Aquí puedes poner tus dudas del ejercicio -->

# Mis dudas del ejercicio de Testing y Zod

## Sobre testing en general

### Si pruebo la app a mano y funciona, ¿para qué escribo tests?

Entiendo que "es buena práctica", pero me cuesta ver el beneficio ahora mismo.
Escribir los tests me ha llevado más tiempo que hacer la API entera.
¿Cuándo empieza a compensar de verdad?

**Respuesta:**
El test no reemplaza probar a mano: lo reemplaza a partir de la segunda vez. Probar a mano te cuesta minutos y te olvidás casos; la suite corre en 0,2 segundos y no se olvida de nada.

Compensa de verdad cuando el código se toca más de una vez, cuando lo toca otra persona, o cuando el fallo es silencioso.

### ¿Qué es un test de integración y en qué se diferencia de uno unitario?

Aquí levanto el servidor entero y hago peticiones reales. ¿Eso no es lo mismo que
probarlo a mano pero automatizado? ¿Cuándo escribiría un test "unitario"?

**Respuesta:**
Integración: se prueba el sistema completo. `fetch` -> HTTP -> Express -> middleware -> controlador -> modelo, todo junto, sin mocks.

Unitario: se prueba una pieza aislada, normalmente una función pura, con las dependencias reemplazadas.

Escribirías un test unitario cuando la integración es lenta o cuando una función tiene muchas ramas (parseos, cálculos, normalizaciones) y querés cubrir cada una sin levantar el servidor. En este ejercicio la lógica es fina y la integración rápida, así que integración tiene más sentido.

### ¿Cuántos tests son suficientes? ¿Hay que probarlo todo?

Si pruebo todos los casos posibles no acabo nunca. ¿Hay alguna regla para saber
qué merece la pena probar y qué no?

**Respuesta:**
No hay un número, si hay un criterio: un test por cada regla que el código promete y que puede romperse en silencio. Eso incluye los bordes que el enunciado nombra (3 y 100 caracteres), los caminos de error (404, 400) y un test por cada bug que arreglaste en el camino, para que no vuelva a pasar.

Hay que tener claro las responsabilidades de la aplicación y sus puntos débiles. Si mi aplicación hace búsquedas de `jobs`, es importante probar que se pueda buscar con los parámetros que permitimos; mitigar los casos borde e ignorar los no aceptados.

### ¿Y si mi test pasa pero el código está mal?

Me pasó justo en este ejercicio: descubrí que el filtro `?text=` estaba roto,
pero como no tenía ningún test que lo probara, todo parecía correcto.
¿Cómo sé que mis tests están probando lo que creo?

**Respuesta:**
Un test solo demuestra que midió lo que midió. Si el assert es débil (mirar únicamente el status), pasa aunque el bug esté adentro.

La técnica es escribir primero el test del bug: lo corrés y ves RED (falla por la razón correcta), después arreglás el código y ves GREEN. Ese paso es el que convierte "creo que mide" en "sé que mide".

Por eso los tests "tienen vida": no nos quedamos con los tests iniciales; si aparece un bug nuevo, creamos un tests para verificar que se corrigió y evitar que vuelva a pasar.

Los tests no solo existen para prevenir errores, sirven para que te puedas permitir cometer errores asegurandote de que no volverán a pasar.

## Tarea 1 | El schema de Zod

### ¿Para qué sirve Zod si ya puedo comprobar los datos con `if`?

En el ejercicio 6 validé con `if (!body.name || typeof body.name !== 'string')` y
funcionaba. ¿Qué me da Zod que no tenga ya?

**Respuesta:**
Zod convierte la validación en un dato declarativo: describís la forma una vez y de ahí salen la comprobación, los mensajes y el tipo. Con `if` te pasa lo que se ve en estas dudas: hay que acordarse del `trim()`, del largo máximo, de cada campo obligatorio, y repetirlo en POST, PUT y PATCH.

Da claridad y contratos claros; el código de validación interno en algunos casos es mucho mejor del que podamos hacer nosotros a mano y menos verboso: asegurarnos que un email tiene el formato correcto es muy fácil con Zod; complejo en JS.

### ¿Cuál es la diferencia entre `.parse()` y `.safeParse()`?

Entiendo que uno lanza excepción y el otro no. Pero, ¿cuándo querría yo que
lanzara una excepción?

**Respuesta:**
Acá usamos `safeParse` porque un 400 con `details` es una respuesta esperada, no una excepción: que un cliente mande un título vacío es parte del flujo normal de una API, no un accidente del programa.

`parse()` conviene cuando el fallo significa "esto no debería pasar nunca": la configuración del servidor al arrancar, un JSON que leés de tu propio disco. Ahí sí querés que explote. Son casos muy concretos.

### ¿Qué es `.partial()` y por qué sirve justo para el PATCH?

¿Convierte todo en opcional de golpe? ¿Y mantiene las demás reglas, como el mínimo
de 3 caracteres del título?

**Respuesta:**
`partial()` recorre el objeto y le pone `.optional()` a cada propiedad del primer nivel. No es recursivo: `data.technology` sigue con sus reglas.

y sí, mantiene las demás reglas: un `titulo` que viene sigue teniendo mínimo 3 y máximo 100. Lo único que cambia es que ahora puede no venir.

Por eso sirve para PATCH: si mandás solo `ubicacion`, no tiene sentido exigir `empresa`. Un PATCH con `{}` es válido y no cambia nada, y eso está bien: "no mandé nada" es una petición legal.

### ¿Qué diferencia hay entre `.optional()` y `.default([])`?

Los dos hacen que el campo "no sea obligatorio", ¿no? Pero uno lo deja `undefined`
y el otro lo rellena. ¿Cuándo uso cada uno?

**Respuesta:**
`.optional()` deja `undefined`, `.default([])` lo rellena.

La diferencia explota en tu código. Con `undefined` tenés que preguntar en cada lugar donde lo leas (`job.descripcion ?? ''`); con un default tenés siempre un valor usable.

Regla práctica: `default` cuando "vacío" tiene una representación sensata y el código la va a usar; `optional` cuando "no hay dato" es una respuesta legítima y distinta de vacío.

### ¿Por qué el schema no lleva el campo `id`?

Como el id lo genera el servidor, no lo valido. Pero entonces, si alguien manda un
`id` en el body, ¿Zod lo deja pasar sin avisar? ¿Debería rechazarlo?

**Respuesta:**
Porque el `id` lo inventa el servidor. Si el cliente pudiera mandarlo, podría pisar un job existente o inventar ids duplicados, y la base dejaría de tener una clave confiable.

### ¿Qué hay dentro de `result.error.issues`?

Lo devuelvo en la respuesta del 400 sin saber muy bien qué contiene. ¿Es seguro
enseñárselo al cliente o estoy filtrando información interna?

**Respuesta:**
Un array con un objeto por problema. Cada uno trae `path` (en qué campo), `message` (qué está mal), `code` (qué regla falló) y a veces los límites (`minimum`, `maximum`). Con eso el cliente puede señalar el campo exacto en un formulario.

Es seguro de mostrar: no expone código, ni stack, ni rutas del disco.

## Tarea 2 | Los tests

### ¿Por qué el servidor se levanta en `before()` y no dentro de cada test?

¿Es solo por velocidad o hay otra razón? ¿Sería "más correcto" que cada test tuviera
su propio servidor limpio?

**Respuesta:**
Por velocidad y porque el servidor no es lo que se está probando. Levantarlo una vez cuesta milisegundos; veinte veces suma y no agrega cobertura.

Lo que tiene que ser independiente es el dato de cada test, no el servidor. Por eso los tests de PUT/PATCH/DELETE crean su propio job con `crearJobDePrueba()` en vez de tocar uno del `jobs.json`.

### ¿Por qué hay que envolver `app.listen()` en una promesa?

```js
await new Promise((resolve) => { server = app.listen(PORT, resolve) })
```

Esta línea me parece rarísima. ¿Por qué `listen` no devuelve una promesa ya?
Y si no espero, ¿qué falla exactamente?

**Respuesta:**
Porque `listen()` es asíncrono con callback: le pedís al sistema operativo que abra el puerto y te avisa cuando está listo. `listen()` devuelve el servidor (para después poder hacer `server.close()`), no una promesa; por eso hay que envolverlo.

Si no esperás, el primer `fetch` puede salir antes de que el puerto esté escuchando.

Existe una versión más nueva y más legible: `server.listen(PORT)` seguido de `await once(server, 'listening')`, con `once` importado de `node:events`.

### ¿Qué significa que un test sea "inestable" (flaky)?

He leído que los tests que fallan a veces sí y a veces no son lo peor.
¿Por qué pasa eso? ¿Tiene que ver con no esperar bien a las cosas asíncronas?

**Respuesta:**
Casi siempre es una carrera: el test no espera algo (una promesa, un timer, una escritura a disco) y a veces llega tarde.

Son los peores porque te enseñan a no creerle a la suite: si un test falla, lo volvés a correr y pasa, no aprendiste nada. Y en CI, que es más lento, fallan más.

Se previenen con `await` en todo lo asíncrono, sin `sleep` "por las dudas" (esperan de menos en una máquina lenta y de más en la tuya) y sin compartir estado entre tests.

### ¿Por qué hay que cerrar el servidor en `after()`?

Si no lo hago, ¿qué pasa? ¿El comando `npm test` no termina nunca?

**Respuesta:**
Porque el proceso de Node no termina mientras tenga un listener abierto. `server.close()` deja de aceptar conexiones y libera el puerto; sin eso,el test imprime el resumen de los tests y se queda vivo para siempre.

### ¿Por qué se usa el puerto 5678 y no el 5432 de siempre?

¿Es solo para no chocar si tengo el servidor abierto en otra terminal?

**Respuesta:**
El puerto 5678 es para no chocar con el de desarrollo (5432): si tenés el servidor de dev abierto en otra terminal y el test intenta el mismo puerto, te comés un `EADDRINUSE`.

### ¿Cuándo uso `assert.strictEqual` y cuándo `assert.ok`?

Entiendo que uno compara con `===` y el otro solo mira si es "verdadero".
¿Y para comparar dos objetos? Porque `{a:1} === {a:1}` es `false`, ¿no?

**Respuesta:**
`strictEqual` compara con `===`, tipo y valor, y cuando falla te muestra los dos valores. `ok` solo mira si el valor es truthy: sirve para "existe", "es un array", "es mayor que cero", y no compara nada.

Para objetos y arrays, `===` compara referencias: `{ a: 1 } === { a: 1 }` es `false`, aunque se vean iguales. Ahí va `deepStrictEqual`, que compara estructura, valores y tipos, propiedad por propiedad.

`strictEqual` para valores simples, `deepStrictEqual` para estructuras, `ok` para condiciones ("es un array", "hay al menos uno").

### ¿Por qué los tests crean su propio job en vez de usar uno del `jobs.json`?

El enunciado propone usar un id concreto, pero en el código se crea uno nuevo con un
POST. Entiendo que es para que no dependan entre ellos... pero, ¿no estoy
"ensuciando" la base de datos con jobs de prueba?

**Respuesta:**
Por independencia, y porque los tests comparten estado. El `import` del `jobs.json` es una sola instancia en memoria: si un test borrara un job del JSON, cualquier otro test que lo esperara fallaría según el orden.

Creando su propio job, cada test controla el estado inicial y nadie le puede arruinar el trabajo.

### ¿Qué pasa si los tests se ejecutan en un orden distinto?

¿`node --test` los ejecuta siempre de arriba abajo? ¿Y si algún día los ejecutara
en paralelo, se romperían los míos?

**Respuesta:**
Hoy `node --test` corre los archivos en paralelo, pero los tests de un mismo archivo en orden de declaración. Tus tests dependen del orden en un detalle sutil: el de `?offset=1` espera que el segundo job del JSON sea `d35b2c89-...`, y eso es cierto solo mientras no haya POSTs antes.

Los describes de arriba no crean jobs, así que hoy se cumple. Pero si mañana agregás un POST en el describe de `GET /jobs`, ese test empieza a fallar sin que hayas tocado el endpoint.

Si dos tests fallan al invertir el orden, el problema no es el runner, es el estado compartido. Y si algún día se paralelizaran, los que crean y borran en la misma lista se pisarían entre sí.

### ¿Por qué en el test del PUT no hago `response.json()`?

Porque devuelve 204 y no hay body. Pero, ¿qué pasaría si lo intentara? ¿Da error o
me devuelve `null`?

**Respuesta:**
Porque 204 significa "No Content": no hay body que leer. `response.json()` intentaría parsear un texto vacío y tiraría `SyntaxError: Unexpected end of JSON input`; no devuelve `null`.

### En el test del PATCH, ¿por qué es tan importante comprobar el campo que NO envié?

El comentario dice que sin ese assert un PATCH mal hecho pasaría igual.
Creo que lo entiendo, pero me gustaría que me lo explicaran con otro ejemplo.

**Respuesta:**
Porque el assert del cambio solo demuestra "ese campo se escribió", y hay implementaciones rotas que escriben y borran en la misma operación.

Ejemplo concreto: si el PATCH hiciera `jobs[i] = { ...sentJob, id }` (reemplazo, como el PUT), el `titulo` se actualizaría igual de bien y `empresa` desaparecería. El test de "el título cambió" pasaría verde con el bug adentro.

Otro ejemplo: un PATCH que arma el job nuevo con `||` en vez de `??` y borra los campos vacíos o los `0`. También pasaría.

El assert del campo que no mandaste convierte el test en "se actualizó solo lo que mandé", que es exactamente la promesa del PATCH. Sin ese assert, el test no prueba el PATCH: prueba un PUT.

## Sobre los bugs que aparecieron

### ¿Cómo es posible que `.includes(normalizeTech)` no diera ningún error?

Estaba pasando una **función** donde tenía que ir un **texto**, y JavaScript no dijo
nada: simplemente el filtro siempre devolvía vacío. ¿Hay alguna forma de que
JavaScript me avise de estas cosas? (¿Es esto lo que arregla TypeScript?)

**Respuesta:**
Porque `includes` no valida el tipo del argumento: si le pasás cualquier cosa, la convierte a texto y busca eso. Una función convertida a texto es su código fuente, así que buscabas `"() => text.toLowerCase()"` dentro del título de un job. Nunca coincidía y nunca fallaba.

JavaScript no puede avisarte porque no conoce los tipos.

### ¿Por qué es tan grave que `total` devolviera el tamaño de la página?

La API respondía 200 y parecía correcta. Solo se nota si intentas calcular las
páginas desde el cliente. ¿Cómo se detectan estos fallos "silenciosos"?

**Respuesta:**
Porque la API mentía con un 200 y el cliente no tenía forma de notarlo. `data` traía los 10 jobs correctos de la página, pero `total` era el tamaño de esa página, no el total de resultados.

El front calcula las páginas como `Math.ceil(total / limit)`. Con `total` fijo en 10 y `limit` 10, ve siempre una sola página.

El test que agregué compara el `total` de una página chica contra el total real traído en otra petición, así no depende de cuántos jobs haya en el JSON.

### Si el enunciado dice que la lógica "ya está implementada", ¿debía arreglar los bugs?

Me da un poco de miedo tocar código que no he escrito yo. ¿Está bien arreglarlo o
debería haber escrito un test que falle y dejarlo ahí para comentarlo?

**Respuesta:**
Sí, lo hiciste perfecto. De hecho era una parte silenciosa del ejercicio. Correr tests para darse cuenta que había errores en el código.

## Sobre la validación en las rutas

### ¿Por qué el PUT usa `validateJob` y no `validatePartialJob`?

Porque PUT reemplaza el objeto entero, ¿verdad? Pero si un PUT y un PATCH acaban
llamando casi al mismo código del modelo, ¿de verdad importa tanto la diferencia?

**Respuesta:**
Porque PUT reemplaza el recurso entero: si un job completo exige `titulo`, `empresa` y `ubicacion`, el body del PUT tiene que traerlas, y que falte una es un 400. El PATCH es el que admite campos sueltos, y para eso está `validatePartialJob`.

### ¿Por qué el middleware hace `req.body = result.data`?

¿Qué tiene de diferente `result.data` respecto a lo que mandó el cliente?
¿Zod está limpiando o transformando algo por el camino?

**Respuesta:**
Porque `result.data` no es el body original: es el body validado y normalizado. Zod descarta las claves que no están en el schema (`id`, campos inventados) y aplica los `default` (por ejemplo `data.technology: []` cuando no vino).
