<!-- Aquí puedes dejar las dudas que tengas sobre el ejercicio -->

# Mis dudas del ejercicio del servidor con Node

## Sobre cómo funciona un servidor

### ¿Qué es realmente un "servidor"? ¿Es un programa o un ordenador?

Cuando ejecuto `node server.js` en mi portátil, ¿mi portátil se ha convertido en un
servidor? ¿Puede alguien de fuera entrar en él?

**Respuesta:**
"Servidor" es un rol, no un aparato. Cualquier máquina puede ser cliente y servidor a la vez: lo que cambia es quién inicia la conversación. El que pide es el cliente, el que espera y responde es el servidor.

Cuando corrés `node server.js` pasa esto: tu programa le pide al sistema operativo que le reserve un puerto y se queda esperando ahí, sin terminar. Tu portátil se convirtió en servidor **de ese puerto** mientras el proceso esté vivo. Si lo cortás con Ctrl+C, dejó de serlo.

Los servidores que levantas en tu maquina no son accesibles a internet. Para hacer esto tenés que exponer tu puerto a internet y es un proceso diferente al que hacemos en el ejercicio y normalmente.

### ¿Qué es un puerto y por qué el 3000?

¿Por qué hay que elegir un número? ¿Qué pasa si elijo uno que ya está ocupado?
(De hecho me pasó: me salió un error `EADDRINUSE` y no entendí nada.)

**Respuesta:**
El puerto es la puerta dentro de la máquina. La IP te lleva al edificio (la máquina), el puerto te dice a qué departamento (qué programa).

El 3000 no tiene nada de especial: es la convención para desarrollo web.

`EADDRINUSE` es literalmente "esa dirección ya está en uso": casi siempre es un `node server.js` anterior que quedó vivo en otra terminal.

Y justamente por esto el puerto va en una variable de entorno: `PORT=3001 node server.js` y listo, sin tocar el código.

### ¿Por qué la función del `createServer` se ejecuta muchas veces?

Yo la escribo una vez, pero por lo visto se ejecuta en cada petición.
¿Quién la llama? ¿Se queda esperando en un bucle?

**Respuesta:**
Es un **handler**, como un manejador. `createServer(handler)` no lo ejecuta, lo **registra**. Se lo queda guardado con la pregunta "qué hago cuando llegue una petición?".

Después del registro, Node entra en su event loop: un bucle interno que se queda dormido esperando eventos del sistema operativo. Cuando llega una conexión con datos, el sistema lo despierta, Node parsea la petición HTTP y llama a tu handler con `req` y `res`. Una vez por petición: si llegan 100, se llama 100 veces.

No es un `while (true)`.  

### ¿Qué son exactamente `req` y `res`?

Entiendo que uno es lo que pide el cliente y el otro lo que respondo, pero
¿por qué `res` es un objeto al que hay que ir "escribiendo" en vez de simplemente
devolver algo con `return`?

**Respuesta:**
Son dos objetos con formas bien distintas:

- `req` es un stream de **lectura**: el body va llegando por partes (por eso los eventos `data`/`end`).
- `res` es un `ServerResponse` y es un stream de **escritura**: le vas agregando la respuesta.

¿Y por qué no devolver algo con `return`? Por tres motivos:

1. A nadie le interesa el retorno de tu handler: `createServer` lo llama e ignora lo que devuelvas. No hay nadie del otro lado esperando ese `return`.
2. Una respuesta HTTP no es "un valor": es un código de estado, unas cabeceras y un cuerpo, y el cuerpo **puede escribirse en pedazos**. Imaginate mandar algo de 2 GB: no lo tenés entero en memoria, lo vas tirando de a poco. `res` soporta eso; un `return` no.

### Si me olvido de `res.end()`, ¿qué pasa?

Probé a quitarlo y el navegador se quedó cargando para siempre. ¿Por qué no da un
error? ¿Se queda esa petición ahí colgada eternamente?

**Respuesta:**
No da error porque no es un error de JavaScript: es una respuesta **a medio enviar**. Para el cliente HTTP el mensaje no terminó, así que se queda esperando.

`res.end()` es lo que marca el final: cierra el `chunked`. Sin eso el cliente no tiene cómo saber que ya está todo.

