<!-- Aquí puedes poner tus dudas sobre el ejercicio -->

# Mis dudas del ejercicio de TypeScript

## Sobre TypeScript en general

### Si al final se convierte en JavaScript, ¿qué gano?

Escribo el doble de código y el resultado es el mismo. Entiendo que "avisa de
errores", pero justo los errores que me avisa son los que yo no habría cometido...
¿o eso es lo que creo?

### ¿Los tipos existen cuando el programa se está ejecutando?

Esto no lo tengo nada claro. Si le digo que `salary` es `number`, ¿alguien comprueba
eso mientras el programa corre? ¿O desaparece todo al compilar?

### Si los tipos desaparecen, ¿qué pasa con los datos que vienen de una API?

Puedo decir que la respuesta es de tipo `Job`, pero el servidor podría mandarme
cualquier cosa. ¿TypeScript me protege ahí o me está dando una falsa seguridad?
(¿Es por eso que existe Zod?)

### ¿Por qué `node index.ts` funciona sin compilar nada?

Pensaba que había que ejecutar `tsc` primero. ¿Node entiende TypeScript ahora?
¿Y entonces para qué sirve `tsc --noEmit`?

### ¿Qué diferencia hay entre `type` e `interface`?

En el ejercicio uso los dos y no sé si hay una razón o es por variar.
¿Cuándo tengo que usar uno y cuándo el otro?

### ¿Qué significa "inferir" un tipo?

Si escribo `const x = 5`, ¿TypeScript ya sabe que es un número? Entonces,
¿cuándo tengo que escribir los tipos a mano y cuándo puedo dejar que los adivine?

## Primer y segundo ejercicio | Literales y objetos

### ¿Qué es un "tipo literal"? ¿Un texto puede ser un tipo?

Me cuesta entender que `'junior'` sea un tipo y no un valor. ¿Es como un enum?

### ¿Por qué se usa la barra `|` y se lee como "o"?

¿Puedo mezclar cosas distintas, como `string | number`? ¿Y luego cómo sé cuál es?

### ¿Qué pasa si los datos reales no encajan con mi tipo?

Me pasó justo aquí: `arrays.ts` usa `'tailwind'` y `'css'`, que no estaban en la
lista del enunciado. ¿Qué es lo correcto: cambiar el tipo o cambiar los datos?
¿Y en un proyecto real, donde los datos los manda otro equipo?

### El `?` de `salary?: number` — ¿qué significa exactamente?

¿Es lo mismo que `salary: number | undefined`? Porque he visto que no del todo,
pero no sé en qué se diferencian.

### ¿Qué es `import type` y por qué no un `import` normal?

Si funciona igual, ¿para qué la palabra extra?

## Tercer y cuarto ejercicio | Arrays y funciones

### Si TypeScript ya adivina el tipo del array, ¿por qué lo escribo igualmente?

`export const jobs: Job[] = [...]` ¿No es redundante? El comentario dice que sin
eso adivinaría `string` en vez del literal `'mid'`. ¿Por qué adivina "peor"?

### ¿Qué significa `Technology[]`?

¿Los corchetes al final son "un array de"? ¿Y `string[][]` sería un array de arrays?

### ¿Hace falta escribir el tipo de retorno si TypeScript ya lo sabe?

En el código se escribe `: Job[]` al final de las funciones aunque no sea obligatorio.
¿Merece la pena el texto extra?

### En `filterByTechnology`, ¿por qué `toLowerCase()` da problemas?

El comentario dice que devuelve un `string` genérico y no un `Technology`.
Me parece muy sutil. ¿TypeScript no sabe que pasar a minúsculas `'React'` da `'react'`?

## Quinto ejercicio | Opcionales y valores por defecto

### ¿Qué diferencia hay entre `days?: number` y `days: number = 30`?

Los dos hacen que el parámetro sea opcional al llamar a la función. ¿En qué cambia
dentro de la función?

### ¿Por qué dentro de un `if (options.text)` ya puedo usar `options.text` sin quejas?

¿TypeScript "recuerda" que lo he comprobado? ¿Hasta dónde llega esa memoria?
¿Y si lo compruebo en una función aparte, sigue funcionando?

