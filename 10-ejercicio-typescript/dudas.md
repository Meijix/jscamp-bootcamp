<!-- Aquí puedes poner tus dudas sobre el ejercicio -->

# Mis dudas del ejercicio de TypeScript

## Sobre TypeScript en general

### Si al final se convierte en JavaScript, ¿qué gano?

Escribo el doble de código y el resultado es el mismo. Entiendo que "avisa de
errores", pero justo los errores que me avisa son los que yo no habría cometido...
¿o eso es lo que creo?

**Respuesta:**
Los tipos no se ejecutan, trabajan mientras escribís. Pensalo como el revisor más
rápido y más paciente que vas a tener: lee todo el proyecto en un segundo y te marca los
lugares donde un valor no encaja con lo que el resto del código espera.

Lo que ganás en concreto:

- **Errores antes de ejecutar**: propiedades mal escritas, argumentos cambiados de orden, `undefined` que se cuela.
- **Autocompletado real**, basado en los datos y no en adivinanzas.
- **Refactors seguros**: renombrás `company` y el compilador te lista los doce lugares.
- **Documentación que no miente**: la firma dice qué entra y qué sale.

El costo no es "escribir el doble": escribís los tipos una vez (y cada vez menos, porque
inferís). Como con los tests del ejercicio 8, no se nota en un
archivo suelto; se nota cuando el proyecto crece y lo toca otra persona.

### ¿Los tipos existen cuando el programa se está ejecutando?

Esto no lo tengo nada claro. Si le digo que `salary` es `number`, ¿alguien comprueba
eso mientras el programa corre? ¿O desaparece todo al compilar?

**Respuesta:**
Desaparece todo. Se llama **type erasure** ("borrado de tipos"): al pasar a JavaScript se
quitan las anotaciones y el código queda igual que si nunca hubieras tipado.

Consecuencias concretas:

Los tipos son en capa de **desarrollo**, no de ejecución. Sirven para que el código que escribís sea coherente con lo que vos creés; no para defenderte de datos que vienen de afuera.

### Si los tipos desaparecen, ¿qué pasa con los datos que vienen de una API?

Puedo decir que la respuesta es de tipo `Job`, pero el servidor podría mandarme
cualquier cosa. ¿TypeScript me protege ahí o me está dando una falsa seguridad?
(¿Es por eso que existe Zod?)

**Respuesta:**
Falsa seguridad si. Esta línea no valida nada:

```ts
const jobs = (await res.json()) as Job[] // le estás mintiendo al compilador
```

`res.json()` devuelve `any`, y con `as Job[]` le pedís a TypeScript que te crea. Si el
servidor manda `{ title: undefined }`, `job.title.toLowerCase()` explota en runtime.

La regla es: **los tipos valen dentro de tu programa; en la frontera se valida de verdad**.
Fronteras son la API, `localStorage`, el input del usuario, las variables de entorno y los query params.

Con Zod describís el schema, lo corrés sobre el JSON en runtime y
el tipo lo sacás del schema (`z.infer`). Así el tipo no es una promesa tuya: es el resultado de una comprobación real.

### ¿Por qué `node index.ts` funciona sin compilar nada?

Pensaba que había que ejecutar `tsc` primero. ¿Node entiende TypeScript ahora?
¿Y entonces para qué sirve `tsc --noEmit`?

**Respuesta:**
Node moderno (22.6 con flag, 23 en adelante por defecto) hace **type stripping**: borra las anotaciones de tipo y ejecuta el JavaScript resultante. No compila ni comprueba: solo recorta.

Y ahí está el detalle importante: **Node ejecuta aunque los tipos estén mal**. Si ponés `const n: number = "hola"`, `node index.ts` corre igual y falla en runtime. Por eso `tsc --noEmit` sigue siendo necesario: `tsc` es el que **comprueba**; `--noEmit` significa
"no generes los `.js`, solo decime si está bien".

La división queda así: `node` ejecuta, `tsc` chequea.

### ¿Qué diferencia hay entre `type` e `interface`?

En el ejercicio uso los dos y no sé si hay una razón o es por variar.
¿Cuándo tengo que usar uno y cuándo el otro?

**Respuesta:**
En el 90% de los casos son intercambiables.