## Primer y quinto ejercicio | GET /users y los filtros

### ¿Por qué hay que construir una URL falsa: `new URL(req.url, 'http://localhost')`?

Esto me parece un apaño muy raro. Si ya tengo la URL en `req.url`, ¿por qué
necesito inventarme un dominio? ¿Por qué `req.url` no viene entera?

**Respuesta:**
Porque `req.url` **no es una URL**: es lo que vino en la primera línea del pedido HTTP. Un pedido real empieza así:

```
GET /users?name=ana&limit=2 HTTP/1.1
```

Ahí no hay protocolo ni dominio: solo la ruta con la query. Eso se llama *origin-form*.

La clase `URL` está pensada para URLs completas. Si le pasás una ruta relativa necesita un punto de partida para parsear, y ese segundo argumento es eso, una base. `http://localhost` es un dominio de mentira que no se usa para nada: después solo leemos `pathname` y `searchParams`, así que el host nunca se toca ni se conecta a ningún lado.

### ¿Qué es `searchParams` y por qué no parto el texto yo mismo?

Podría hacer un `split('?')` y luego `split('&')`. ¿Qué gano usando la clase URL?

**Respuesta:**
Ganás que el texto viene **escapado** y `split()` no lo sabe. Mirá:

```js
const url = new URL('http://x/users?name=Luc%C3%ADa&tag=a&tag=b')

url.searchParams.get('name')     // 'Lucía'     <- ya decodificado
url.searchParams.getAll('tag')   // ['a', 'b']  <- claves repetidas

// A mano:
'name=Luc%C3%ADa'.split('=')[1]  // 'Luc%C3%ADa' <- roto
```

Toda URL que arme un navegador o `fetch` viene percent-encoded: los acentos, los espacios y hasta los `&` que van dentro de un valor. `searchParams` decodifica, entiende `+` como espacio, contempla claves repetidas, ignora un `?` vacío y te da `get`, `getAll` y `has`. Hacerlo a mano es reescribir (mal) algo que ya está resuelto.

### ¿Los query params llegan siempre como texto?

Si mando `?limit=3`, ¿me llega `3` o `"3"`? Y si me llega texto, ¿qué pasa si
comparo `"9" > "10"`? (Creo que ahí está uno de mis bugs.)

**Respuesta:**
Siempre texto. En una URL no hay tipos: `?limit=3` te da `'3'`, y `?limit=` te da `''`.

Sobre la comparación, tenías razón en sospechar, pero el detalle es más fino. `'9' > '10'` es `true` porque cuando **los dos** lados son strings JS compara carácter por carácter y `'9'` va después de `'1'`.

Tu bug estaba en otra parte, y tenía dos formas:

```js
Number('abc')         // NaN <- no lanza error, devuelve NaN
user.age >= NaN       // false siempre -> lista vacía con un 200
```

Si el cliente manda `?minAge=abc`, el filtro no coincide con nadie y la API responde `200 []`. El cliente no puede distinguir "no hay usuarios de esa edad" de "escribí mal el parámetro". Eso lo corregimos: ahora devuelve `400` diciendo cuál parámetro está mal.

La segunda forma era `?limit=0`: `Number('0')` es `0`, pero `0 || resultado.length` da `resultado.length`, así que pedir cero te devolvía todos. Se arregló con `??`, que solo reemplaza `null`/`undefined`, o sea el caso "no mandé el parámetro".

### ¿Por qué se pagina al final, después de filtrar?

Si lo hiciera al revés, ¿qué saldría mal exactamente? Me cuesta verlo sin probarlo.

**Respuesta:**
Paginar significa "dame la página N del **resultado**". Si cortás primero, estás paginando la lista cruda y después filtrás dentro de ese pedacito.

- Mal (paginar y después filtrar): los 2 primeros crudos son Miguel y Mateo, el filtro "ana" no coincide con ninguno -> `[]`.
- Bien (filtrar y después paginar): los que contienen "ana" son Ana -> los 2 primeros -> `[Ana]`.

Al revés la API te dice "no hay nadie que se llame Ana" aunque Ana exista. Y no lo ves hasta probar con un filtro selectivo, porque sin filtros el resultado parece coherente.

La regla general es: **filtrar -> ordenar -> paginar**. Paginar siempre al final, porque es lo único que depende de todo lo anterior.

