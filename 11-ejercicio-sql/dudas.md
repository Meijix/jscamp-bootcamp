<!-- Aquí puedes poner tus dudas sobre el ejercicio -->

# Mis dudas del ejercicio de SQL

## Sobre bases de datos en general

### ¿Por qué una base de datos y no un archivo JSON?

Hasta ahora todo funcionaba con `jobs.json`. Entiendo que ahora los datos "persisten",
pero también podría escribir en el JSON con `fs.writeFile`. ¿Qué hace una base de
datos que un archivo no?

### ¿SQLite es una base de datos "de verdad"?

Como es solo un archivo, me da la sensación de que es "la de juguete".
¿Se usa en producción? ¿Cuándo tendría que pasarme a PostgreSQL o MySQL?

### ¿Por qué el archivo `jobs.db` no se puede abrir con un editor de texto?

Lo he intentado y sale todo símbolos raros. ¿Cómo miro lo que hay dentro?

### ¿Hay que subir el `jobs.db` a git?

Lo hemos puesto en el `.gitignore`. Pero entonces, si otra persona clona el repo,
¿tiene que ejecutar el seed? ¿Y qué pasa con los datos de producción?

## Tarea 1 | La conexión

### ¿Por qué `better-sqlite3` es SÍNCRONO si todo lo demás en Node es asíncrono?

Me han repetido mil veces que en Node hay que usar `await` para no bloquear.
Y aquí, de repente, no hace falta. ¿No estoy bloqueando el servidor en cada consulta?

### Si es síncrono, ¿por qué los métodos del modelo siguen siendo `async`?

Me parece contradictorio. ¿Es solo para no tener que cambiar los controladores?

### ¿Qué es un PRAGMA?

No es SQL normal, ¿verdad? Parece más bien configuración. ¿Hay muchos?

### ¿Por qué SQLite ignora las claves foráneas por defecto?

Esto me parece increíble. Si es una función importante, ¿por qué viene apagada?
¿Cuánta gente tendrá bugs por no saberlo?

### ¿Qué es el modo WAL y de verdad lo necesito?

En mi ordenador, con un solo usuario, ¿nota alguna diferencia?

### ¿Por qué hay que construir la ruta con `import.meta.dirname` en vez de poner `'jobs.db'`?

El comentario dice que si no, se crearía la base de datos en la carpeta desde la que
ejecuto el comando. ¿Eso significa que podría tener varias bases de datos vacías
repartidas por ahí sin enterarme?

## Tarea 2 | El esquema y el seed

### ¿Por qué hacen falta TRES tablas para una cosa que en JSON era un solo objeto?

Esta es mi duda más grande del ejercicio. El JSON era claro y ahora tengo los datos
desperdigados. ¿De verdad esto es mejor?

### ¿Por qué no puedo guardar un array en una columna?

`technologies: ['react', 'node']` cabía perfectamente en el JSON.
¿Por qué SQL no tiene arrays? ¿No podría guardarlo como texto separado por comas?

### ¿Qué es una relación "uno a muchos"?

Entiendo el ejemplo (un job tiene muchas tecnologías), pero no sé identificar cuándo
me hace falta una tabla nueva y cuándo basta con una columna más.

### ¿Qué es exactamente una PRIMARY KEY y qué gano con ella?

¿Es solo "el campo que identifica la fila"? ¿Qué pasa si no pongo ninguna?

### ¿Qué es una FOREIGN KEY y qué pasa si pongo un `job_id` que no existe?

¿Da error al insertar? ¿O solo si tengo activado el PRAGMA de antes?

### ¿Qué hace `ON DELETE CASCADE`?

Me da un poco de miedo: si borro un job se borran otras cosas automáticamente.
¿Y si algún día borro algo sin querer y se lleva media base de datos por delante?

### ¿Qué es un `CHECK` y en qué se parece a un tipo de TypeScript?