- **`interface`** describe solo formas de objeto. Se puede **extender* (`extends`).
- **`type`** puede describir cualquier cosa: uniones, tuplas, primitivos, tipos calculados (`Pick`, `Partial`), y se combina con `&`.

`type` para datos y uniones (que es el 90% de lo que vas a escribir),
`interface` cuando estás publicando un contrato que otros podrían querer extender o cuando querés `implements` en una clase.

### ¿Qué significa "inferir" un tipo?

Si escribo `const x = 5`, ¿TypeScript ya sabe que es un número? Entonces,
¿cuándo tengo que escribir los tipos a mano y cuándo puedo dejar que los adivine?

**Respuesta:**
Inferir es deducir el tipo a partir del valor, sin que lo escribas: `const x = 5` es `5`.

Para variables locales, callbacks (`.map((job) => ...)` sabe solo que
`job` es `Job`, mejor que vos) y objetos obvios, podes dejar que los tipos se infieran.

## Primer y segundo ejercicio | Literales y objetos

### ¿Qué es un "tipo literal"? ¿Un texto puede ser un tipo?

Me cuesta entender que `'junior'` sea un tipo y no un valor. ¿Es como un enum?

**Respuesta:**
Sí: en TypeScript los valores también pueden ser tipos. `'junior'` como tipo significa "exactamente este texto, ni uno más". La unión de literales es la forma moderna de escribir un enum de strings.

### ¿Por qué se usa la barra `|` y se lee como "o"?

¿Puedo mezclar cosas distintas, como `string | number`? ¿Y luego cómo sé cuál es?

**Respuesta:**
`A | B` es una **unión**: el valor es uno de los dos. `string | number` es perfectamente válido, y `|` es el mismo símbolo que usás para los literales, solo que ahí hay dos valores y acá dos tipos.

### ¿Qué pasa si los datos reales no encajan con mi tipo?

Me pasó justo aquí: `arrays.ts` usa `'tailwind'` y `'css'`, que no estaban en la
lista del enunciado. ¿Qué es lo correcto: cambiar el tipo o cambiar los datos?
¿Y en un proyecto real, donde los datos los manda otro equipo?

**Respuesta:**
La pregunta que decide es: **¿quién manda, el tipo o el dato?** Hay dos situaciones:

1. **El tipo es un contrato** (lo pide el negocio, el backend, la letra del ejercicio, una norma). Entonces el dato está mal y hay que corregir el dato. Acá la letra de este ejercicio define exactamente los valores de `Technology`: `'tailwind'` y `'css'` no están, así que técnicamente el dato viola el contrato.
2. **El tipo es tu descripción de la realidad.** Entonces el tipo está incompleto y se amplía (`'tailwind' | 'css'`), documentando por qué.

En un proyecto real donde los datos los manda otro equipo: **no cambiás el tipo por tu cuenta para que compile**. Hablás con ese equipo, y mientras tanto validás en la frontera (Zod) y traducís con una función que mapea lo que llega a lo que tu dominio acepta.

### El `?` de `salary?: number` — ¿qué significa exactamente?

¿Es lo mismo que `salary: number | undefined`? Porque he visto que no del todo,
pero no sé en qué se diferencian.

**Respuesta:**
- `salary?: number` -> la propiedad **puede faltar**. No acepta `salary: undefined` explícito.
- `salary: number | undefined` -> la propiedad es **obligatoria**, pero su valor puede ser `undefined`.

### ¿Qué es `import type` y por qué no un `import` normal?

Si funciona igual, ¿para qué la palabra extra?

**Respuesta:**
`import type` trae el símbolo **solo para tipos**. Al compilar la línea desaparece por completo: no queda ningún `import` en el JavaScript.

Ventajas:

- Deja escrito que no hay código detrás (el archivo importado no se ejecuta por esto).
- Evita **ciclos de importación** en runtime. Con `import` normal, dos módulos que se importan mutuamente para usar solo tipos pueden romper por `undefined` al inicializar.

## Tercer y cuarto ejercicio | Arrays y funciones

### Si TypeScript ya adivina el tipo del array, ¿por qué lo escribo igualmente?

`export const jobs: Job[] = [...]` ¿No es redundante? El comentario dice que sin eso adivinaría `string` en vez del literal `'mid'`. ¿Por qué adivina "peor"?

