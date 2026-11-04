<!-- Aquí puedes poner tus dudas sobre el ejercicio -->

# Mis dudas del ejercicio de SQL

## Sobre bases de datos en general

### ¿Por qué una base de datos y no un archivo JSON?

Hasta ahora todo funcionaba con `jobs.json`. Entiendo que ahora los datos "persisten",
pero también podría escribir en el JSON con `fs.writeFile`. ¿Qué hace una base de
datos que un archivo no?

**Respuesta.** Un `fs.writeFile` sobre un JSON no es una base de datos, es un archivo
sobrescrito entero. Y ahí aparecen cuatro problemas que en un servidor web se notan el primer día:

1. **Atomicidad.** `writeFile` puede quedarse a medias (proceso matado, disco lleno, reinicio) y te deja un JSON truncado: pierdes TODOS los datos, no una fila.
2. **Concurrencia.** Dos peticiones POST simultáneas leen el mismo JSON, cada una añade su job y la segunda pisa a la primera. El JSON no tiene bloqueos; SQLite tiene un lock de escritor y transacciones.
3. **Consultas.** Filtrar por `tech=react&modality=remote` con JSON es recorrer los 10 (o 100 000) objetos en memoria en cada petición. La base de datos usa índices y lee solo las filas que cumplen.
4. **Integridad.** El JSON acepta `modality: "teletrabajo"` sin protestar. El `CHECK`, la `FOREIGN KEY` y el `NOT NULL` los aplica la base de datos.

Y para producción, si algo sale mal, un `jobs.db` tiene backup consistente; un
`writeFile` no.

### ¿SQLite es una base de datos "de verdad"?

Como es solo un archivo, me da la sensación de que es "la de juguete".
¿Se usa en producción? ¿Cuándo tendría que pasarme a PostgreSQL o MySQL?

**Respuesta.** Es probablemente el motor SQL más desplegado del
planeta: lo llevan dentro Android, iOS, Chrome, Firefox, macOS, Windows, y lo usan empresas muy importantes. Nosotros en nuestros productos también la usamos. "Un solo archivo" no significa "de juguete": significa que no hay proceso servidor ni red de por medio, y eso es una ventaja enorme para aplicaciones de un servidor. De hecho es algo positivo que lo destaca de otros motores.

Se te queda corto cuando necesitas algo que el archivo no puede dar:

- **Varios servidores** escribiendo la misma base de datos (SQLite es local al proceso/máquina, no se comparte por red de forma segura).
- **Muchos escritores concurrentes**
- **Usuarios y permisos** de base de datos, replicación, failover, backups incrementales gestionados.
- **Datos enormes o analítica pesada**, o tipos avanzados (Postgres: arrays, JSONB, full-text, PostGIS...).

Para el 90 % de las apps SQLite sobra. Te di términos nuevos para que puedas expandir conocimiento en cada uno de ellos, pero en resumen: SQLite es una BBDD muy estandarizada y utilizada.

### ¿Por qué el archivo `jobs.db` no se puede abrir con un editor de texto?

Lo he intentado y sale todo símbolos raros. ¿Cómo miro lo que hay dentro?

**Respuesta.** Porque no es texto: es un formato binario. Un editor de
texto te enseña esos bytes como si fueran letras, y de ahí los símbolos.

Para mirar dentro tienes herramientas:

```bash
sqlite3 jobs.db                    # CLI oficial (viene con macOS)
sqlite3 jobs.db ".tables"
sqlite3 jobs.db "SELECT id, title, modality FROM jobs LIMIT 5;"
sqlite3 jobs.db ".schema job_technologies"
```

O una GUI: DB Browser for SQLite (gratis), TablePlus, o la extensión
"SQLite Viewer" de VS Code.

### ¿Hay que subir el `jobs.db` a git?

Lo hemos puesto en el `.gitignore`. Pero entonces, si otra persona clona el repo,
¿tiene que ejecutar el seed? ¿Y qué pasa con los datos de producción?

