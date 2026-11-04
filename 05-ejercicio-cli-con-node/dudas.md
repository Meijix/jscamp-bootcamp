## Aquí puedes poner tus dudas sobre el ejercicio

# Mis dudas del ejercicio del CLI con Node

## Sobre Node en general

### ¿Por qué ahora escribo `node algo.js` en vez de abrir el navegador?

Vengo de hacer webs y me cuesta cambiar el chip. ¿Es el mismo JavaScript?
Si es el mismo, ¿por qué aquí no existe `document` ni `window`? ¿Y por qué en el
navegador no puedo leer archivos y aquí sí?

**Respuesta:**
Es el mismo lenguaje, pero no es el mismo entorno. El JavaScript en sí (variables, funciones, clases, promesas) es idéntico; lo que cambia es qué te ofrece el entorno alrededor.

El navegador te da todo lo de la página: `document`, `window`, `localStorage`, el DOM. Node no tiene página, así que nada de eso existe. A cambio te da lo que a un navegador le está prohibido: `process` (los argumentos, el entorno, el código de salida), `node:fs` (el disco), `node:net` (sockets), `node:child_process`, etc.

Imagina que Node es una caja enorme de herramientas, en donde en ella hay un martillo (navegador) y un cerrucho (consola). Podes usar varias cosas dentro de esa caja de herramientas y eso es lo que hicimos en este ejercicio. Dejamos de usar la herramienta del navegador para usar otras herramientas.


### ¿Qué significa el prefijo `node:` en `import { readdir } from 'node:fs/promises'`?

He visto código donde ponen `'fs'` a secas y funciona igual. ¿Cuál es la diferencia?
¿Es solo por claridad o cambia algo?

**Respuesta:**
Si, por claridad y para dejar claro que ese paquete proviene de Node. Existe la posibilidad de que descarguemos una dependencia con el mismo nombre, y usarla equívocamente. Por ejemplo:

```bash
npm install fs
```

Ese comando instala una dependencia que no es de Node.

Si en nuestro proyecto la tenemos instalada y queremos usar la de Node, fácilmente nos podemos confundir, así que usamos:

