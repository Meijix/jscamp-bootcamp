## Aquí puedes poner tus dudas sobre el ejercicio

# Mis dudas del ejercicio del CLI con Node

## Sobre Node en general

### ¿Por qué ahora escribo `node algo.js` en vez de abrir el navegador?

Vengo de hacer webs y me cuesta cambiar el chip. ¿Es el mismo JavaScript?
Si es el mismo, ¿por qué aquí no existe `document` ni `window`? ¿Y por qué en el
navegador no puedo leer archivos y aquí sí?

### ¿Qué significa el prefijo `node:` en `import { readdir } from 'node:fs/promises'`?

He visto código donde ponen `'fs'` a secas y funciona igual. ¿Cuál es la diferencia?
¿Es solo por claridad o cambia algo?

### ¿Por qué importo de `node:fs/promises` y no de `node:fs`?

Si importo del segundo, ¿tengo que usar callbacks? ¿Los callbacks son "lo antiguo"
o todavía se usan?

### ¿Qué son los `import` y los `require`? ¿Por qué veo los dos por internet?

Cuando busco ejemplos, la mitad usan `require(...)` y la otra mitad `import`.
¿Cuál debería usar yo? ¿Tiene algo que ver con el `"type": "module"` del package.json?

## Primer ejercicio | Leer el directorio

### ¿Por qué `process.argv` empieza en la posición 2?

Entiendo que las dos primeras son la ruta de node y la del script, pero
¿por qué se incluyen si nunca las uso? ¿Alguien las usa para algo?

### ¿Los argumentos llegan siempre como texto?

Si escribo `node cli.js 5`, ¿me llega el número 5 o el texto `"5"`?
Me pasó algo parecido en el ejercicio de JavaScript y quiero asegurarme.

### ¿Qué hace exactamente `stat()` y por qué `isDirectory()` lleva paréntesis?

Otras cosas como `.size` no los llevan. ¿Cómo sé cuáles son propiedades y cuáles
son funciones? ¿Hay alguna pista?

### ¿Por qué `.map()` con `async` no me devuelve los datos?

Escribí esto y me salió un array lleno de `Promise { <pending> }`:

```js
const elementos = nombres.map(async (nombre) => { ... })
```

¿Por qué el `.map()` no espera? ¿Y qué hace `Promise.all` exactamente para arreglarlo?

### ¿`Promise.all` lanza todo a la vez o de uno en uno?

Si tengo 1000 archivos, ¿está abriendo 1000 cosas a la vez? ¿Eso no es malo?

### ¿Por qué usar `join()` en vez de pegar las rutas con `+` y `'/'`?

El comentario dice que es por Windows. Pero si yo trabajo en Mac y mi código solo
lo voy a usar yo, ¿de verdad importa?

## Segundo y tercer ejercicio | Ordenar y filtrar

### ¿Por qué `.sort()` modifica el array original?

Esperaba que me devolviera uno nuevo, como `.filter()` o `.map()`. ¿Hay alguna lógica
detrás de qué métodos modifican y cuáles no, o hay que memorizarlo?

### ¿Qué tiene que devolver la función que le paso a `.sort()`?

Veo que devuelve números negativos, cero o positivos, pero no entiendo cómo usa
`.sort()` esos números para ordenar.

### ¿Por qué `localeCompare` y no simplemente `a > b`?

Probé con `>` y salían primero todas las mayúsculas. ¿Por qué? ¿JavaScript no sabe
que "A" y "a" son la misma letra?

### ¿Es correcto detectar los flags con `startsWith('--')`?

Me parece un poco casero. ¿Los programas de verdad (git, npm...) lo hacen así o
usan alguna librería? ¿Existe algo en Node para esto?

### ¿Qué pasa si el usuario pone `--files` y `--folders` a la vez?

Lo he resuelto con un aviso, pero no sé si es lo correcto. ¿Debería dar un error y
terminar? ¿O debería mostrar todo? ¿Cómo se decide eso?

## Cuarto ejercicio | Permisos y errores

### ¿Para qué sirve `--permission` si el archivo ya está en mi ordenador?

No entiendo de qué me protege. Si yo escribí el script, ya sé lo que hace.
¿Es para cuando ejecuto código de otra persona?

### ¿Qué es `error.code` y dónde puedo ver la lista de todos?

Veo `ENOENT`, `EACCES`, `ENOTDIR`... parecen códigos de otra época.
¿De dónde salen esos nombres?

### ¿Por qué mirar `error.code` y no el mensaje del error?

El comentario dice que el mensaje puede cambiar de idioma. ¿De verdad Node traduce
los mensajes de error según el idioma del sistema?

### ¿Qué es `process.exit(1)` y quién lee ese número?

Si yo ejecuto el script a mano en la terminal, ¿alguien se entera de ese 1?
¿Para qué sirve exactamente?

### ¿`console.error` y `console.log` no son lo mismo?

En pantalla se ven igual. ¿Cuál es la diferencia real?

## Sobre el resultado

### ¿Por qué mi salida no queda alineada en columnas?

Descubrí `padEnd()`, pero si un nombre de archivo es larguísimo se descuadra todo
igual. ¿Cómo lo hacen programas como `ls` para que siempre quede bien?

### ¿Cómo hacen los CLIs de verdad para tener colores?

He visto CLIs con texto verde y rojo. ¿Eso se puede hacer con `console.log` a secas
o hace falta instalar algo?