**Respuesta.** No se sube. Un `.db` es un binario, cambia entero en cada escritura y git no puede fusionarlo: dos personas que ejecutan el seed generan dos binarios distintos y un conflicto imposible de resolver a mano.

Los datos de producción no están en git ni en tu máquina: viven en el servidor de base de datos, con backup y restauración. En este ejercicio usamos datos locales, pero que en entornos reales el servidor siempre va a estar fuera de la maquina local.

## Tarea 1 | La conexión

### ¿Por qué `better-sqlite3` es SÍNCRONO si todo lo demás en Node es asíncrono?

Me han repetido mil veces que en Node hay que usar `await` para no bloquear.
Y aquí, de repente, no hace falta. ¿No estoy bloqueando el servidor en cada consulta?

**Respuesta.** Sí lo bloqueas, pero el bloqueo dura microsegundos o milisegundos: la consulta no sale del proceso, no espera a la red, solo lee o escribe un archivo local con el sistema operativo. El `await` existe para no tener la CPU parada mientras esperas algo que tarda (red, disco remoto, otra API): aquí no hay esperas largas.

### Si es síncrono, ¿por qué los métodos del modelo siguen siendo `async`?

Me parece contradictorio. ¿Es solo para no tener que cambiar los controladores?

**Respuesta.** No es para "no cambiar los controladores": es porque el `async` es parte del **contrato** del modelo, y el contrato no depende del motor. Hoy el modelo lee un archivo local; mañana el mismo `JobModel.getAll()` puede hablar con Postgres (que devuelve promesas) o con una API remota, y el controlador sigue escrito igual:

```ts
const jobs = await JobModel.getAll({ tech, modality, level })
```

Si el modelo devolviera valores síncronos hoy y promesas mañana, tendrías que cambiar controladores, rutas y tests.

### ¿Qué es un PRAGMA?

No es SQL normal, ¿verdad? Parece más bien configuración. ¿Hay muchos?

**Respuesta.** Correcto: los `PRAGMA` son sentencias propias de SQLite (no están en el estándar SQL) para consultar o cambiar el comportamiento del motor.


### ¿Por qué SQLite ignora las claves foráneas por defecto?

Esto me parece increíble. Si es una función importante, ¿por qué viene apagada?
¿Cuánta gente tendrá bugs por no saberlo?

**Respuesta.** Por **compatibilidad histórica**. SQLite nació en 2000 y las claves foráneas llegaron en la versión 3.6.19 (2009). Si las hubieran activado por defecto, cualquier base de datos creada antes empezaría a fallar al insertar o borrar, y rompería miles de aplicaciones en producción. Optaron por el mal menor: apagadas
salvo que las pidas.

### ¿Qué es el modo WAL y de verdad lo necesito?

En mi ordenador, con un solo usuario, ¿nota alguna diferencia?

**Respuesta.** En el modo por defecto, un escritor bloquea a los lectores: mientras se escribe, cualquier `SELECT` espera. Con WAL, los cambios nuevos se anotan en un archivo aparte (`jobs.db-wal`) y
los lectores siguen viendo la última versión consolidada sin esperar al escritor.

Siendo solo tu no notas nada. Pero el ejercicio lo hicimos pensado para que conozcas el término y puedas saber como hacerlo cuando trabajes en producción con usuarios reales.

### ¿Por qué hay que construir la ruta con `import.meta.dirname` en vez de poner `'jobs.db'`?

El comentario dice que si no, se crearía la base de datos en la carpeta desde la que
ejecuto el comando. ¿Eso significa que podría tener varias bases de datos vacías
repartidas por ahí sin enterarme?

**Respuesta.** Sí, exactamente eso. Las rutas relativas en Node se resuelven contra `process.cwd()`, **no** contra el archivo que
las contiene.

Y como SQLite crea el archivo si no existe, no hay error: la API arranca, la base de datos está "vacía", `GET /jobs` devuelve `[]` y pensas que el seed funcionó.

