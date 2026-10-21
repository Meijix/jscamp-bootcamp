<!-- Escribe aquí tus dudas -->

# Mis dudas del ejercicio de Docker

## Sobre Docker en general

### ¿Qué es un contenedor? ¿Es como una máquina virtual?

Es la pregunta con la que llevo peleándome todo el módulo. Si dentro hay un Linux,
¿no es una máquina virtual? Y si no lo es, ¿por qué arranca en un segundo?

### ¿Cuál es la diferencia entre una imagen y un contenedor?

Sé que "la imagen es la receta y el contenedor el plato", pero luego veo comandos
como `docker images` y `docker ps` y me sigo liando. ¿Puedo tener varios
contenedores de la misma imagen a la vez?

### ¿Dónde se guardan las imágenes en mi ordenador?

Porque no las veo en ninguna carpeta. ¿Y por qué ocupan tantos GB?

### Si mi Mac no es Linux, ¿cómo ejecuta imágenes de Linux?

Esto no me cuadra. ¿Docker Desktop tiene un Linux escondido dentro?

## Tarea 1 | "En mi máquina funciona"

### ¿De verdad el mismo `app.js` puede fallar solo por cambiar el `FROM`?

Lo he visto con mis propios ojos y aun así me sorprende. ¿Significa que mi código
puede estar roto para otras personas y yo no enterarme nunca?

### ¿Cómo sé qué versión de Node necesita mi proyecto?

En este ejemplo era por `structuredClone`. Pero, ¿cómo lo averiguo en un proyecto
de verdad, con 50 dependencias?

### ¿Qué significa `alpine` en `node:22-alpine`?

¿Es otro sistema operativo? ¿Por qué pesa tan poco? ¿Tiene alguna pega usarlo?

### ¿Qué es el "contexto de build"? ¿Ese punto del final del comando?

`docker build -t algo .` — ¿ese punto es la carpeta que se envía? ¿A dónde se envía,
si Docker está en mi propio ordenador?

### ¿Por qué `CMD ["node", "app.js"]` y no `CMD node app.js`?

El comentario habla de "señales" y del "PID 1", y me he perdido completamente.
¿Qué problema tiene la segunda forma en la práctica?

## Tarea 2 | Hola Docker

### ¿Qué son las "capas" de una imagen?

¿Cada línea del Dockerfile crea una? ¿Se guardan todas para siempre?

### ¿Por qué el archivo se llama `dockerfile` en minúscula aquí y `Dockerfile` en otras carpetas?

¿Da igual? ¿Funciona de las dos formas?

### ¿Qué pasa si el contenedor termina enseguida, como este del `echo`?

¿Está "muerto"? ¿Ocupa espacio? ¿Para qué sirve el `--rm`?

## Tarea 3 | La app real y las buenas prácticas

### ¿Por qué copiar el `package.json` ANTES que el código?

Esta es LA duda del ejercicio. Entiendo que tiene que ver con la caché, pero
¿por qué cambiar `server.js` obligaría a reinstalar las dependencias si son cosas
distintas?

### ¿Cuándo se invalida la caché exactamente?

Si cambio una línea del Dockerfile a la mitad, ¿se rehacen solo las de abajo o todas?

### ¿Qué diferencia hay entre `npm install` y `npm ci`?

¿Y por qué `ci` es mejor en Docker? ¿Qué es lo que puede cambiar con `install`?

### ¿Por qué ejecutar como usuario `node` y no como root?

Si el contenedor está aislado, ¿qué más da ser root ahí dentro? ¿Puede alguien
"salirse" del contenedor?

### ¿Por qué el `USER node` tiene que ir DESPUÉS del `npm ci`?

Lo probé antes y falló. ¿Es porque el usuario `node` no puede escribir en `/app`?
¿Y por qué root sí puede?

### ¿Qué hace `EXPOSE` si no abre el puerto?

Entonces, ¿es solo un comentario? ¿Por qué existe si no hace nada?

### En `-p 3000:3000`, ¿cuál número es cuál?

Nunca me acuerdo. ¿El primero es el de mi ordenador o el del contenedor?

### ¿Por qué hay que poner `node_modules` en el `.dockerignore`?

Si de todas formas se van a instalar dentro, ¿no se sobrescribirían?
He leído algo de que pueden estar "compilados para macOS". ¿Qué significa eso?

### ¿Es peligroso que un `.env` acabe dentro de una imagen?

Si la imagen está en mi ordenador, ¿quién la va a ver? ¿Y si la subo a Docker Hub?

### ¿Cuál es la diferencia entre `-e` y `--env-file`?

¿Son lo mismo pero uno más cómodo? ¿Cuál gana si uso los dos?

### ¿Qué es el `hostname` que devuelve la app y por qué cambia cada vez?

Me sale un código raro distinto en cada ejecución. ¿Es el id del contenedor?