### ¿Por qué hago una copia con `[...users]` en vez de usar `users` directamente?

Si `.filter()` ya devuelve un array nuevo, ¿para qué la copia? ¿Es por si algún día
uso `.sort()`?

**Respuesta:**
En este caso, lo hicimos así por convención y costumbre a la regla. Pero realmente no hay una razón, podrías haber usado el mismo `users` directamente.

## Segundo ejercicio | POST /users

### ¿Por qué el body llega "a trozos" y no de golpe?

Esta es la parte que menos entiendo de todo el ejercicio. ¿Por qué Node me obliga a
juntar los pedazos a mano? ¿No podría dármelo entero y ya?

**Respuesta:**
Transporta un flujo continuo de bytes. No existe el concepto de "mensaje" a ese nivel. Lo que hay son paquetes que la red va entregando como puede.

La cabecera `Content-Length` (o `Transfer-Encoding: chunked`) le dice a Node cuántos bytes esperar, pero eso es metadata: sabe cuánto va a llegar, no tiene los bytes todavía. A medida que llegan, los emite como eventos `data`.

### ¿Qué son los "eventos" `data`, `end` y `error`?

¿Es lo mismo que el `addEventListener` del navegador? ¿Por qué aquí se llama `.on()`?

**Respuesta:**
Es la misma idea con otro nombre. `req` es un `EventEmitter`, el patrón de eventos de Node; el del navegador se llama `EventTarget`.

En `req` aparecen tres: `data` cuando llega un trozo, `end` cuando ya no hay más y `error` si algo se rompe en el camino. El de `error` es obligatorio: si un emitter emite `error` y no hay listener, Node lanza una excepción y se te cae el proceso.

### ¿Qué es una Promise y por qué la función `json(req)` devuelve una?

Sé usar `await`, pero nunca había **creado** una promesa con `new Promise`.
¿Qué son `resolve` y `reject`? ¿Los llamo yo o los llama alguien?

**Respuesta:**
Una Promise representa un valor que todavía no tenés y que va a estar en algún momento (o va a fallar). Tiene tres estados: `pending`, `fulfilled` y `rejected`. Una vez que cambia de estado, no vuelve atrás.

`resolve` y `reject` son las dos únicas salidas, y las llamás **vos**, porque te las pasa el constructor:

```js
new Promise((resolve, reject) => {
  // acá va el trabajo que tarda
  resolve(dato)   // fulfilled: el await recibe dato
  reject(error)   // rejected: el await lanza el error
})
```

La función que le pasás se ejecuta **inmediatamente** al crear la promise; lo que tarda es el `resolve`.

Por qué `json(req)` devuelve una Promise? Porque leer el body es asíncrono: los datos llegan después, por eventos. Si devolviera el string directo, tendría que devolver `''` porque todavía no llegó nada. La promise es la forma de decir "te aviso cuando esté completo", y así podés escribir `const body = await json(req)` y leerlo de arriba abajo.

### ¿Por qué hay que poner la cabecera `Content-Type`?

Si mando texto que parece JSON, ¿el navegador no se da cuenta solo?
¿Qué cambia exactamente al poner esa línea?

**Respuesta:**
La cabecera es la etiqueta del paquete. El body son bytes sueltos; sin `Content-Type` el que recibe no tiene forma de saber si son JSON, HTML, texto o una imagen. El cliente no lo adivina por el aspecto.

### ¿Por qué `JSON.stringify` si el objeto ya está ahí?

¿Por qué no puedo mandar el objeto tal cual? ¿Qué significa que "por la red solo
viaja texto"?

**Respuesta:**
Porque por la red no viaja ningún objeto, viajan **bytes**. `{ id: '...', name: 'Ana' }` es una estructura en la memoria de tu proceso, con referencias y todo; no hay forma de mandar eso por un cable. Hay que serializarlo: convertirlo a un texto con una sintaxis que el otro lado sepa reconstruir. Eso es `JSON.stringify`, el `parse` al revés.

### ¿Debería validar los datos que llegan? ¿Hasta dónde?

He comprobado que `name` sea texto y `age` un número. Pero ¿y si mandan una edad
negativa? ¿Y 5000 años? ¿Dónde se pone el límite de lo que hay que comprobar?