`import.meta.dirname` da la carpeta del módulo actual, así que
`join(import.meta.dirname, '..', 'jobs.db')` apunta siempre a la raíz del proyecto, se lance desde donde se lance.

## Tarea 2 | El esquema y el seed

### ¿Por qué hacen falta TRES tablas para una cosa que en JSON era un solo objeto?

Esta es mi duda más grande del ejercicio. El JSON era claro y ahora tengo los datos
desperdigados. ¿De verdad esto es mejor?

**Respuesta.**
A nivel estético es mejor tener un JSON, pero cuando tenemos miles de datos, iterar un JSON es mucho más pesado y costoso. El tener datos separados por columnas relacionadas entre ellas hace que las búsquedas sean mucho más rápidas y óptimas.

### ¿Por qué no puedo guardar un array en una columna?

`technologies: ['react', 'node']` cabía perfectamente en el JSON.
¿Por qué SQL no tiene arrays? ¿No podría guardarlo como texto separado por comas?

**Respuesta.** El estándar SQL no define arrays (Postgres y algún otro sí los añaden; SQLite no). Guardar `'react,node'` en una columna es lo que se llama un **grupo repetido** pero tiene problemas concretos:

```sql
-- "¿jobs con node?" con LIKE: falso positivo con 'node-red'
WHERE technologies LIKE '%node%'
```

- No puedes garantizar unicidad ni integridad: nada impide `'react,react,,react'`.
- Cada consulta tiene que parsear el texto en la aplicación.

### ¿Qué es una relación "uno a muchos"?

Entiendo el ejemplo (un job tiene muchas tecnologías), pero no sé identificar cuándo
me hace falta una tabla nueva y cuándo basta con una columna más.

**Respuesta.**
Es cuando una fila de la tabla A se relaciona con varias filas de B, y cada una de esas filas de B existe por sí sola.

Ayudan estas tres preguntas:

1. ¿El valor puede repetirse N veces por fila? -> si es un único valor, columna.
2. ¿Ese valor se filtra, ordena o valida por separado, o lo comparten varias filas? -> si sí, tabla propia.
3. ¿Cada elemento tiene sus propios campos? (una tecnología con `id`, `nombre`, `categoría`) -> tabla propia con su PK, y la intermedia guarda `job_id` + `technology_id`.

### ¿Qué es exactamente una PRIMARY KEY y qué gano con ella?

¿Es solo "el campo que identifica la fila"? ¿Qué pasa si no pongo ninguna?

**Respuesta.** La PK es la identidad de la fila, y viene con tres cosas: **única**, **NOT NULL** e **indexada**.

Si no la pones SQLite crea un `rowid` interno (un entero oculto), pero es un detalle de implementación que no puedes referenciar desde otra tabla ni usar en la API. Y nada impide insertar dos filas idénticas, así que un `UPDATE ... WHERE id = ?`
puede tocar varias filas y un `DELETE` puede llevarse más de lo que querías.

### ¿Qué es una FOREIGN KEY y qué pasa si pongo un `job_id` que no existe?

¿Da error al insertar? ¿O solo si tengo activado el PRAGMA de antes?

**Respuesta.** La FK declara "este valor tiene que existir en `jobs.id`". Es una regla que aplica el motor, y **solo si la conexión tiene `PRAGMA foreign_keys = ON`**:

```ts
// con PRAGMA ON
db.prepare('INSERT INTO job_technologies (job_id, technology) VALUES (?, ?)')
  .run('id-que-no-existe', 'react')
// → SqliteError: FOREIGN KEY constraint failed

// con PRAGMA OFF: se inserta sin quejarse y queda un huérfano
```

Y en el otro sentido, si borras un job que tiene tecnologías, con el PRAGMA activo y sin acción declarada SQLite lo **impide** (`FOREIGN KEY constraint failed`); con `ON DELETE CASCADE` borra los hijos; con `ON DELETE SET NULL` los deja con `NULL` (por eso la columna tendría que permitir nulos).

