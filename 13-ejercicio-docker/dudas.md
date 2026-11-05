<!-- Escribe aquí tus dudas -->

# Mis dudas del ejercicio de Docker

## Sobre Docker en general

### ¿Qué es un contenedor? ¿Es como una máquina virtual?

Es la pregunta con la que llevo peleándome todo el módulo. Si dentro hay un Linux,
¿no es una máquina virtual? Y si no lo es, ¿por qué arranca en un segundo?

**Respuesta.** No: no hay hardware virtual ni kernel propio.

Una máquina virtual virtualiza hardware y arranca un kernel completo: de ahí los 30-60 segundos de boot. Un contenedor arranca en milisegundos porque lo único que hace el kernel es `clone()` + cambiar de namespaces.

Dentro del contenedor no hay un Linux completo: hay los binarios que trae la imagen (Alpine trae busybox, no bash) corriendo sobre el kernel del host.

En macOS hay un matiz importante: como en Mac no hay kernel Linux, el motor (Dory o Docker Deskrop) sí arranca una VM Linux liviana, y los contenedores son procesos dentro de esa VM.
O sea: en Mac "Docker por debajo" es una VM; lo que no es una VM es cada contenedor.

### ¿Cuál es la diferencia entre una imagen y un contenedor?

Sé que "la imagen es la receta y el contenedor el plato", pero luego veo comandos
como `docker images` y `docker ps` y me sigo liando. ¿Puedo tener varios
contenedores de la misma imagen a la vez?

**Respuesta.**
La imagen es una plantilla que no muta: una pila de capas de solo lectura con el sistema de ficheros más los metadatos (`CMD`, `ENV`, `EXPOSE`, `USER`).

El contenedor es una instancia en ejecución: esa imagen + una capa fina de escritura encima + un proceso.

- `docker images` lista plantillas.
- `docker ps` lista instancias vivas.

Podés tener varios contenedores de la misma imagen a la vez. Cada uno tiene su propia capa de escritura y su propio proceso; no se pisan (el `node_modules` de la imagen es de solo lectura y compartido, lo que cada contenedor escribe va a su capa).

El plato se puede modificar y la receta no.

### ¿Dónde se guardan las imágenes en mi ordenador?

Porque no las veo en ninguna carpeta. ¿Y por qué ocupan tantos GB?

**Respuesta.** No en una carpeta que veas con el Finder: viven en el almacén del motor (el driver de almacenamiento, normalmente `overlay2`, dentro de `/var/lib/docker` del Linux que corre el demonio).

En macOS ese Linux es la VM del motor, así que están dentro del disco virtual de la VM, no en `~/`.

Para verlas y medirlas:

```bash
docker image ls                 # qué hay
docker system df                # cuánto ocupa cada cosa (imágenes, contenedores, caché de build, volúmenes)
docker system df -v             # detalle imagen por imagen
```

Ocupan GB porque cada imagen guarda sus capas completas: `node:22-alpine` ~150 MB, `golang:1.24-alpine` ~350 MB, `alpine` ~8 MB. Las capas se comparten entre imágenes (dos imágenes basadas en el mismo `FROM` no duplican la base).

### Si mi Mac no es Linux, ¿cómo ejecuta imágenes de Linux?

Esto no me cuadra. ¿Docker Desktop tiene un Linux escondido dentro?

**Respuesta.** Porque el motor de Docker no corre nativo en macOS: arranca una VM Linux muy liviana y el demonio `docker` corre dentro de esa VM. Los contenedores son procesos de ese Linux.

La CLI `docker` de tu Mac es solo un cliente: habla HTTP con el demonio a través de un socket Unix. Eso explica varias cosas:

- los volúmenes viven en la VM, no en tu Mac.
- los bind mounts son carpetas de tu Mac compartidas hacia la VM (por eso son más lentos que un volumen).
- si corrés una imagen de otra arquitectura, el motor la emula y va lento.