**Respuesta:**
No adivina "peor": adivina asumiendo el margen. La inferencia de literales de objeto **ensancha** los textos a `string`, porque un objeto puede cambiar después. Entonces
`{ experienceLevel: 'mid' }` se infiere `{ experienceLevel: string }`: el valor se pierde.

Al escribir `Job[]` cambiás la dirección de la comprobación: en vez de "¿qué tipo tiene este valor?", pasa a "¿este valor cumple `Job`?".

### ¿Qué significa `Technology[]`?

¿Los corchetes al final son "un array de"? ¿Y `string[][]` sería un array de arrays?

**Respuesta:**
Sí, `T[]` se lee "array de T" y es lo mismo que `Array<T>`.
`string[][]` es un array de arrays de strings (una matriz), y `Technology[]` no admite un `string` cualquiera adentro.

### ¿Hace falta escribir el tipo de retorno si TypeScript ya lo sabe?

En el código se escribe `: Job[]` al final de las funciones aunque no sea obligatorio.
¿Merece la pena el texto extra?

**Respuesta:**
No es obligatorio, y en una función local de dos líneas no lo escribiría. Lo escribo acá por dos motivos:

1. **El error aparece en el lugar correcto.** Si la función promete `Job[]` y adentro devolvés `(Job | undefined)[]`, el error salta en el `return` de esa función, no diez archivos más allá donde alguien la usa.
2. **Documenta el contrato.** Quien lee la firma sabe qué recibe sin abrir el cuerpo.

### En `filterByTechnology`, ¿por qué `toLowerCase()` da problemas?

El comentario dice que devuelve un `string` genérico y no un `Technology`.
Me parece muy sutil. ¿TypeScript no sabe que pasar a minúsculas `'React'` da `'react'`?

**Respuesta:**
No lo sabe, porque la librería estándar declara `toLowerCase(): string`. TypeScript no ejecuta la función ni analiza el valor del string: solo lee el tipo de retorno declarado.

## Quinto ejercicio | Opcionales y valores por defecto

### ¿Qué diferencia hay entre `days?: number` y `days: number = 30`?

Los dos hacen que el parámetro sea opcional al llamar a la función. ¿En qué cambia dentro de la función?

**Respuesta:**
- `days?: number` -> dentro de la función `days` es `number | undefined`. Tenés que comprobarlo antes de usarlo.
- `days: number = 30` → dentro de la función `days` es **siempre** `number`, porque si no llega el argumento (o llega `undefined`), se aplica el default.

### ¿Por qué dentro de un `if (options.text)` ya puedo usar `options.text` sin quejas?

¿TypeScript "recuerda" que lo he comprobado? ¿Hasta dónde llega esa memoria?
¿Y si lo compruebo en una función aparte, sigue funcionando?

**Respuesta:**
Se llama **control flow analysis**: TypeScript simula el recorrido del programa y en cada punto sabe qué tipo tiene cada variable. "Recuerda" mientras puede seguir el flujo.

Hasta dónde llega:

- Sí llega cuando hay: `if/else`, ternarios, `switch`, `typeof`, `in`, `instanceof`, `Array.isArray`, comprobaciones de `null`/`undefined`, asignaciones y los `return`/`throw` tempranos.
- No llega cuando: si la comprobación está en **otra función**. TypeScript no la ejecuta ni la analiza para deducir nada.
- Se pierde también si la variable es `let` y se vuelve a asignar algo más amplio después.

## Sexto ejercicio | Interfaces

### ¿Qué significa exactamente que una interface sea "un contrato"?

Entiendo la metáfora, pero ¿quién obliga a cumplirlo y cuándo?

**Respuesta:**
El que obliga es **el compilador, en dos momentos**:

1. **Al asignar**: cuando escribís `const x: JobSearchService = {...}`, TS compara la forma del objeto con la interface. Si falta una función o una firma no coincide, error en esa línea.
2. **Al usar**: si el contrato no declara un método, no podés llamarlo.

### ¿Por qué `searchService: JobSearchService` hace que se compruebe todo?

Si no pusiera el tipo, ¿el objeto seguiría siendo válido? ¿Qué gano con esa línea?

