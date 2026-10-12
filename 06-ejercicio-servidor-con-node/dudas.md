<!-- Aquí puedes dejar las dudas que tengas sobre el ejercicio -->

# Mis dudas del ejercicio del servidor con Node

## Sobre cómo funciona un servidor

### ¿Qué es realmente un "servidor"? ¿Es un programa o un ordenador?

Cuando ejecuto `node server.js` en mi portátil, ¿mi portátil se ha convertido en un
servidor? ¿Puede alguien de fuera entrar en él?

### ¿Qué es un puerto y por qué el 3000?

¿Por qué hay que elegir un número? ¿Qué pasa si elijo uno que ya está ocupado?
(De hecho me pasó: me salió un error `EADDRINUSE` y no entendí nada.)

### ¿Por qué la función del `createServer` se ejecuta muchas veces?

Yo la escribo una vez, pero por lo visto se ejecuta en cada petición.
¿Quién la llama? ¿Se queda esperando en un bucle?

### ¿Qué son exactamente `req` y `res`?

Entiendo que uno es lo que pide el cliente y el otro lo que respondo, pero
¿por qué `res` es un objeto al que hay que ir "escribiendo" en vez de simplemente
devolver algo con `return`?

### Si me olvido de `res.end()`, ¿qué pasa?

Probé a quitarlo y el navegador se quedó cargando para siempre. ¿Por qué no da un
error? ¿Se queda esa petición ahí colgada eternamente?

## Primer y quinto ejercicio | GET /users y los filtros

### ¿Por qué hay que construir una URL falsa: `new URL(req.url, 'http://localhost')`?

Esto me parece un apaño muy raro. Si ya tengo la URL en `req.url`, ¿por qué
necesito inventarme un dominio? ¿Por qué `req.url` no viene entera?

### ¿Qué es `searchParams` y por qué no parto el texto yo mismo?

Podría hacer un `split('?')` y luego `split('&')`. ¿Qué gano usando la clase URL?

### ¿Los query params llegan siempre como texto?

Si mando `?limit=3`, ¿me llega `3` o `"3"`? Y si me llega texto, ¿qué pasa si
comparo `"9" > "10"`? (Creo que ahí está uno de mis bugs.)

### ¿Por qué se pagina al final, después de filtrar?

Si lo hiciera al revés, ¿qué saldría mal exactamente? Me cuesta verlo sin probarlo.

### ¿Por qué hago una copia con `[...users]` en vez de usar `users` directamente?

Si `.filter()` ya devuelve un array nuevo, ¿para qué la copia? ¿Es por si algún día
uso `.sort()`?

## Segundo ejercicio | POST /users

### ¿Por qué el body llega "a trozos" y no de golpe?

Esta es la parte que menos entiendo de todo el ejercicio. ¿Por qué Node me obliga a
juntar los pedazos a mano? ¿No podría dármelo entero y ya?

### ¿Qué son los "eventos" `data`, `end` y `error`?

¿Es lo mismo que el `addEventListener` del navegador? ¿Por qué aquí se llama `.on()`?

### ¿Qué es una Promise y por qué la función `json(req)` devuelve una?

Sé usar `await`, pero nunca había **creado** una promesa con `new Promise`.
¿Qué son `resolve` y `reject`? ¿Los llamo yo o los llama alguien?

### ¿Por qué hay que poner la cabecera `Content-Type`?

Si mando texto que parece JSON, ¿el navegador no se da cuenta solo?
¿Qué cambia exactamente al poner esa línea?

### ¿Por qué `JSON.stringify` si el objeto ya está ahí?

¿Por qué no puedo mandar el objeto tal cual? ¿Qué significa que "por la red solo
viaja texto"?

### ¿Debería validar los datos que llegan? ¿Hasta dónde?

He comprobado que `name` sea texto y `age` un número. Pero ¿y si mandan una edad
negativa? ¿Y 5000 años? ¿Dónde se pone el límite de lo que hay que comprobar?

## Tercer y cuarto ejercicio | Health check y 404

### ¿Para qué sirve de verdad un endpoint `/health`?

¿Quién lo llama? ¿Es algo automático? Si mi servidor está caído, no va a responder
a nada, ni siquiera a `/health`... así que ¿qué sentido tiene?

### ¿Por qué el 404 tiene que ir el último?

Lo entendí al ponerlo arriba y ver que TODO respondía 404. Pero, ¿por qué el
código sigue ejecutándose después de un `if` que ya ha respondido? ¿No debería
parar ahí?

### ¿Qué hace realmente `return enviarJSON(...)`?

Estoy devolviendo el resultado de una función que no devuelve nada. ¿El `return`
está ahí solo para cortar la ejecución? ¿Es una trampa o es normal hacerlo?

## Sobre los códigos de estado

### ¿Por qué 201 al crear y no 200?

Si todo ha ido bien, ¿no es lo mismo? ¿Alguien se da cuenta de la diferencia?

### ¿Cómo sé qué código usar en cada caso?

400, 404, 500... ¿Hay una lista corta con los que se usan de verdad en el día a día?

## Sobre el `.env`

### ¿Qué es `process.loadEnvFile()` y por qué hay que ponerlo en un try/catch?

Si el archivo `.env` no existe, ¿por qué lanza un error en vez de no hacer nada?

### ¿Por qué no pongo el puerto directamente en el código?

Si siempre voy a usar el 3000, ¿qué gano metiéndolo en un `.env`?