## Tarea 1 | "En mi máquina funciona"

### ¿De verdad el mismo `app.js` puede fallar solo por cambiar el `FROM`?

Lo he visto con mis propios ojos y aun así me sorprende. ¿Significa que mi código
puede estar roto para otras personas y yo no enterarme nunca?

**Respuesta.** Sí, y no es magia: el `FROM` elige el intérprete.
`structuredClone` existe como global desde Node 17 y `Array.prototype.findLast` desde Node 18. En Node 16 no existen, así que `app.js` muere en la primera línea que las usa con `ReferenceError: structuredClone is not defined`.

Tu código no cambió, cambió el entorno. Es exactamente el problema de "en mi máquina funciona".

Es posible tener código roto para otra gente sin enterarte: por eso se declara `engines.node` en el `package.json` y se corre la suite en una matriz de CI con dos o tres versiones. Docker no te salva de eso, solo hace visible la versión que elegiste.

### ¿Cómo sé qué versión de Node necesita mi proyecto?

En este ejemplo era por `structuredClone`. Pero, ¿cómo lo averiguo en un proyecto
de verdad, con 50 dependencias?

**Respuesta.**

Siempre lo mejor es usar la versión de Node más actualizada dentro de la LTS. Lo podes ver acá: https://nodejs.org/en/about/previous-releases

### ¿Qué significa `alpine` en `node:22-alpine`?

¿Es otro sistema operativo? ¿Por qué pesa tan poco? ¿Tiene alguna pega usarlo?

**Respuesta.** 
`node:22-alpine` es Node 22 compilado sobre **Alpine Linux**, una distro mínima (~5 MB).
La ventaja grande es que la imagen pesa 10-20 veces menos y tiene muchísimo menos software que atacar.

Puede no funcionar con alguna dependencia que requiera recursos externos, pero es raro que suceda.

### ¿Qué es el "contexto de build"? ¿Ese punto del final del comando?

`docker build -t algo .` — ¿ese punto es la carpeta que se envía? ¿A dónde se envía,
si Docker está en mi propio ordenador?

**Respuesta.** Sí, en `docker build -t algo .` ese `.` es el contexto, la carpeta que el cliente empaqueta y le manda al builder. Todo lo que está ahí puede usarse en `COPY`/`ADD`; lo que no está, no existe para el Dockerfile.

Se envía al demonio (en tu Mac, a la VM): por eso un contexto con `node_modules` de 300 MB tarda y ocupa. El `.dockerignore` filtra antes de enviarlo, y por eso ahorra tiempo de verdad y no solo espacio en la imagen.

### ¿Por qué `CMD ["node", "app.js"]` y no `CMD node app.js`?

El comentario habla de "señales" y del "PID 1", y me he perdido completamente.
¿Qué problema tiene la segunda forma en la práctica?

**Respuesta.** Antes que nada, una idea que hace falta para todo lo demás: el contenedor tiene un solo proceso "al mando" (el PID 1), y cuando Docker quiere apagarlo le avisa solo a ese proceso. Si el que está al mando no es tu app, tu app no se entera de nada.

- `CMD ["node", "app.js"]` (array, "exec form") -> Docker ejecuta Node directamente. Node es el que está al mando.
- `CMD node app.js` (texto, "shell form") -> Docker ejecuta un shell (`/bin/sh -c "node app.js"`) y ese shell arranca a Node como hijo. El que está al mando es el shell, no tu app.

Y acá está el problema, cuando hacés `docker stop`:

1. Docker manda la señal de apagado (`SIGTERM`) al proceso al mando.
2. En el segundo caso la recibe el shell... y el shell no se la pasa a su hijo.
3. Tu app sigue como si nada. Docker espera unos 10 segundos y mata todo a la fuerza con `SIGKILL`.

## Tarea 2 | Hola Docker

### ¿Qué son las "capas" de una imagen?