**Respuesta:**
Nunca te fíes del cliente. Puede ser un navegador, un script o alguien con `curl` probando qué pasa con `{"age":-999}`.

Hay tres niveles, y conviene no mezclarlos:

1. **Forma** (¿es lo que espero?): `name` es texto no vacío, `age` es un entero.
2. **Rango** (¿es sensato?): `age` entre 0 y 120, `name` de hasta 80 caracteres.
3. **Reglas del negocio** (¿tiene sentido este dato acá?): email único, edad mínima para registrarse, país soportado. Eso no se resuelve con `if` sueltos.

Validá lo que el sistema **necesita** para no romperse.

## Tercer y cuarto ejercicio | Health check y 404

### ¿Para qué sirve de verdad un endpoint `/health`?

¿Quién lo llama? ¿Es algo automático? Si mi servidor está caído, no va a responder
a nada, ni siquiera a `/health`... así que ¿qué sentido tiene?

**Respuesta:**
`/health` cubre si el proceso está vivo pero no puede trabajar. Por ejemplo, la base de datos se cayó y todas las consultas fallan; el proceso está saturado y responde en 30 segundos; se quedó sin memoria.

### ¿Por qué el 404 tiene que ir el último?

Lo entendí al ponerlo arriba y ver que TODO respondía 404. Pero, ¿por qué el
código sigue ejecutándose después de un `if` que ya ha respondido? ¿No debería
parar ahí?

**Respuesta:**
Porque responder **no interrumpe nada**. `enviarJSON` escribe bytes en el socket y devuelve `undefined`. No hay excepción, no hay `break`.

Si el 404 estuviera arriba y tuviera su `return`, respondería 404 a todo. Y si le sacás el `return`, es peor: intenta escribir una segunda respuesta en la misma conexión y Node tira `ERR_HTTP_HEADERS_SENT` ("cannot set headers after they are sent").

### ¿Qué hace realmente `return enviarJSON(...)`?

Estoy devolviendo el resultado de una función que no devuelve nada. ¿El `return`
está ahí solo para cortar la ejecución? ¿Es una trampa o es normal hacerlo?

**Respuesta:**
1. `enviarJSON(...)` se ejecuta primero y responde (devuelve `undefined`).
2. `return` corta el handler en ese punto.

## Sobre los códigos de estado

### ¿Por qué 201 al crear y no 200?

Si todo ha ido bien, ¿no es lo mismo? ¿Alguien se da cuenta de la diferencia?

**Respuesta:**
Es información que el cliente lee. `200 OK` significa "salió bien"; `201 Created` significa "salió bien **y además creé un recurso nuevo**". Un SDK, un test o un panel de métricas puede distinguirlos sin leer el body.

### ¿Cómo sé qué código usar en cada caso?

400, 404, 500... ¿Hay una lista corta con los que se usan de verdad en el día a día?

**Respuesta:**
La regla de oro son los grupos:
- **2xx** salió bien
- **3xx** el recurso está en otro lado
- **4xx** el cliente se equivocó
- **5xx** el servidor se equivocó.

Si dudás entre 4xx y 5xx preguntate: ¿el cliente puede arreglarlo mandando otra cosa? Si sí, 4xx.

Los más usados son `200, 201, 400, 404, 500`. Depende el tipo de aplicación.

## Sobre el `.env`

### ¿Qué es `process.loadEnvFile()` y por qué hay que ponerlo en un try/catch?

Si el archivo `.env` no existe, ¿por qué lanza un error en vez de no hacer nada?

**Respuesta:**
Es una función que viene de Node y es el contrato que eligieron mantener.

Si no hay un `.env` en nuestro directorio y confiamos en que si lo hay, estaíamos usando un valor inexistente -> generaría otros errores.

Es mejor tener un error encapsulado a un error generico sin saber cual es el causante.

### ¿Por qué no pongo el puerto directamente en el código?

Si siempre voy a usar el 3000, ¿qué gano metiéndolo en un `.env`?

**Respuesta:**
Porque el mismo código corre en lugares donde el puerto es distinto. Lo podes usar en tu máquina, pero si luego lo queres usar en Docker, CI, etc. Necesitas un puerto diferente.