### ¿Qué hace `ON DELETE CASCADE`?

Me da un poco de miedo: si borro un job se borran otras cosas automáticamente.
¿Y si algún día borro algo sin querer y se lleva media base de datos por delante?

**Respuesta.** Borra solo las filas hijas que apuntan al id borrado. Si borras el job `abc`, desaparecen las tecnologías y el contenido con `job_id = 'abc'`; los demás jobs y sus hijos no se tocan.

La protección contra borrados accidentales no es quitar el CASCADE (te quedarían huérfanos o errores), sino:

- que el `DELETE` siempre lleve `WHERE id = ?` (aquí lo lleva)
- no exponer `DELETE` sin autenticación/autorización
- backups
- y en producción, `soft delete` (columna `deleted_at`) si se necesita recuperar.

### ¿Qué es un `CHECK` y en qué se parece a un tipo de TypeScript?

Los dos limitan los valores posibles. ¿Cuál es más fiable? ¿Debería tener los dos?

**Respuesta.** `CHECK (modality IN ('remote','onsite','hybrid'))` es una regla que aplica la **base de datos** en cada INSERT y UPDATE. Un tipo de TypeScript es una regla que aplica el **compilador** en tu código.

- Más fiable para integridad: el `CHECK` (protege a todos los clientes).
- Más útil para el desarrollo y los mensajes de error: zod en el middleware (tu API devuelve `Invalid enum value. Expected 'remote' | ...` con 400, cosa que un `CHECK` no puede hacer: solo lanza un `SqliteError`).

Ten los dos, en capas: `zod` valida la entrada HTTP y da errores legibles; el `CHECK` es la red de seguridad de los datos. Es el mismo patrón que ya tienes con `title` (zod exige 3 caracteres y `NOT NULL` lo exige a nivel de base de datos).

### ¿Qué es una transacción y por qué es "todo o nada"?

Entiendo la idea, pero ¿cómo lo hace SQLite por dentro? Si falla a la mitad,
¿cómo deshace lo que ya había escrito?

**Respuesta.** 
Antes de modificar una página del archivo, SQLite guarda su versión
anterior en un journal (o en el WAL). Si algo falla antes del `COMMIT`, las páginas originales se restauran desde ese registro y el archivo vuelve al estado inicial. Si el proceso muere a la mitad, la siguiente conexión ve un log incompleto y hace el rollback sola al abrir.

### ¿Por qué una transacción es más RÁPIDA y no más lenta?

Pensaba que añadir seguridad siempre costaba rendimiento. Aquí es al revés.

**Respuesta.** 
Porque sin transacción, cada sentencia es su propia transacción implícita, y eso significa un `COMMIT` por INSERT: escribir el journal, hacer `fsync` y esperar a que el disco confirme. El `fsync` es lo caro (milisegundos), no el INSERT.

Con una transacción explícita se hace un solo `COMMIT` para los jobs y filas: se escribe todo y se sincroniza una vez.

### ¿Qué es `prepare()` y por qué no ejecuto el SQL directamente?

¿Qué significa que la sentencia se "compila"? ¿Se guarda en algún sitio?

**Respuesta.** `db.prepare(sql)` le pide a SQLite que parsee el SQL y lo compile, y te devuelve un **statement** reutilizable:

```ts
const insertar = db.prepare('INSERT INTO job_technologies (job_id, technology) VALUES (?, ?)')
for (const t of tecnologias) insertar.run(jobId, t)   // compilado una vez, ejecutado N veces
```

Las ventajas son:

1. **Velocidad**: el parseo y el plan de ejecución se calculan una sola vez.
2. **Seguridad**: el texto del SQL es fijo y los `?` se enlazan como valores.
3. **Claridad**: separas "qué consulta" de "con qué datos".

Y por eso en el seed los `prepare` están fuera del bucle: preparar dentro del bucle es el error clásico que anula la ventaja.

### ¿Por qué hay que borrar antes de insertar para que el seed se pueda repetir?