¿Cada línea del Dockerfile crea una? ¿Se guardan todas para siempre?

**Respuesta.** Pensá la imagen como una pila de fotos: cada instrucción que toca archivos agrega una foto nueva con solo lo que cambió en esa instrucción.

- Crean capa: `RUN`, `COPY`, `ADD` (son las que modifican archivos).
- No crean capa: `ENV`, `CMD`, `EXPOSE`, `USER`, `WORKDIR` (son metadatos, etiquetas).
- `FROM` no crea ninguna: aporta las capas de la imagen base, que ya existían.

No se guardan para siempre: viven en la caché de tu motor, se comparten entre imágenes (dos imágenes con el mismo `FROM` no duplican la base) y se tiran cuando nada las usa (`docker image prune`, `docker builder prune`).

### ¿Por qué el archivo se llama `dockerfile` en minúscula aquí y `Dockerfile` en otras carpetas?

¿Da igual? ¿Funciona de las dos formas?

**Respuesta.**
Fue un error nuestro a la hora de escribir el ejercicio, la manera correcta es `Dockerfile`.

### ¿Qué pasa si el contenedor termina enseguida, como este del `echo`?

¿Está "muerto"? ¿Ocupa espacio? ¿Para qué sirve el `--rm`?

**Respuesta.** Lo que muere es el proceso; el contenedor queda como objeto archivado, con su capa de escritura y sus logs. Como una compra: la compra ya terminó, pero la factura queda.

`--rm` lo borra automáticamente al salir, que es lo que querés en pruebas de una sola pasada.

## Tarea 3 | La app real y las buenas prácticas

### ¿Por qué copiar el `package.json` ANTES que el código?

Esta es LA duda del ejercicio. Entiendo que tiene que ver con la caché, pero
¿por qué cambiar `server.js` obligaría a reinstalar las dependencias si son cosas
distintas?

**Respuesta.**
Porque la caché se invalida en cadena: cada capa depende de la de arriba, así que si cambiás una, se rehacen esa y todas las de abajo.

Mirá el orden equivocado:

```dockerfile
COPY . .          # esta capa contiene server.js
RUN npm ci        # esta capa depende de la anterior
```

cambiar una coma de `server.js` cambia la primera capa, y entonces `npm ci` se vuelve a ejecutar entero.

Con el orden correcto:

```dockerfile
COPY package*.json ./   # solo depende de los manifiestos
RUN npm ci              # solo se invalida si cambian las dependencias
COPY . .                # cambia con el código, pero ya no arrastra el npm ci
```

editar `server.js` solo rehace la última capa. Acá reinstalar express son 2-5 segundos; en un proyecto con 800 dependencias son minutos por cada cambio.

Lo que menos cambia, más arriba en el Dockerfile.

### ¿Cuándo se invalida la caché exactamente?

Si cambio una línea del Dockerfile a la mitad, ¿se rehacen solo las de abajo o todas?

**Respuesta.** Docker va instrucción por instrucción, de arriba abajo, comparando con lo que tiene en caché:

- si el texto de la instrucción y las capas padre son idénticos -> reutiliza la capa;
- si algo cambió -> invalida **esa capa y todas las siguientes** (porque cada capa apunta a la anterior).

Las de arriba se siguen usando. Así que sí: cambiar una línea del medio rehace solo las de abajo, que es exactamente lo que querés.

### ¿Qué diferencia hay entre `npm install` y `npm ci`?

¿Y por qué `ci` es mejor en Docker? ¿Qué es lo que puede cambiar con `install`?

**Respuesta.** 
- `npm install` negocia: resuelve los rangos del `package.json`, puede bajar versiones nuevas y reescribir el lockfile.
- `npm ci` obedece: exige que el lockfile esté en sincronía con el `package.json` (si no, falla con un error claro), borra `node_modules` e instala exactamente lo del lockfile, sin escribir nada.