```js
import { readdir } from 'node:fs
````

### ¿Por qué importo de `node:fs/promises` y no de `node:fs`?

Si importo del segundo, ¿tengo que usar callbacks? ¿Los callbacks son "lo antiguo"
o todavía se usan?

**Respuesta:**
`node:fs` te da las dos formas a la vez: callbacks (`readdir(ruta, (error, nombres) => ...)`) y las versiones sincrónicas (`readdirSync`).

`node:fs/promises` te da las mismas funciones devolviendo promesas, así que podés usar `await`, `try/catch` y `Promise.all`. Por dentro es el mismo código: es una capa fina encima.

Son anteriores, sí, pero no están muertos. De igual forma es mejor usar la convención actual.

### ¿Qué son los `import` y los `require`? ¿Por qué veo los dos por internet?

Cuando busco ejemplos, la mitad usan `require(...)` y la otra mitad `import`.
¿Cuál debería usar yo? ¿Tiene algo que ver con el `"type": "module"` del package.json?

**Respuesta:**
Son dos sistemas de módulos distintos: `require` es CommonJS (el de siempre) e `import` es ESM (el estándar de JavaScript, el usado hoy en día). Node soporta los dos y por eso te cruzás con ambos.

La regla que decide en Node: un archivo `.js` se lee como CommonJS **salvo** que el `package.json` más cercano tenga `"type": "module"` (o que el archivo sea `.mjs`).

Y acá está lo que te estaba pasando: la carpeta de este ejercicio no tenía `package.json`, así que Node veía `import` en un `.js` que, según la regla, era CommonJS. Lo que hacía era avisarte y reinterpretarlo como ESM al vuelo:

```
Warning: Module type of file:///.../cli.js is not specified and it does not parse as CommonJS.
```
Por eso agregué un `package.json` con `"type": "module"`: es literalmente la respuesta a tu pregunta.

## Primer ejercicio | Leer el directorio

### ¿Por qué `process.argv` empieza en la posición 2?

Entiendo que las dos primeras son la ruta de node y la del script, pero
¿por qué se incluyen si nunca las uso? ¿Alguien las usa para algo?

**Respuesta:**
Porque `process.argv` no es "los argumentos de mi programa": es la línea de comandos completa, incluido cómo se lanzó. `[0]` es el ejecutable y `[1]` es el script.

Se usan y bastante:

- `[0]` le dice a un script con qué intérprete está corriendo, útil cuando el mismo archivo se puede lanzar con node, bun o tsx.
- `[1]` es la ruta del script.

Vos no los necesitás, y por eso `.slice(2)` es la forma: te quedás con lo que escribió el usuario.

### ¿Los argumentos llegan siempre como texto?

Si escribo `node cli.js 5`, ¿me llega el número 5 o el texto `"5"`?
Me pasó algo parecido en el ejercicio de JavaScript y quiero asegurarme.

**Respuesta:**
Siempre texto, siempre. Hay casos muy raros en los que los parámetros infieren el type y devuelven el valor como tal.

### ¿Qué hace exactamente `stat()` y por qué `isDirectory()` lleva paréntesis?

Otras cosas como `.size` no los llevan. ¿Cómo sé cuáles son propiedades y cuáles
son funciones? ¿Hay alguna pista?

**Respuesta:**
`stat()` es una llamada al sistema que te da los metadatos de un elemento: tamaño, fecha de modificación, permisos y tipo. No abre el archivo ni lo lee, solo pregunta por su ficha.

`isDirectory()` lleva paréntesis porque es un método, la manera de saber cuáles son funciones y cuales no es conociendolas, y apoyarse en el IDE que siempre da pistas sobre ello.

### ¿Por qué `.map()` con `async` no me devuelve los datos?

Escribí esto y me salió un array lleno de `Promise { <pending> }`:

```js
const elementos = nombres.map(async (nombre) => { ... })
```

¿Por qué el `.map()` no espera? ¿Y qué hace `Promise.all` exactamente para arreglarlo?

**Respuesta:**
Porque `.map()` no espera nada: recorre el array, llama a tu función con cada elemento y junta los valores de retorno. Y una función `async` **siempre** devuelve una promesa.

`Promise.all(array)` hace lo que vos querías: recibe promesas, las espera a todas y devuelve un array con los valores ya resueltos, **en el mismo orden** del array original.

### ¿`Promise.all` lanza todo a la vez o de uno en uno?

Si tengo 1000 archivos, ¿está abriendo 1000 cosas a la vez? ¿Eso no es malo?

**Respuesta:**
Todo a la vez: las arranca todas y espera. No hay límite de promesas.

No es malo para 1000. Para 100.000 se nota. Llegado el caso, tenés tres caminos:

- `Promise.allSettled`, si querés que ninguna falla corte el resto
- partir en tandas (un `for` sobre bloques de 100)
- `for await...of` secuencial, cuando querés poder cortar al primer resultado.

### ¿Por qué usar `join()` en vez de pegar las rutas con `+` y `'/'`?

El comentario dice que es por Windows. Pero si yo trabajo en Mac y mi código solo
lo voy a usar yo, ¿de verdad importa?

**Respuesta:**
El problema es que el código no vive solo: mañana corre en un Docker Linux, en el CI, o alguien lo clona en Windows, y aparecen los problemas. `join` cuesta lo mismo que `+` y no tiene ese problema. Siempre hay que pensar en que nuestro código no va a trabajar únicamente en nuestro local.

## Segundo y tercer ejercicio | Ordenar y filtrar

### ¿Por qué `.sort()` modifica el array original?

Esperaba que me devolviera uno nuevo, como `.filter()` o `.map()`. ¿Hay alguna lógica
detrás de qué métodos modifican y cuáles no, o hay que memorizarlo?

**Respuesta:**
Hay que aprenderlos, o en su defecto buscar cuando necesites qué cosa.

### ¿Qué tiene que devolver la función que le paso a `.sort()`?

Veo que devuelve números negativos, cero o positivos, pero no entiendo cómo usa
`.sort()` esos números para ordenar.

**Respuesta:**
Tiene que devolver un número, y `.sort()` solo mira el signo:

- negativo -> `a` va antes que `b`
- positivo -> `b` va antes que `a`
- cero -> empate (y desde ES2019 el empate conserva el orden original)

Con esos resultados ordena los valores que se pasan al `.sort()`.

### ¿Por qué `localeCompare` y no simplemente `a > b`?

Probé con `>` y salían primero todas las mayúsculas. ¿Por qué? ¿JavaScript no sabe
que "A" y "a" son la misma letra?

**Respuesta:**
Porque `<` y `>` no comparan letras, comparan números. Cada carácter tiene un código (UTF-16) y `'Z'` es 90 mientras `'a'` es 97. Así que con `<` todas las mayúsculas van antes que todas las minúsculas, y las letras con tilde quedan al final: `'á'` es 225, después de la `'z'` (122).

`localeCompare` usa las reglas de ordenación del idioma (ICU), así que:

- `'á'` y `'a'` se consideran la misma letra a nivel primario;
- la `'ñ'` cae entre la `'n'` y la `'o'`
- las mayúsculas no se adelantan a las minúsculas.

Y un extra que te va a servir algún día: `a.localeCompare(b, undefined, { numeric: true })` ordena `archivo2` antes que `archivo10`, como hace el Finder. Con `<` te queda `archivo10` antes que `archivo2`.

### ¿Es correcto detectar los flags con `startsWith('--')`?

Me parece un poco casero. ¿Los programas de verdad (git, npm...) lo hacen así o
usan alguna librería? ¿Existe algo en Node para esto?

**Respuesta:**
Para el ejercicio está bien.

Los programas de verdad no lo hacen así: usan un parser, porque tienen más casos.

- flags con valor: `--formato=json` o `--formato json`;
- flags cortas: `-a`, y combinadas: `-al`;
- `--` para decir "de acá en adelante todo es una ruta", así se puede listar una carpeta que se llama `--raro`;
- flags desconocidas: un `--as` con typo hoy se ignora en silencio y el listado sale sin ordenar, como si nada.

Node trae un parser en el core desde la 18.3: `parseArgs` de `node:util`.

```js
import { parseArgs } from 'node:util'

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    asc: { type: 'boolean' },
    desc: { type: 'boolean' },
    files: { type: 'boolean' },
    folders: { type: 'boolean' },
  },
})

