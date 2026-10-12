<!-- Aquí puedes poner tus dudas del ejercicio -->

# Mis dudas del ejercicio de Testing y Zod

## Sobre testing en general

### Si pruebo la app a mano y funciona, ¿para qué escribo tests?

Entiendo que "es buena práctica", pero me cuesta ver el beneficio ahora mismo.
Escribir los tests me ha llevado más tiempo que hacer la API entera.
¿Cuándo empieza a compensar de verdad?

### ¿Qué es un test de integración y en qué se diferencia de uno unitario?

Aquí levanto el servidor entero y hago peticiones reales. ¿Eso no es lo mismo que
probarlo a mano pero automatizado? ¿Cuándo escribiría un test "unitario"?

### ¿Cuántos tests son suficientes? ¿Hay que probarlo todo?

Si pruebo todos los casos posibles no acabo nunca. ¿Hay alguna regla para saber
qué merece la pena probar y qué no?

### ¿Y si mi test pasa pero el código está mal?

Me pasó justo en este ejercicio: descubrí que el filtro `?text=` estaba roto,
pero como no tenía ningún test que lo probara, todo parecía correcto.
¿Cómo sé que mis tests están probando lo que creo?

## Tarea 1 | El schema de Zod

### ¿Para qué sirve Zod si ya puedo comprobar los datos con `if`?

En el ejercicio 6 validé con `if (!body.name || typeof body.name !== 'string')` y
funcionaba. ¿Qué me da Zod que no tenga ya?

### ¿Cuál es la diferencia entre `.parse()` y `.safeParse()`?

Entiendo que uno lanza excepción y el otro no. Pero, ¿cuándo querría yo que
lanzara una excepción?

### ¿Qué es `.partial()` y por qué sirve justo para el PATCH?

¿Convierte todo en opcional de golpe? ¿Y mantiene las demás reglas, como el mínimo
de 3 caracteres del título?

### ¿Qué diferencia hay entre `.optional()` y `.default([])`?

Los dos hacen que el campo "no sea obligatorio", ¿no? Pero uno lo deja `undefined`
y el otro lo rellena. ¿Cuándo uso cada uno?

### ¿Por qué el schema no lleva el campo `id`?

Como el id lo genera el servidor, no lo valido. Pero entonces, si alguien manda un
`id` en el body, ¿Zod lo deja pasar sin avisar? ¿Debería rechazarlo?

### ¿Qué hay dentro de `result.error.issues`?

Lo devuelvo en la respuesta del 400 sin saber muy bien qué contiene. ¿Es seguro
enseñárselo al cliente o estoy filtrando información interna?

## Tarea 2 | Los tests

### ¿Por qué el servidor se levanta en `before()` y no dentro de cada test?

¿Es solo por velocidad o hay otra razón? ¿Sería "más correcto" que cada test tuviera
su propio servidor limpio?

### ¿Por qué hay que envolver `app.listen()` en una promesa?

```js
await new Promise((resolve) => { server = app.listen(PORT, resolve) })
```

Esta línea me parece rarísima. ¿Por qué `listen` no devuelve una promesa ya?
Y si no espero, ¿qué falla exactamente?

### ¿Qué significa que un test sea "inestable" (flaky)?

He leído que los tests que fallan a veces sí y a veces no son lo peor.
¿Por qué pasa eso? ¿Tiene que ver con no esperar bien a las cosas asíncronas?

### ¿Por qué hay que cerrar el servidor en `after()`?

Si no lo hago, ¿qué pasa? ¿El comando `npm test` no termina nunca?

### ¿Por qué se usa el puerto 5678 y no el 5432 de siempre?

¿Es solo para no chocar si tengo el servidor abierto en otra terminal?

### ¿Cuándo uso `assert.strictEqual` y cuándo `assert.ok`?

Entiendo que uno compara con `===` y el otro solo mira si es "verdadero".
¿Y para comparar dos objetos? Porque `{a:1} === {a:1}` es `false`, ¿no?

### ¿Por qué los tests crean su propio job en vez de usar uno del `jobs.json`?

El enunciado propone usar un id concreto, pero en el código se crea uno nuevo con un
POST. Entiendo que es para que no dependan entre ellos... pero, ¿no estoy
"ensuciando" la base de datos con jobs de prueba?

### ¿Qué pasa si los tests se ejecutan en un orden distinto?

¿`node --test` los ejecuta siempre de arriba abajo? ¿Y si algún día los ejecutara
en paralelo, se romperían los míos?

### ¿Por qué en el test del PUT no hago `response.json()`?

Porque devuelve 204 y no hay body. Pero, ¿qué pasaría si lo intentara? ¿Da error o
me devuelve `null`?

### En el test del PATCH, ¿por qué es tan importante comprobar el campo que NO envié?

El comentario dice que sin ese assert un PATCH mal hecho pasaría igual.
Creo que lo entiendo, pero me gustaría que me lo explicaran con otro ejemplo.

## Sobre los bugs que aparecieron

### ¿Cómo es posible que `.includes(normalizeTech)` no diera ningún error?

Estaba pasando una **función** donde tenía que ir un **texto**, y JavaScript no dijo
nada: simplemente el filtro siempre devolvía vacío. ¿Hay alguna forma de que
JavaScript me avise de estas cosas? (¿Es esto lo que arregla TypeScript?)

### ¿Por qué es tan grave que `total` devolviera el tamaño de la página?

La API respondía 200 y parecía correcta. Solo se nota si intentas calcular las
páginas desde el cliente. ¿Cómo se detectan estos fallos "silenciosos"?

### Si el enunciado dice que la lógica "ya está implementada", ¿debía arreglar los bugs?

Me da un poco de miedo tocar código que no he escrito yo. ¿Está bien arreglarlo o
debería haber escrito un test que falle y dejarlo ahí para comentarlo?

## Sobre la validación en las rutas

### ¿Por qué el PUT usa `validateJob` y no `validatePartialJob`?

Porque PUT reemplaza el objeto entero, ¿verdad? Pero si un PUT y un PATCH acaban
llamando casi al mismo código del modelo, ¿de verdad importa tanto la diferencia?

### ¿Por qué el middleware hace `req.body = result.data`?

¿Qué tiene de diferente `result.data` respecto a lo que mandó el cliente?
¿Zod está limpiando o transformando algo por el camino?