En Docker y CI querés `ci`, por dos razones:

1. Reproducibilidad: la imagen de hoy y la de dentro de seis meses son idénticas.
2. Detección de errores: si alguien agregó una dependencia y se olvidó de commitear el lockfile, el build falla en vez de inventar versiones.

### ¿Por qué ejecutar como usuario `node` y no como root?

Si el contenedor está aislado, ¿qué más da ser root ahí dentro? ¿Puede alguien
"salirse" del contenedor?

**Respuesta.** Porque "aislado" no significa "sin poderes". Si la app corre como root y alguien consigue ejecutar código dentro del contenedor (una dependencia comprometida, un `eval` de más), ese ya tiene root ahí dentro: y puede escribir archivos tuyos con los permisos del proceso.

Se puede "salir" del contenedor sí, es posible pero no trivial; por eso no regalamos el privilegio.

### ¿Por qué el `USER node` tiene que ir DESPUÉS del `npm ci`?

Lo probé antes y falló. ¿Es porque el usuario `node` no puede escribir en `/app`?
¿Y por qué root sí puede?

**Respuesta.** Porque la pregunta es de quién es la carpeta `/app`.
`WORKDIR /app` la crea root, y todo lo que copiás queda con dueño root. El usuario `node` puede leerla y atravesarla, pero no escribir en ella.

Si pusieras `USER node` antes de `RUN npm ci`, npm intentaría crear `/app/node_modules` y fallaría con `EACCES: permission denied` (permiso denegado).

Root puede escribir porque es el dueño de `/app`. `node` no es el dueño: entra por el permiso de "otros", que solo permite leer.

### ¿Qué hace `EXPOSE` si no abre el puerto?

Entonces, ¿es solo un comentario? ¿Por qué existe si no hace nada?

**Respuesta.**
Es metadato: queda grabado en la imagen (`docker inspect` lo muestra) y lo leen las herramientas.
Para qué sirve de verdad:
- `docker run -P` publica todos los puertos expuestos.
- Compose lo lee para saber por dónde escucha la app.
- Documenta la imagen para quien la use.

Para entrar desde fuera sigue haciendo falta `-p host:contenedor`.

### En `-p 3000:3000`, ¿cuál número es cuál?

Nunca me acuerdo. ¿El primero es el de mi ordenador o el del contenedor?

**Respuesta.** `
- `-p 3000:3000` → entrás por `localhost:3000` y Docker lo manda al 3000 del contenedor.
- `-p 8080:3000` → entrás por `localhost:8080`, la app sigue escuchando en 3000 adentro.

### ¿Por qué hay que poner `node_modules` en el `.dockerignore`?

Si de todas formas se van a instalar dentro, ¿no se sobrescribirían?
He leído algo de que pueden estar "compilados para macOS". ¿Qué significa eso?

**Respuesta.** Tres motivos:

1. Velocidad: el contexto no arrastra cientos de MB en cada build.
2. Corrección: los módulos nativos de tu Mac están compilados para macOS y no cargan en Linux. Es como llevar un repuesto de otro modelo de auto: entra en la caja, pero no sirve.
3. No aporta nada: `npm ci` borra `node_modules` y reinstala igual.

"Compilado para macOS" significa que el paquete, al instalarse, eligió un binario o compiló un `.node` para esa plataforma. Si copiás ese archivo a una imagen Linux, no es ejecutable allí, aunque el código JavaScript sea el mismo.

### ¿Es peligroso que un `.env` acabe dentro de una imagen?

Si la imagen está en mi ordenador, ¿quién la va a ver? ¿Y si la subo a Docker Hub?

**Respuesta.**
Sí, y bastante peligroso.
Una imagen es un archivo que se comparte. Es como mandar un sobre por correo con los datos adentro: no importa que lo cierres bien, quien lo abre lo lee.

Los secretos se usan al ejecutar (`-e`, `--env-file` o secretos de Compose), nunca en el build.

Tu `.dockerignore` excluye `.env` y `.env.*`, así que no llegan ni al contexto, que es lo correcto.

### ¿Cuál es la diferencia entre `-e` y `--env-file`?

¿Son lo mismo pero uno más cómodo? ¿Cuál gana si uso los dos?

**Respuesta.**
Si repetís la misma variable en los dos, gana la última que aparezca en la línea de comandos, y sí, son lo mismo.

### ¿Qué es el `hostname` que devuelve la app y por qué cambia cada vez?

Me sale un código raro distinto en cada ejecución. ¿Es el id del contenedor?

**Respuesta.** `process.env.HOSTNAME` en Linux es el ID del contenedor. Docker lo define al crearlo, así que cambia en cada `docker run`.

Sirve cuando levantás el mismo servicio cinco veces y ves cinco hostnames distintos.

## Tarea 4 | `docker init`

### Si `docker init` me lo escribe todo, ¿para qué aprendí a hacerlo a mano?

Es un poco frustrante. ¿Sirve para aprender o de verdad se usa en el día a día?

**Respuesta.**
Para aprender y para entender qué hace cada cosa. Si algún día tenes que meter mano en el archivo, al menos conoces para qué es cada cosa.

### ¿Qué es esa primera línea rara: `# syntax=docker/dockerfile:1`?