**Respuesta:**
Sin la anotación, el objeto es válido por sí mismo: TS infiere su forma y no lo compara con nada. `const searchService = { searchJobs, ... }` compila siempre, y si te olvidás una de las cuatro funciones, nadie avisa hasta que alguien llama a la que falta.

Con la anotación ganás tres cosas:

1. **Verificación completa del contrato** en el momento de crear el objeto (falta una función -> error; una firma no coincide -> error).
2. **Un solo lugar de verdad**: si mañana cambiás `filterByExperience` en `functions.ts`, el error aparece acá, donde está el contrato que se rompió.
3. **El consumidor ve el contrato**: quien usa `searchService` ve las cuatro funciones y sus tipos, sin abrir la implementación.

Es el mismo patrón que `const jobs: Job[]`: anotar en el borde para que el chequeo vaya en la dirección que te sirve.

### ¿Puede una `interface` extender un `type`?

En el código, `DetailedJob extends Job` y `Job` es un `type`. Pensaba que `extends`
era solo entre interfaces.

**Respuesta:**
Sí, puede: `extends` acepta cualquier tipo que sea una **forma de objeto estática**, venga de `interface` o de `type`. `Job` cumple eso, así que `DetailedJob extends Job` hereda sus propiedades y agrega las tres nuevas.

### ¿Qué pasa si el objeto tiene MÁS propiedades de las que pide la interface?

¿Da error o se permite? Creo que depende de si es un literal o una variable, y eso
me confunde bastante.

**Respuesta:**
```ts
const a: Job = { ...todo, extra: 1 } // error: 'extra' no existe en Job

const objeto = { ...todo, extra: 1 }
const b: Job = objeto // OK: el objeto tiene todo lo de Job y algo más
```

El primer caso es un **literal directo**: TS lo chequea de más justamente para atraparte los typos (`titel` en vez de `title`). El segundo pasó por una variable, y ahí el chequeo es estructural: "tiene al menos lo pedido, las propiedades de más no rompen nada".

Consecuencias prácticas: el tipado **no** impide que un objeto traiga datos de más.

## Séptimo y octavo ejercicio | Narrowing y uniones

### ¿Por qué `'junlor'` daba error y en JavaScript normal no?

Esta ha sido la parte que más me ha convencido de TypeScript. En JS la comparación
simplemente era `false` para siempre y nadie avisaba. ¿Hay muchos bugs así en el
código que escribí en los ejercicios anteriores?

**Respuesta:**
En JS, `job.experienceLevel === 'junlor'` compara dos strings: son distintos, la expresión es `false`, el `if` no entra, la función devuelve un resultado equivocado y **no hay ningún error**. Es el peor tipo de bug: silencioso.

En TypeScript el literal `'junlor'` se compara contra la unión
`'junior' | 'mid' | 'senior' | 'lead'`. Como no pertenece, el compilador sabe que esa comparación **nunca** puede ser verdadera y te lo marca al escribir.

Hay bugs así en los ejercicios anteriores sí, y son de la misma familia: nombres de propiedad mal escritos (como `result.succes`), valores de configuración inválidos, ramas que nunca se ejecutan. En JS solo los encontrás con un test que mire el **resultado final**;
en TS te los encontrás en el editor. No es que TS sea más inteligente: tiene más información (los tipos) para comparar.

### ¿Qué es exactamente el "narrowing"?

¿Es solo poner ifs? ¿O TypeScript hace algo especial al leerlos?

**Respuesta:**
El `if` es la **señal**; el trabajo lo hace el análisis de flujo del compilador. Narrowing es reducir el conjunto de tipos posibles de un valor a partir de una comprobación.

### ¿Qué es una "unión discriminada"?

Es la parte que más me ha costado. ¿Por qué hace falta una propiedad como `success`
para poder distinguir los dos casos? ¿No podría mirar si existe `error` y ya?

**Respuesta:**
Una unión discriminada es una unión de objetos que comparten una **propiedad discriminante** con valores literales distintos. Esa propiedad es la etiqueta que dice qué variante es:

```ts
type SearchResult =
  | { success: true; jobs: Job[]; count: number }
  | { success: false; error: string }
```