// values.asc es true o undefined, y positionals[0] es la carpeta
```

Fuera del core, los más usados son `commander` y `yargs`. Para este ejercicio no hacen falta: tu versión con `filter` e `includes` es más corta y se entiende mejor.

### ¿Qué pasa si el usuario pone `--files` y `--folders` a la vez?

Lo he resuelto con un aviso, pero no sé si es lo correcto. ¿Debería dar un error y
terminar? ¿O debería mostrar todo? ¿Cómo se decide eso?

**Respuesta:**
La regla general que uso: una combinación imposible es un error de uso, y un resultado legítimamente vacío es éxito. Lo que hiciste está genial.

## Cuarto ejercicio | Permisos y errores

### ¿Para qué sirve `--permission` si el archivo ya está en mi ordenador?

No entiendo de qué me protege. Si yo escribí el script, ya sé lo que hace.
¿Es para cuando ejecuto código de otra persona?

**Respuesta:**
Exacto, no te protege de vos: te protege de código que no escribiste. Un `npm install` corre scripts de paquetes de terceros con tus permisos; un script que bajaste de internet, también. `--permission` arranca Node con casi todo bloqueado y vos vas abriendo lo que necesita:

### ¿Qué es `error.code` y dónde puedo ver la lista de todos?

Veo `ENOENT`, `EACCES`, `ENOTDIR`... parecen códigos de otra época.
¿De dónde salen esos nombres?

**Respuesta:**
`error.code` es un texto corto y estable que dice qué falló. No lo inventa Node caso por caso: la mayoría son nombres de `errno`, la tabla de errores de Unix. `EACCES` es "permiso denegado" (errno 13), `ENOENT` es "no existe" (2), `ENOTDIR` es "no es un directorio" (20). La `E` inicial es de *error*.

Dónde está la lista?

- Los del sistema: la página "Common system errors" de la documentación de Node.
- Los propios de Node: los que empiezan con `ERR_` (`ERR_ACCESS_DENIED`, `ERR_INVALID_ARG_TYPE`...). Cada uno está documentado en la página de la API que lo lanza.

### ¿Por qué mirar `error.code` y no el mensaje del error?

El comentario dice que el mensaje puede cambiar de idioma. ¿De verdad Node traduce
los mensajes de error según el idioma del sistema?

**Respuesta:**
En realidad el mensaje puede cambiar de redacción entre versiones de Node, incluye la ruta y no está garantizado; el código sí.

Lo práctico es decidír con el código y, si vas a mostrar algo, le pegás el mensaje. Así el usuario tiene las dos cosas: qué falló y dónde (`ENOENT` más la ruta).

### ¿Qué es `process.exit(1)` y quién lee ese número?

Si yo ejecuto el script a mano en la terminal, ¿alguien se entera de ese 1?
¿Para qué sirve exactamente?

**Respuesta:**
`process.exit(codigo)` termina el proceso en el acto con ese número. Lo lee todo lo que esté esperando al proceso, en definitiva Node.

Las convenciones son 0 es éxito, 1 es error genérico, 2 es error de uso y luego hay otros más. El más común es 1.

### ¿`console.error` y `console.log` no son lo mismo?

En pantalla se ven igual. ¿Cuál es la diferencia real?

**Respuesta:**
En la terminal se ven igual, pero van a flujos distintos: `console.log` escribe en **stdout** y `console.error` (y `console.warn`) en **stderr**.

Cada uno tiene una responsabilidad diferente.

## Sobre el resultado

### ¿Por qué mi salida no queda alineada en columnas?

Descubrí `padEnd()`, pero si un nombre de archivo es larguísimo se descuadra todo
igual. ¿Cómo lo hacen programas como `ls` para que siempre quede bien?

**Respuesta:**
Porque `padEnd(25)` cuenta caracteres de JavaScript, no celdas de la terminal.

Lo que podes hacer es usar `console.table()` o en su defecto, calcular el texto más largo y sumarle n espacios para asegurarte de que el largo de las celdas siempre van a contener todos los caracteres de forma alineada.

### ¿Cómo hacen los CLIs de verdad para tener colores?

He visto CLIs con texto verde y rojo. ¿Eso se puede hacer con `console.log` a secas
o hace falta instalar algo?

**Respuesta:**
Con secuencias de escape ANSI: son texto invisible que la terminal interpreta como instrucción. `\x1b[31m` pone rojo y `\x1b[0m` vuelve a lo normal.

```js
const rojo = (texto) => `\x1b[31m${texto}\x1b[0m`
console.log(rojo('❌ no se pudo leer'))
```

Con `console.log` a secas alcanza, no hace falta instalar nada. Igual, casi todos usan una librería que ya sabe el catálogo de colores: `picocolors` (chiquita) o `chalk`.