Parece un comentario pero por lo visto no lo es. ¿Cómo puede un comentario hacer algo?

**Respuesta.** 
Es una directiva del parser. Docker la lee en la primera línea y le dice "usá esta versión del traductor de Dockerfiles". Es como una nota al cartero y no al destinatario: no forma parte de la carta, pero cambia cómo se entrega.

Poner `docker/dockerfile:1` fija una versión estable y reproducible entre máquinas. Es el único comentario que no es comentario, y por eso tiene que ir en la primera línea.

### ¿Qué es un `--mount=type=bind` dentro de un `RUN`?

No lo entiendo nada. ¿Se "asoman" archivos temporalmente? ¿Y luego desaparecen?

**Respuesta.**
Sí,es eso: monta un archivo o carpeta del contexto dentro del contenedor de ese `RUN`, solo mientras corre, y lo desmonta al terminar.

```dockerfile
RUN --mount=type=bind,source=package.json,target=package.json \
    npm ci --omit=dev
```

`npm ci` ve el `package.json` sin que exista una capa con él.

### ¿Qué es `--mount=type=cache` y dónde se guarda esa caché?

Si cada build empieza de cero, ¿dónde sobrevive?

**Respuesta.** Es una carpeta gestionada por el builder que sobrevive entre builds y no va a la imagen.
`target=/root/.npm` es la caché de npm. Como la caja de herramientas del taller: queda ahí para el próximo trabajo, pero no se entrega con el mueble.

- La primera vez descarga; las siguientes reutiliza aunque cambien las dependencias.
- Vive en el área de caché del builder.
- No se comparte entre máquinas ni con un builder remoto (salvo que uses un builder con caché persistente).

En CI es lo que te ahorra minutos, si persistís el builder o la caché (`--cache-to`/`--cache-from`).
En tu Mac sobrevive entre builds porque el builder es el mismo.

### ¿Qué es Docker Compose y cuándo lo necesito?

Con un solo servicio parece que no aporta mucho. ¿Empieza a merecer la pena cuando
hay base de datos?

**Respuesta.**
Un archivo declarativo (`compose.yaml`) que describe servicios (imágenes o builds, puertos, variables, volúmenes, redes) y un comando (`docker compose up`) que levanta todo junto y conectado por una red interna.

Con un solo servicio aporta poco (te ahorra un `docker run` largo). Pero en cuanto hay base de datos + app + cache ya no querés escribir tres `docker run` con sus flags y sus `--network`.

### En el compose de ejemplo, ¿qué es un `healthcheck` y un `depends_on`?