¿No hay una forma de decir "inserta solo si no existe"? ¿Y qué es `INSERT OR REPLACE`?

**Respuesta.**
Porque la idempotencia necesita una **clave única con la que detectar
el duplicado**, y `job_technologies` no tiene ninguna declarada. Sin clave, un segundo `INSERT` no "choca": simplemente añade
otra fila, y acabarías con las tecnologías duplicadas.

En `jobs` sí hay PK, y ahí el seed usa `INSERT OR REPLACE`.

## Tarea 3 | Migrar el modelo

### ¿De verdad no hay que tocar los controladores ni las rutas?

Me ha sorprendido mucho. ¿Esto es lo que se consigue con el MVC?
¿Siempre sale tan limpio o aquí hemos tenido suerte?

**Respuesta.** 
Exacto, es de las ventajas más notorias de MVC, por eso hicimos el cambio en los ejercicio anteriores. Fue un costo por un beneficio aún mayor.

### ¿Qué es la inyección SQL? No acabo de imaginármela

Entiendo que hay que usar `?` en vez de pegar el valor en el texto, pero
¿qué haría un atacante exactamente? ¿Me pueden borrar la base de datos escribiendo
algo raro en un filtro?

**Respuesta.** 
Inyección SQL es conseguir que un dato que tú esperabas se interprete como código SQL tuyo. Con concatenación:

```ts
// ❌ MAL
const sql = `SELECT * FROM jobs WHERE level = '${filters.level}'`
```

Si el atacante llama a `/jobs?level=senior' OR '1'='1`, la consulta que se ejecuta es:

```sql
SELECT * FROM jobs WHERE level = 'senior' OR '1'='1'
```

y devuelve **todas** las filas saltándose el filtro. Lo mismo podría hacer para modificar datos o eliminar entradas.

### ¿Por qué los `?` son seguros y las plantillas con `${}` no?

Si al final el valor acaba en la consulta igualmente, ¿qué cambia?

**Respuesta.** 
Cambia cuándo se decide la estructura de la consulta. Es la diferencia entre compilar una vez con huecos y compilar con el valor dentro.

- Con `${}`: el SQL completo (texto + valor) se manda a SQLite, que lo parsea y decide qué sentencias ejecutar. Si el valor contiene comillas, `;`, `--`, ya no es un valor: es sintaxis.
- Con `?`: el SQL se parsea una sola vez con la estructura fija (`SELECT * FROM jobs WHERE level = ?`) y el valor se enlaza después como dato tipado (texto, número, blob). Aunque el valor sea `'; DROP TABLE jobs; --`, SQLite solo lo compara como texto.

Es la misma razón por la que un JSON con `"level": "senior' OR 1=1"` no rompe nada, lo lee como texto.

### El truco de `WHERE 1 = 1`, ¿no es un poco sucio?

Funciona, pero añadir una condición falsa que no hace nada me parece un apaño.
¿Se hace así en proyectos reales?

**Respuesta.** Se hace, y no es un apaño. `1 = 1` es una condición siempre verdadera, no cambia el resultado, y el optimizador de SQLite la elimina del plan: no cuesta nada.

El motivo es puramente de construcción dinámica: permite añadir siempre
`' AND campo = ?'` sin preguntar "¿soy el primero?". Sin el truco tienes que llevar la cuenta y elegir entre `WHERE` y `AND`, que es donde salen los bugs de SQL dinámico.

### ¿Qué diferencia hay entre `.get()`, `.all()` y `.run()`?

Uno devuelve una fila, otro todas y el tercero... ¿nada? ¿Cómo me acuerdo de cuál usar?

**Respuesta.** Los tres ejecutan la sentencia; cambia qué devuelven.

El último se usa para modificar/eliminar datos. El resto para obtener. Es como las peticiones HTTP.

### ¿Qué es una subconsulta y en qué se diferencia de un JOIN?