¿Por qué no basta con mirar si existe `error`? Se puede con `in`
(`if ('error' in result)`), pero tiene tres problemas:

1. **El tipo permitiría estados incoherentes**: con `in`, nada impide crear `{ success: true, error: 'x' }` si el tipo no prohíbe la combinación. El discriminante hace que ese objeto sea imposible de representar.
2. **Peor narrowing**: con el discriminante, el `else` ya sabe que es la otra variante y podés usar sus campos sin comprobar nada más.
3. **Semántica**: `success` dice **qué pasó**; `'error' in result` dice **qué campo hay**. Cuando mañana agregues `{ success: false; error: string; retryable: boolean }`, el discriminante sigue sirviendo.

### ¿Por qué `result.succes` (sin la segunda "s") daba error?

En JavaScript eso habría sido `undefined` y el `if` habría fallado siempre en
silencio. ¿TypeScript comprueba también los nombres de las propiedades que leo?

**Respuesta:**
Sí: en un tipo conocido, leer una propiedad que no existe es un error de compilación (TS2339, *Property 'succes' does not exist on type 'SearchResult'*). TypeScript es tan estricto con los nombres de las propiedades como con los tipos de los valores.

En JS, `result.succes` es `undefined`, `undefined` es falsy, y la función entraba **siempre**
por el `else` imprimía "Error: undefined" incluso cuando la búsqueda había ido bien.

### Dentro del `if (result.success)`, ¿cómo sabe que existe `result.jobs`?

Esto me parece casi magia. ¿TypeScript está "razonando" sobre mi código?

**Respuesta:**
`result` tiene tipo `A | B`, y `A` solo puede tener `success: true`. Al entrar en `if (result.success)`, el compilador descarta todas las
variantes donde `success` no puede ser `true`: queda `A`, que tiene `jobs` y `count`.

En el `else` pasa lo simétrico: queda `B`, con `error`. Si intentás usar `result.error`
dentro del `if`, te marca error, porque `error` no existe en `A`.

## Noveno ejercicio | Tuplas

### ¿Qué diferencia hay entre una tupla y un array normal?

`[number, number]` vs `number[]`. ¿La única diferencia es la cantidad fija?

**Respuesta:**
Excacto, esas son las diferencias.

### ¿Cómo sé qué significa cada posición de una tupla?

En `[min, max]` no hay nombres. ¿No sería mejor un objeto `{ min, max }`?
¿Cuándo conviene cada uno?

**Respuesta:**
Cuándo cada uno:

- **Tupla**: elementos convencionales y de orden obvio. `[latitud, longitud]`, `useState` (`[valor, setValor]`), `[valor, error]` de un fetch.
- **Objeto**: datos que persisten, que cruzan una API o que otra persona va a leer dentro de seis meses. `{ min, max }` en una respuesta HTTP siempre es mejor.

### ¿Qué es un "type predicate"? Lo de `salary is number`

Esta línea me parece de otro nivel:

```js
.filter((salary): salary is number => salary !== undefined)
```

¿Le estoy "prometiendo" algo a TypeScript? ¿Y si le miento?

**Respuesta:**
Sí, le estás prometiendo algo: "si esta función devuelve `true`, podés dar por seguro que el
valor es un `number`". TypeScript te cree y usa esa información para estrechar el tipo del array de `(number | undefined)[]` a `number[]`.

Y si le mentís el compilador te cree igual y el error aparece en runtime, así que tarde o temprano lo sabrás.

### ¿Por qué `as number` es peor que el type predicate?

Los dos hacen que deje de quejarse. ¿El `as` es hacer trampa?

**Respuesta:**
La diferencia es que **el predicado comprueba y el `as` afirma sin comprobar**:

- `salary as number` sobre `undefined` compila, y en runtime tenés `undefined`. El compilador deja de chequear y vos quedás con un valor que no es lo que el tipo dice.
- `.filter((salary): salary is number => salary !== undefined)` recorre y comprueba en runtime; de paso, el compilador se entera del resultado.

## Décimo ejercicio | Utility Types

### ¿Qué son `Partial`, `Pick` y `Readonly`? ¿De dónde salen?

No los he importado de ningún sitio y funcionan. ¿Vienen con TypeScript?
¿Hay muchos más?