¿Docker espera a que la base de datos esté lista? ¿Cómo sabe que "está lista"?

**Respuesta.**
`healthcheck` es un comando que Docker ejecuta dentro del contenedor cada X segundos (`pg_isready`) para decidir si el servicio está `starting`, `healthy` o `unhealthy`.

`depends_on` con `condition: service_healthy` hace que Compose no arranque el servidor hasta que la DB esté `healthy`. "Está lista" = el comando del healthcheck devolvió 0.

Sin esa condición, `depends_on` simple solo espera a que el contenedor arranque, no a que la DB acepte conexiones.

## Tarea 5 | Multi-stage

### ¿Cómo puede haber dos `FROM` en el mismo archivo?

Pensaba que `FROM` era "la imagen base" y solo podía haber una.

**Respuesta.**
Cada `FROM` abre una etapa nueva y el build continúa en la última.

Las etapas anteriores existen solo para producir archivos. Es como un taller con dos mesas: en la primera se corta la madera, en la segunda se arma y se entrega.

### ¿La primera etapa desaparece del todo?

Entonces, ¿para qué la construyo? ¿Se queda guardada en algún sitio de mi ordenador?

**Respuesta.**
No viaja a la imagen final, la imagen final solo tiene las capas de la última etapa más lo que copiaste con `COPY --from`.

La construís para reutilizar su caché en los builds siguientes. Por eso conviene ordenar la etapa builder igual que cualquier Dockerfile (manifiestos primero, código después): si la caché del builder se mantiene, `npm ci` no se repite.

### ¿Qué hace exactamente `COPY --from=builder`?

¿Copia de "otra imagen"? ¿Puedo copiar de una imagen que no sea mía?

**Respuesta.** 
Copia archivos desde otra etapa del mismo build, por nombre (`--from=builder`) o por índice (`--from=0`).
Solo copia archivos: no trae variables de entorno, ni `CMD`, ni metadatos de la otra etapa.

### ¿Por qué aquí sí instalo las devDependencies y en la tarea 3 no?

Porque hace falta `esbuild` para compilar, ¿verdad? ¿Y por eso no pasa nada aunque
sean pesadas?

**Respuesta.** 
Porque acá hacen falta para compilar si.

Y no pasa nada por instalarlas porque esa etapa no es la imagen final: se queda en el builder y no engorda la imagen.

### ¿Qué es un "bundle" y por qué no necesita `node_modules`?

Si el código importa `canvas-confetti`, ¿dónde está esa librería en la imagen final?

**Respuesta.**
`esbuild` lee el entrypoint, resuelve cada `import` incluido `canvas-confetti`, que está en `node_modules`, y escribe un solo archivo con todo el código junto, sin imports externos.

### ¿Qué significa "menos superficie de ataque"?

¿Que haya menos programas instalados hace la imagen más segura? ¿Por qué?

**Respuesta.** Cada programa instalado es código que puede tener una vulnerabilidad explotable: bash, curl, git, compiladores, herramientas de red.

También achica la imagen (menos que transferir y almacenar) y acelera el arranque.

Es el motivo de `alpine`/`slim`, del multi-stage y de `USER node`. Reducimos las posibilidades de ataque.

### ¿Para qué sirve `--chown=node:node` en el COPY?

¿Los archivos "pertenecen" a alguien dentro del contenedor?

**Respuesta.**
Sí, dentro de un contenedor Linux cada archivo tiene dueño y grupo.

`COPY` sin `--chown` deja los archivos como `root:root`. Si después corrés con `USER node`, node puede leer pero no escribir.

`--chown=node:node` los deja del usuario `node`, que es lo que querés si la app escribe ahí.

## Tarea 6 | Volúmenes

### ¿Por qué los contenedores son "efímeros" a propósito?

Me parece un inconveniente enorme. ¿Por qué se diseñó así? ¿No sería más fácil que
guardaran las cosas?