He usado `id IN (SELECT ...)` para filtrar por tecnología. El comentario dice que un
JOIN daría filas duplicadas. ¿Por qué? ¿Cuál es más rápido?

**Respuesta.** Una subconsulta es una consulta dentro de otra; `IN (...)` compara contra el conjunto que devuelve. Un `JOIN` combina filas de dos tablas en una sola lista, y ahí está la trampa:

```sql
-- JOIN: un job con 3 tecnologías aparece 3 VECES si no agrupas
SELECT j.* FROM jobs j
JOIN job_technologies t ON t.job_id = j.id
WHERE t.technology = 'react';
```

Para arreglarlo necesitas `DISTINCT` o `GROUP BY j.id`. La subconsulta evita el problema porque el `IN` es un booleano por fila: cada job sale una vez.

Rendimiento: con un índice en `job_technologies(technology)`, SQLite convierte el `IN (SELECT ...)` en una búsqueda por índice, como el JOIN. El JOIN gana cuando necesitas **columnas de las dos tablas** en el resultado; para solo filtrar, `IN` o `EXISTS` es igual de rápido y más legible:

```sql
-- EXISTS, la variante que además corta en cuanto encuentra una coincidencia
WHERE EXISTS (SELECT 1 FROM job_technologies t WHERE t.job_id = jobs.id AND t.technology = ?)
```

### El problema N+1: ¿estoy haciendo demasiadas consultas?

Por cada job hago dos consultas más (tecnologías y contenido). Con 10 jobs son 21
consultas. ¿Eso es un problema? ¿Cómo se arregla?

**Respuesta.**
Sí, es el patrón N+1 y con 10 jobs en local no se nota (cada consulta
son microsegundos), pero escala mal: 1 + 2N. Con 1 000 jobs son 2 001 consultas, y en un motor remoto cada una paga red y latencia (2 001 × 1 ms = 2 segundos por petición).

Se arregla leyendo en bloque, no por fila:

1. **Dos consultas por colección** en vez de una por job:

```ts
const ids = filas.map(f => f.id)
const tecnologias = db.prepare(
  `SELECT job_id, technology FROM job_technologies WHERE job_id IN (${ids.map(() => '?').join(',')})`
).all(...ids)
// y agrupas en JS con un Map<job_id, string[]>
```

2. **Una sola consulta con agregación** de SQLite:

```sql
SELECT j.*, json_group_array(t.technology) AS tecnologias
FROM jobs j LEFT JOIN job_technologies t ON t.job_id = j.id
GROUP BY j.id
```

### ¿Por qué después de crear un job lo vuelvo a leer de la base de datos?

Ya tengo los datos que acabo de insertar. ¿No es una consulta de más?

**Respuesta.**
Se hace así por el patrón REST: un `POST` devuelve el recurso creado tal cual quedó persistido. Si devolvemos lo que enviamos y no lo que realmente se guardó, no estamos teniendo consistencia. Siempre la fuente de la verdad tiene que ser el dato en la tabla y no la operación.

### ¿Por qué hay que hacer `as FilaJob[]` en las consultas?

TypeScript no sabe qué devuelve el SQL porque es texto, ¿verdad? Entonces,
¿estoy "prometiendo" que las columnas son las que digo? ¿Y si me equivoco de nombre?

**Respuesta.**
Exacto: el SQL es un string para TypeScript, así que el driver devuelve
`unknown[]`/`any[]` y el `as` es **una promesa tuya**, no una verificación.
Si escribes `fila.titulo` en vez de `fila.title`, compila igual y en runtime obtienes `undefined` (sin error, hasta que algo más reviente).

Es un precio a pagar. Lo bueno es que en la última versión de TS ya podemos inferir los types de consultas SQL y esto no es necesario hacerlo. Midu subió un video hace poco explicando esto en su canal de YouTube.

### En el `update`, ¿por qué se monta el SQL a trozos?

Es la función más complicada del ejercicio. ¿No hay una forma más sencilla de hacer
un PATCH en SQL?