## Sexto ejercicio | Interfaces

### ¿Qué significa exactamente que una interface sea "un contrato"?

Entiendo la metáfora, pero ¿quién obliga a cumplirlo y cuándo?

### ¿Por qué `searchService: JobSearchService` hace que se compruebe todo?

Si no pusiera el tipo, ¿el objeto seguiría siendo válido? ¿Qué gano con esa línea?

### ¿Puede una `interface` extender un `type`?

En el código, `DetailedJob extends Job` y `Job` es un `type`. Pensaba que `extends`
era solo entre interfaces.

### ¿Qué pasa si el objeto tiene MÁS propiedades de las que pide la interface?

¿Da error o se permite? Creo que depende de si es un literal o una variable, y eso
me confunde bastante.

## Séptimo y octavo ejercicio | Narrowing y uniones

### ¿Por qué `'junlor'` daba error y en JavaScript normal no?

Esta ha sido la parte que más me ha convencido de TypeScript. En JS la comparación
simplemente era `false` para siempre y nadie avisaba. ¿Hay muchos bugs así en el
código que escribí en los ejercicios anteriores?

### ¿Qué es exactamente el "narrowing"?

¿Es solo poner ifs? ¿O TypeScript hace algo especial al leerlos?

### ¿Qué es una "unión discriminada"?

Es la parte que más me ha costado. ¿Por qué hace falta una propiedad como `success`
para poder distinguir los dos casos? ¿No podría mirar si existe `error` y ya?

### ¿Por qué `result.succes` (sin la segunda "s") daba error?

En JavaScript eso habría sido `undefined` y el `if` habría fallado siempre en
silencio. ¿TypeScript comprueba también los nombres de las propiedades que leo?

### Dentro del `if (result.success)`, ¿cómo sabe que existe `result.jobs`?

Esto me parece casi magia. ¿TypeScript está "razonando" sobre mi código?

## Noveno ejercicio | Tuplas

### ¿Qué diferencia hay entre una tupla y un array normal?

`[number, number]` vs `number[]`. ¿La única diferencia es la cantidad fija?

### ¿Cómo sé qué significa cada posición de una tupla?

En `[min, max]` no hay nombres. ¿No sería mejor un objeto `{ min, max }`?
¿Cuándo conviene cada uno?

### ¿Qué es un "type predicate"? Lo de `salary is number`

Esta línea me parece de otro nivel:

```js
.filter((salary): salary is number => salary !== undefined)
```

¿Le estoy "prometiendo" algo a TypeScript? ¿Y si le miento?

### ¿Por qué `as number` es peor que el type predicate?

Los dos hacen que deje de quejarse. ¿El `as` es hacer trampa?

## Décimo ejercicio | Utility Types

### ¿Qué son `Partial`, `Pick` y `Readonly`? ¿De dónde salen?

No los he importado de ningún sitio y funcionan. ¿Vienen con TypeScript?
¿Hay muchos más?

### ¿Cómo se lee `Pick<Job, 'id' | 'title'>`?

Los picos `<>` me recuerdan a los genéricos, pero no sé qué estoy pasando ahí dentro.
¿Es como una función que recibe tipos en vez de valores?

### Si `Readonly<Job>` no existe al ejecutar, ¿de verdad protege algo?

Porque si el error solo aparece en el editor, alguien podría modificarlo desde
JavaScript normal y nadie se enteraría, ¿no?

### En `displayJob`, ¿por qué se borra la línea en vez de quitar el `Readonly`?

Entiendo que "el error estaba en el código", pero ¿cómo decido eso? A veces el tipo
está mal y a veces el código. ¿Cómo distingo los dos casos?

## Sobre la configuración

### ¿Qué hace `"strict": true` y por qué todos dicen que hay que activarlo?

¿Qué pasaría si lo desactivo? ¿Dejarían de salir la mitad de mis errores?

### ¿Qué es `any` y por qué está mal visto?

El código de partida estaba lleno de `any`. Si pongo `any` en todo, ¿TypeScript deja
de servir para algo?