**Respuesta.**
Porque la gracia es que un contenedor sea reemplazable: si se cae, lo matás y arrancás otro idéntico en otra máquina.

### ¿Cuál es la diferencia entre un volumen y un bind mount?

Los dos se ponen con `-v` y los dos guardan datos. ¿Por qué uno es para producción
y el otro para desarrollo?

**Respuesta.** Los dos se montan con `-v` (o `--mount`) y los dos persisten datos, pero:

- **Volumen:** lo gestiona Docker. Es portable entre máquinas, se respalda con `docker volume`, y no depende de rutas del host.
- **Bind mount:** una ruta concreta de tu máquina. Depende de dónde esté el proyecto, de los permisos y del sistema operativo.

### ¿Dónde está guardado físicamente un Docker Volume?

Si no le doy una ruta de mi ordenador, ¿dónde acaban los datos?

**Respuesta.**

En el área del motor:

- Linux: `/var/lib/docker/volumes/<nombre>/_data`
- macOS/Windows: dentro de la VM del motor, no en una carpeta tuya.

### ¿Qué pasa si monto un volumen encima de una carpeta que ya tenía archivos?

¿Se pierden? ¿Se mezclan?

**Respuesta.**
El montaje tapa el contenido de la imagen en esa ruta: lo que había queda oculto y ves lo que haya en el volumen. No se pierde, solo se oculta.

### ¿Qué hace `node --watch` y por qué solo sirve con un bind mount?

Si el código está "congelado" dentro de la imagen, ¿qué iba a detectar el watch?

**Respuesta.** `--watch` (nativo desde Node 18) reinicia el proceso cuando cambia un archivo.

Dentro de un contenedor, los archivos están en la capa de la imagen: no cambian aunque edites en tu editor, así que no hay nada que detectar.

Con un bind mount de la carpeta del proyecto, el archivo que ve Node es tu archivo, y al guardar el cambio se reinicia. Eso es hot reload.

### ¿Por qué en producción no se usan bind mounts?

El comentario dice que la app "quedaría atada a las rutas de una máquina".
¿Puedes poner un ejemplo de qué se rompería?

**Respuesta.**
Porque atás el contenedor a una ruta de una máquina.

En tu Mac el proyecto está en `/Users/Meijix/github/Meijix/...`; en el servidor el deploy está en `/srv/app` y corre como otro usuario.

Y además:

- no podés mover el contenedor a otra máquina
- no podés tener varias réplicas con el mismo contenido
- rompe "la imagen es inmutable": el código cambia sin rebuild, así que la imagen miente sobre lo que corre

## Tareas opcionales

### ¿Docker sirve igual para Python y para Go que para Node?

Me ha sorprendido que los Dockerfiles sean casi idénticos cambiando los comandos.
¿Da igual el lenguaje?

**Respuesta.**
Sí: Docker no sabe de lenguajes, solo ejecuta procesos. Cambia la imagen base (`python:3.12-slim`, `golang:1.24-alpine`), el gestor de dependencias (`pip`, `go mod`, `npm`) y el `CMD`.

Los conceptos son idénticos.

### ¿Por qué la imagen de Go acaba pesando 25 MB y la de Node 229 MB?

¿Es porque Go compila a un solo archivo? ¿Podría hacer algo parecido con Node?

**Respuesta.** Porque en Go la imagen final solo lleva el binario más `alpine`.

En Node la imagen final lleva el runtime de Node + `node_modules` + tu código, es mucho más contenido.

Se puede hacer algo parecido sí, y es lo que hiciste en la tarea 5: bundle con esbuild y solo `dist/`.

### ¿Qué es `--no-cache-dir` en el `pip install`?

¿Es lo mismo que la caché de npm? ¿Por qué aquí la quitamos y en la tarea 4 la
queremos?

**Respuesta.** 
`pip` guarda los paquetes descargados en `/root/.cache/pip` para no volver a bajarlos.