**Respuesta.** El SQL no tiene "actualiza lo que te manden": el `SET` es estático. Como un PATCH puede traer 1 de 6 campos, se construye dinámicamente.

### ¿Por qué hay que comprobar `if (campos.length > 0)` antes del UPDATE?

Entiendo que un `UPDATE jobs SET WHERE id = ?` sin nada en medio es inválido.
Pero, ¿no debería avisar el usuario de que no ha mandado nada?

**Respuesta.** Son dos cosas distintas y las dos importan:

1. **Evitar el SQL inválido.** Sin la guarda, un PATCH con `{}` genera`UPDATE jobs SET  WHERE id = ?` → `SqliteError: near "WHERE": syntax error`. La guarda lo evita.
2. **Avisar al cliente.** Tienes razón en que un PATCH sin campos debería ser un error explícito (400/422 "no hay campos para actualizar"), no un 200 silencioso devolviendo el recurso intacto. Ahora mismo pasa esto segundo: el body `{}` pasa la validación (todo es opcional) y el modelo no hace nada.

Es una decisión de diseño y tiene todo el sentido que sea así.

### ¿Qué significa `resultado.changes`?

¿Es el número de filas que han cambiado? ¿Y si borro algo que ya estaba borrado,
da 0 o da error?

**Respuesta.** `changes` es el número de filas afectadas por el último
INSERT/UPDATE/DELETE de esa sentencia. Si borras un id que no existe, no es un error: `changes` vale `0`, y con eso tu `delete` devuelve `false` → el controlador responde 404. Si borras uno que existe, `1` → 204.

## Sobre el resultado

### Los datos están "planos" en SQL y "anidados" en la API, ¿por qué?

Tengo una función solo para recomponer el objeto. ¿No sería más fácil que la API
devolviera los datos tal y como están en la base de datos?

**Respuesta.**
Porque son dos modelos distintos con propósitos distintos:

- **Persistencia** (SQL): normalizada, sin arrays, pensada para consultar e integrar. Es un detalle interno: puedes cambiar el esquema mañana.
- **Dominio/API** (JSON): anidada, pensada para que la consuma un frontend. Es un contrato público: si lo cambias, rompes a tus clientes.

La traducción entre ambos es exactamente la responsabilidad del modelo. Devolver la forma de la base de datos significaría filtrar el esquema interno a la API: cada cambio de SQL sería un cambio de contrato, y el front acabaría haciendo joins a mano.

El coste es una función de ~20 líneas y un objeto por fila. El beneficio es que el front recibe exactamente lo que ya consumía del JSON y el `GET /jobs` no cambió de forma al migrar. Eso es MVC funcionando.

### ¿Qué es un DTO? (`CreateJobDTO`, `UpdateJobDTO`)

He visto las siglas en `types.ts` pero no sé qué significan ni por qué hacen falta
tipos distintos para crear y para actualizar.

**Respuesta.**
DTO = *Data Transfer Object*: un tipo que describe **lo que entra o
sale por la API**, separado de la entidad completa. No es la entidad de la base de datos ni el formulario: es el contrato del borde.

```ts
export type CreateJobDTO = Omit<Job, 'id'>      // al crear, el id lo pone el servidor
export type UpdateJobDTO = Partial<CreateJobDTO> // al actualizar, todo es opcional
```

Por qué hacerlos distintos:

- **Create**: si `id` fuera obligatorio, obligarías al cliente a inventar ids (y a poder colisionar con los del servidor). `Omit` lo expresa.
- **Update**: un PATCH puede traer un solo campo. `Partial` lo expresa, y el compilador te obliga a tratar el `undefined` (por eso en `update` cada campo va con `!== undefined`).
- **Seguridad**: si devolvieras la entidad de base de datos tal cual, cualquier columna nueva (un `password_hash`, un `deleted_at`) se filtraría sola a la API.

Y como el DTO es del borde, se valida en el borde: el middleware de zod es quien comprueba la entrada y el DTO es lo que el modelo recibe ya validado.