Los dos limitan los valores posibles. ¿Cuál es más fiable? ¿Debería tener los dos?

### ¿Qué es una transacción y por qué es "todo o nada"?

Entiendo la idea, pero ¿cómo lo hace SQLite por dentro? Si falla a la mitad,
¿cómo deshace lo que ya había escrito?

### ¿Por qué una transacción es más RÁPIDA y no más lenta?

Pensaba que añadir seguridad siempre costaba rendimiento. Aquí es al revés.

### ¿Qué es `prepare()` y por qué no ejecuto el SQL directamente?

¿Qué significa que la sentencia se "compila"? ¿Se guarda en algún sitio?

### ¿Por qué hay que borrar antes de insertar para que el seed se pueda repetir?

¿No hay una forma de decir "inserta solo si no existe"? ¿Y qué es `INSERT OR REPLACE`?

## Tarea 3 | Migrar el modelo

### ¿De verdad no hay que tocar los controladores ni las rutas?

Me ha sorprendido mucho. ¿Esto es lo que se consigue con el MVC?
¿Siempre sale tan limpio o aquí hemos tenido suerte?

### ¿Qué es la inyección SQL? No acabo de imaginármela

Entiendo que hay que usar `?` en vez de pegar el valor en el texto, pero
¿qué haría un atacante exactamente? ¿Me pueden borrar la base de datos escribiendo
algo raro en un filtro?

### ¿Por qué los `?` son seguros y las plantillas con `${}` no?

Si al final el valor acaba en la consulta igualmente, ¿qué cambia?

### El truco de `WHERE 1 = 1`, ¿no es un poco sucio?

Funciona, pero añadir una condición falsa que no hace nada me parece un apaño.
¿Se hace así en proyectos reales?

### ¿Qué diferencia hay entre `.get()`, `.all()` y `.run()`?

Uno devuelve una fila, otro todas y el tercero... ¿nada? ¿Cómo me acuerdo de cuál usar?

### ¿Qué es una subconsulta y en qué se diferencia de un JOIN?

He usado `id IN (SELECT ...)` para filtrar por tecnología. El comentario dice que un
JOIN daría filas duplicadas. ¿Por qué? ¿Cuál es más rápido?

### El problema N+1: ¿estoy haciendo demasiadas consultas?

Por cada job hago dos consultas más (tecnologías y contenido). Con 10 jobs son 21
consultas. ¿Eso es un problema? ¿Cómo se arregla?

### ¿Por qué después de crear un job lo vuelvo a leer de la base de datos?

Ya tengo los datos que acabo de insertar. ¿No es una consulta de más?

### ¿Por qué hay que hacer `as FilaJob[]` en las consultas?

TypeScript no sabe qué devuelve el SQL porque es texto, ¿verdad? Entonces,
¿estoy "prometiendo" que las columnas son las que digo? ¿Y si me equivoco de nombre?

### En el `update`, ¿por qué se monta el SQL a trozos?

Es la función más complicada del ejercicio. ¿No hay una forma más sencilla de hacer
un PATCH en SQL?

### ¿Por qué hay que comprobar `if (campos.length > 0)` antes del UPDATE?

Entiendo que un `UPDATE jobs SET WHERE id = ?` sin nada en medio es inválido.
Pero, ¿no debería avisar el usuario de que no ha mandado nada?

### ¿Qué significa `resultado.changes`?

¿Es el número de filas que han cambiado? ¿Y si borro algo que ya estaba borrado,
da 0 o da error?

## Sobre el resultado

### Los datos están "planos" en SQL y "anidados" en la API, ¿por qué?

Tengo una función solo para recomponer el objeto. ¿No sería más fácil que la API
devolviera los datos tal y como están en la base de datos?

### ¿Qué es un DTO? (`CreateJobDTO`, `UpdateJobDTO`)

He visto las siglas en `types.ts` pero no sé qué significan ni por qué hacen falta
tipos distintos para crear y para actualizar.