La diferencia es:

- `--no-cache-dir` apaga la caché.
- `--mount=type=cache` es una caché **entre builds** que **no queda en la imagen**: lo mejor de los dos mundos.

### ¿Qué es Docker Model Runner? ¿Estoy ejecutando una IA en mi portátil?

¿Y qué es esa URL rara, `model-runner.docker.internal`? ¿De dónde sale ese dominio?

**Respuesta.** Es una feature de Docker Desktop que corre modelos de IA localmente y los sirve por una API compatible con OpenAI. Sería como tener un mini ChatGPT sin internet.

```bash
docker model pull ai/smollm2    # baja el modelo
docker model run ai/smollm2     # lo ejecuta
```

Es IA en tu portátil si.

`model-runner.docker.internal` es un nombre especial, para que el contenedor llegue al runner sin saber la IP de tu máquina.
Si el modelo no está descargado, la llamada falla y el `/ask` devuelve el 500 con el mensaje que ves en `app.py`.

## Dudas prácticas

### Se me llena el disco de imágenes, ¿cómo limpio?

He construido como 10 imágenes haciendo el ejercicio. ¿Hay que borrarlas a mano?

**Respuesta.**

Si, te dejo algunos comandos que sirven:

```bash
docker image prune -a       # todas las que no use ningún contenedor
docker container prune      # contenedores parados
docker builder prune        # caché de builds (suele ser lo más pesado)
docker volume prune         # ¡ojo! borra datos que quizá quieras
```

### ¿Cómo depuro un contenedor que no arranca?

Si falla, la ventana se cierra y no veo nada. ¿Cómo entro a mirar qué pasa dentro?

**Respuesta.**
Primero los logs, después el estado, después entrar a mirar.

Los logs sobreviven a la muerte del contenedor, así que la ventana que se cierra no te deja sin información.

1. `docker logs <id>` — el error del proceso. Si el contenedor murió, `docker logs` sigue funcionando (los logs se guardan).
2. `docker inspect <id>` — mirá `State.ExitCode`, `State.OOMKilled` (se quedó sin memoria) y `State.Error`.
3. Entrar a mirar: `docker run --rm -it --entrypoint sh imagen` y probar los comandos a mano (`ls -la /app`, `node server.js`).
4. Si el que falla es el build: `docker build --progress=plain --no-cache .` muestra la salida completa de cada `RUN` (sin `--progress=plain` se pierde en la salida resumida).

Estos procesos son un poco complejos pero es el proceso a seguir.

Para un contenedor que arranca y muere en loop, `docker run --rm imagen sh -c 'node server.js; echo EXIT=$?'` te dice el código de salida sin que Docker lo oculte.

Todos estos comandos es imposible recordarlos, hay que saber que existen y buscarlos cuando lo necesites.

### ¿Qué diferencia hay entre `docker stop`, `docker rm` y `docker rmi`?

Tres comandos parecidos para borrar cosas distintas y siempre me equivoco.

**Respuesta.**
- `docker stop` para el contenedor.
- `docker rm` borra un contenedor parado, con su capa de escritura y sus logs.
- `docker rmi` borra una imagen. Falla si algún contenedor (aunque esté parado) la usa: primero `rm`, después `rmi`.

Mnemotecnia: `stop` y `rm` son de contenedores; `rmi` es de imágenes (`i` = image).
Son muchos comandos, recordarlo es imposible, solo si trabajas constantemente con Docker. La idea como te dije en la respuesta anterior es: saber que existen y buscarlos cuando haga falta.

### El puerto 5000 me daba "address already in use" y no tenía nada abierto

Al final resultó ser algo del propio macOS. ¿Cómo averiguo qué programa está
ocupando un puerto?

**Respuesta.**

Yo lo pruebo de esta forma:

```bash
sudo lsof -i :5000
```

Si existe, definis otro puerto y a seguir.