## Tarea 4 | `docker init`

### Si `docker init` me lo escribe todo, ¿para qué aprendí a hacerlo a mano?

Es un poco frustrante. ¿Sirve para aprender o de verdad se usa en el día a día?

### ¿Qué es esa primera línea rara: `# syntax=docker/dockerfile:1`?

Parece un comentario pero por lo visto no lo es. ¿Cómo puede un comentario hacer algo?

### ¿Qué es un `--mount=type=bind` dentro de un `RUN`?

No lo entiendo nada. ¿Se "asoman" archivos temporalmente? ¿Y luego desaparecen?

### ¿Qué es `--mount=type=cache` y dónde se guarda esa caché?

Si cada build empieza de cero, ¿dónde sobrevive?

### ¿Qué es Docker Compose y cuándo lo necesito?

Con un solo servicio parece que no aporta mucho. ¿Empieza a merecer la pena cuando
hay base de datos?

### En el compose de ejemplo, ¿qué es un `healthcheck` y un `depends_on`?

¿Docker espera a que la base de datos esté lista? ¿Cómo sabe que "está lista"?

## Tarea 5 | Multi-stage

### ¿Cómo puede haber dos `FROM` en el mismo archivo?

Pensaba que `FROM` era "la imagen base" y solo podía haber una.

### ¿La primera etapa desaparece del todo?

Entonces, ¿para qué la construyo? ¿Se queda guardada en algún sitio de mi ordenador?

### ¿Qué hace exactamente `COPY --from=builder`?

¿Copia de "otra imagen"? ¿Puedo copiar de una imagen que no sea mía?

### ¿Por qué aquí sí instalo las devDependencies y en la tarea 3 no?

Porque hace falta `esbuild` para compilar, ¿verdad? ¿Y por eso no pasa nada aunque
sean pesadas?

### ¿Qué es un "bundle" y por qué no necesita `node_modules`?

Si el código importa `canvas-confetti`, ¿dónde está esa librería en la imagen final?

### ¿Qué significa "menos superficie de ataque"?

¿Que haya menos programas instalados hace la imagen más segura? ¿Por qué?

### ¿Para qué sirve `--chown=node:node` en el COPY?

¿Los archivos "pertenecen" a alguien dentro del contenedor?

## Tarea 6 | Volúmenes

### ¿Por qué los contenedores son "efímeros" a propósito?

Me parece un inconveniente enorme. ¿Por qué se diseñó así? ¿No sería más fácil que
guardaran las cosas?

### ¿Cuál es la diferencia entre un volumen y un bind mount?

Los dos se ponen con `-v` y los dos guardan datos. ¿Por qué uno es para producción
y el otro para desarrollo?

### ¿Dónde está guardado físicamente un Docker Volume?

Si no le doy una ruta de mi ordenador, ¿dónde acaban los datos?

### ¿Qué pasa si monto un volumen encima de una carpeta que ya tenía archivos?

¿Se pierden? ¿Se mezclan?

### ¿Qué hace `node --watch` y por qué solo sirve con un bind mount?

Si el código está "congelado" dentro de la imagen, ¿qué iba a detectar el watch?

### ¿Por qué en producción no se usan bind mounts?

El comentario dice que la app "quedaría atada a las rutas de una máquina".
¿Puedes poner un ejemplo de qué se rompería?

## Tareas opcionales

### ¿Docker sirve igual para Python y para Go que para Node?

Me ha sorprendido que los Dockerfiles sean casi idénticos cambiando los comandos.
¿Da igual el lenguaje?

### ¿Por qué la imagen de Go acaba pesando 25 MB y la de Node 229 MB?

¿Es porque Go compila a un solo archivo? ¿Podría hacer algo parecido con Node?

### ¿Qué es `--no-cache-dir` en el `pip install`?

¿Es lo mismo que la caché de npm? ¿Por qué aquí la quitamos y en la tarea 4 la
queremos?

### ¿Qué es Docker Model Runner? ¿Estoy ejecutando una IA en mi portátil?

¿Y qué es esa URL rara, `model-runner.docker.internal`? ¿De dónde sale ese dominio?

## Dudas prácticas

### Se me llena el disco de imágenes, ¿cómo limpio?

He construido como 10 imágenes haciendo el ejercicio. ¿Hay que borrarlas a mano?

### ¿Cómo depuro un contenedor que no arranca?

Si falla, la ventana se cierra y no veo nada. ¿Cómo entro a mirar qué pasa dentro?

### ¿Qué diferencia hay entre `docker stop`, `docker rm` y `docker rmi`?

Tres comandos parecidos para borrar cosas distintas y siempre me equivoco.

### El puerto 5000 me daba "address already in use" y no tenía nada abierto

Al final resultó ser algo del propio macOS. ¿Cómo averiguo qué programa está
ocupando un puerto?