**Respuesta:**
Vienen con TypeScript (están en su librería de tipos, no en `node_modules` ni en tu código), así que no hay nada que importar y **no generan código**: en runtime no existen.

Te dejo una tabla que encontré de los más usados (coincido con los tipos que aparecen con alguna excepción: ReturnType y Parameters se utilizan pero no son muy comunes):

| Tipo | Qué hace |
| --- | --- |
| `Partial<T>` | todas las propiedades opcionales |
| `Required<T>` | todas obligatorias |
| `Readonly<T>` | todas de solo lectura (superficial) |
| `Pick<T, K>` | solo las claves `K` |
| `Omit<T, K>` | todas menos `K` |
| `Record<K, V>` | objeto con claves `K` y valores `V` |
| `Exclude<T, U>` / `Extract<T, U>` | filtra una unión |
| `NonNullable<T>` | quita `null` y `undefined` |
| `ReturnType<F>` / `Parameters<F>` | el retorno / los parámetros de una función |
| `Awaited<T>` | el valor que sale de una promesa |

### ¿Cómo se lee `Pick<Job, 'id' | 'title'>`?

Los picos `<>` me recuerdan a los genéricos, pero no sé qué estoy pasando ahí dentro.
¿Es como una función que recibe tipos en vez de valores?

**Respuesta:**
Exacto: es una función que recibe **tipos** en vez de valores (genéricos). `Pick` recibe dos parámetros de tipo: el tipo base y las claves que querés. Internamente hace algo así:

### Si `Readonly<Job>` no existe al ejecutar, ¿de verdad protege algo?

Porque si el error solo aparece en el editor, alguien podría modificarlo desde
JavaScript normal y nadie se enteraría, ¿no?

**Respuesta:**
No protege en runtime: es solo un tipo, y en JavaScript se puede mutar igual.

```ts
const job: ReadonlyJob = jobs[0]
job.technologies.push('go') // ✅ compila y MUTA el array compartido
console.log(jobs[0].technologies) // ['react', 'typescript', 'tailwind', 'go']
```

El `Readonly` bloquea `job.title = ...` pero no lo que hay **dentro** de `technologies`. Si querés profundidad:

```ts
type ReadonlyJob = Readonly<Job> & { readonly technologies: readonly Technology[] }
```

TypeScript no es invatible a errores, es una ayuda muy buena para que programes. 

### En `displayJob`, ¿por qué se borra la línea en vez de quitar el `Readonly`?

Entiendo que "el error estaba en el código", pero ¿cómo decido eso? A veces el tipo
está mal y a veces el código. ¿Cómo distingo los dos casos?

**Respuesta:**
Conocer el producto: Es lo mismo que sucede cuando una función de JavaScript promete algo y retorna otra cosa. La responsabilidad de que lo programado cumpla con su objetivo no deja de ser nuestra. Los types de TS solo nos ayudan.

## Sobre la configuración

### ¿Qué hace `"strict": true` y por qué todos dicen que hay que activarlo?

¿Qué pasaría si lo desactivo? ¿Dejarían de salir la mitad de mis errores?

**Respuesta:**
`strict` activa un grupo de comprobaciones. Las que más se notan:

- `strictNullChecks`: `null` y `undefined` son tipos propios y no se pueden usar donde se espera un `number`. Es el 80% del valor de TypeScript.
- `noImplicitAny`: una variable sin tipo inferible es un error en vez de `any` silencioso.
- `strictFunctionTypes`, `strictPropertyInitialization`, `useUnknownInCatchVariables`, `strictBindCallApply`, `alwaysStrict`.

Si lo desactivás, dejás de ver la mitad de los errores (`salary.toLocaleString()` sin comprobar `undefined` compila y explota en runtime) y TypeScript se vuelve decorativo.

### ¿Qué es `any` y por qué está mal visto?

El código de partida estaba lleno de `any`. Si pongo `any` en todo, ¿TypeScript deja
de servir para algo?

**Respuesta:**
Usar `any` es bueno para hacer migraciones graduales de JS a TS, interoperabilidad con librerías sin tipos y prototipos descartables.

La realidad es: si desactivamos los tipos en TypeScript, perdemos el 80% de la funcionalidad de TS. Por eso es recomendable evitarlo.
