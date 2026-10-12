<!-- Aquí puedes poner tus dudas del ejercicio -->

# Mis dudas del ejercicio de API REST con Express y MVC

## Sobre Express

### Si ya sabía hacer un servidor con Node puro, ¿para qué Express?

En el ejercicio anterior lo hice todo a mano y funcionaba. ¿Qué me ahorra Express
exactamente? Me da miedo aprender a usar una herramienta sin entender qué hay debajo.

### ¿Qué es un middleware? Es la palabra que más me cuesta

Entiendo que es "algo que se ejecuta en medio", pero ¿en medio de qué y de qué?
¿Es una función normal? ¿Quién la llama?

### ¿Por qué el ORDEN de los `app.use()` importa tanto?

Esto me parece muy frágil. Si cambio dos líneas de sitio se rompe todo.
¿Hay alguna forma de saber el orden correcto sin tener que memorizarlo?

### Si me olvido de `app.use(express.json())`, ¿por qué `req.body` es `undefined`?

Y lo peor: no da ningún error, simplemente es `undefined` y me vuelvo loco buscando
el problema. ¿Por qué Express no avisa?

### ¿Qué hace `next()` y por qué a veces no se llama?

En el middleware de CORS no veo ningún `next()`. ¿Lo llama el paquete `cors`
por dentro? ¿Qué pasa si un middleware nunca llama a `next()`?

### ¿Cuál es la diferencia entre `app.use()` y `app.get()`?

Los dos reciben una ruta y una función. ¿`use` es para todos los métodos?

## Sobre el patrón MVC

### ¿No es complicar las cosas tener 3 archivos para una sola funcionalidad?

Para listar unos empleos tengo que abrir `routes`, `controllers` y `models`.
Todo cabía en 30 líneas en un solo archivo. ¿Cuándo empieza a merecer la pena?

### ¿Cómo sé qué código va en el modelo y cuál en el controlador?

La regla que he leído es "el modelo no sabe de HTTP", pero en la práctica dudo
mucho. Por ejemplo, decidir si algo es un 404, ¿es cosa del modelo (que sabe si
existe) o del controlador (que sabe de códigos HTTP)?

### ¿Por qué el modelo devuelve `false` en vez de lanzar un error?

Me parece raro devolver un booleano. ¿No sería más claro un `throw`?

### ¿Qué son los métodos `static` y por qué no usamos `new JobModel()`?

Nunca creo un objeto de la clase. Entonces, ¿para qué uso una clase?
¿No sería lo mismo exportar cuatro funciones sueltas?

### ¿Por qué el `Router()` no lleva el prefijo `/jobs` dentro?

En `routes/jobs.js` las rutas son `/` y `/:id`, pero luego responden en `/jobs`.
Me confundió mucho al principio. ¿Dónde se "pega" ese prefijo?

## Primer ejercicio | GET con filtros

### ¿Por qué `??` y no `||` para los valores por defecto?

El comentario dice que con `||` el `offset=0` se rompería. Lo he leído tres veces
y creo que lo pillo, pero ¿qué otros valores dan problemas con `||`?
(¿El texto vacío también?)

### ¿Por qué se guarda el `total` ANTES de paginar?

Si lo calculo después, ¿qué sale mal exactamente? Me lo imagino, pero quiero
confirmarlo.

### ¿Por qué la respuesta es `{ data, total, limit, offset }` y no solo el array?

En el ejercicio anterior devolvía el array pelado. ¿Por qué ahora se envuelve?
¿Es una convención de las APIs?

## Segundo, tercero y cuarto ejercicio | El resto de verbos

### ¿Cuál es la diferencia real entre PUT y PATCH?

Sé la teoría ("uno reemplaza, el otro actualiza parcialmente"), pero en el código
la diferencia son unos puntos suspensivos:

```js
{ ...input, id }            // PUT
{ ...jobs[indice], ...input, id }  // PATCH
```

¿De verdad es solo eso? ¿No podría usar siempre PATCH y ya?

### ¿Por qué PUT y PATCH devuelven 204 y no el objeto actualizado?

A mí me vendría bien recibir el objeto para no tener que pedirlo otra vez.
¿Por qué se hace así? ¿Es una norma o una elección?

### ¿Por qué el id lo genera el servidor y no el cliente?

Si el cliente manda un `id` en el body, lo ignoramos. ¿Qué pasaría si le hiciéramos
caso? ¿Podría alguien machacar otro empleo?

### ¿Qué diferencia hay entre `.find()`, `.findIndex()` y `.filter()`?

Los uso en sitios distintos y a veces no sé cuál toca. ¿Hay alguna forma sencilla
de recordarlo?

### ¿Por qué `splice` devuelve un array y hay que sacar el `[0]`?

```js
const [eliminado] = jobs.splice(indice, 1)
```

Esa línea tiene destructuring dentro de un `const` y me cuesta leerla.

### Si reinicio el servidor, ¿se pierde todo lo que he creado?

Los cambios están en el array en memoria, ¿verdad? Entonces, ¿el `jobs.json` no se
modifica nunca? ¿Es normal que una API "de mentira" funcione así?

## Quinto ejercicio | CORS

### ¿Qué es CORS y por qué existe?

Es lo que menos entiendo del ejercicio. Si mi API es pública, ¿por qué el navegador
se pone en medio y bloquea? ¿No debería decidirlo yo?

### ¿Por qué con `curl` sí funciona y desde el navegador no?

Esto me volvió loco: probé con curl, todo perfecto; abrí la web y error de CORS.
¿La API responde distinto según quién pregunte?

### ¿Qué es una petición "preflight" con OPTIONS?

He visto ese método en la pestaña Network y yo no lo he llamado. ¿Quién la hace?
¿Por qué hay dos peticiones en vez de una?

### ¿Por qué se dejan pasar las peticiones sin `origin`?

El código permite las que no tienen origen (curl, Postman). ¿Eso no es un agujero?
Si un atacante puede hacer una petición sin origen, ¿de qué sirve la lista blanca?

### ¿Podría poner `origin: '*'` y olvidarme?

Veo ese asterisco en muchos tutoriales. ¿Qué riesgo tiene?

## Sobre el `config.js`

### ¿Qué gano sacando el `10` de la paginación a un archivo aparte?

Al final es un número que uso en un solo sitio. ¿No es más fácil dejarlo donde se usa?

### ¿Por qué `process.env.PORT` tiene prioridad sobre mi configuración?

El comentario menciona servicios de hosting. ¿Ellos deciden el puerto y yo no puedo
elegir? ¿Por qué?
