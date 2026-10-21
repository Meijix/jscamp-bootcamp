<!-- Escribe aquí tus dudas -->

# Mis dudas del ejercicio de CI/CD

## Sobre CI/CD en general

### ¿Qué significan las siglas CI y CD?

Las oigo todo el rato juntas. ¿Son dos cosas distintas? ¿Estoy haciendo las dos en
este ejercicio o solo una?

### Si ya ejecuto los tests en mi ordenador, ¿para qué ejecutarlos otra vez en GitHub?

Es la duda que más me ronda. Si a mí me pasan, ¿por qué iban a fallar allí?

### ¿Dónde se ejecutan realmente estos workflows?

¿GitHub tiene ordenadores encendidos esperando? ¿Se crea una máquina nueva cada vez?
¿Y eso es gratis?

### ¿Qué pasa si el workflow falla? ¿Bloquea algo?

¿El código se sube igualmente y solo sale un aspa roja? ¿O se puede impedir que se
mezcle un Pull Request?

## Sobre el YAML

### ¿Por qué YAML y no JSON?

Me parece muchísimo más frágil: un espacio de más y todo se rompe.
¿Hay alguna forma de comprobar que está bien escrito antes de subirlo?

### ¿Por qué la indentación importa tanto?

Vengo de JavaScript, donde puedo indentar como quiera. Aquí un espacio cambia el
significado. ¿Cómo evito equivocarme?

### Me pasó que un texto con dos puntos rompió el archivo, ¿por qué?

Escribí `run: echo "DRY RUN: no se aplica..."` y el YAML dejó de ser válido.
¿Qué otras cosas rompen un YAML sin avisar? ¿Comillas? ¿Almohadillas?

### ¿Qué son las `${{ }}` y de dónde salen `github`, `inputs` o `secrets`?

¿Es un lenguaje de plantillas propio de GitHub? ¿Dónde veo todo lo que hay disponible?

## Tarea 1 | Hello World

### ¿Por qué un job necesita `actions/checkout` y el otro no?

Creo que lo he entendido: la máquina está vacía y hay que descargar el código.
Pero entonces, ¿cada job descarga el repositorio por su cuenta? ¿No es un desperdicio
hacerlo 6 veces?

### ¿Los jobs comparten archivos entre ellos?

Si un job construye algo, ¿el siguiente lo ve? Por lo visto no, y me parece raro.

### ¿Por qué `ubuntu-24.04` y no `ubuntu-latest`?

Entiendo que "latest" puede cambiar. Pero si fijo la versión, ¿no me quedaré
anticuado sin enterarme?

### ¿Qué es una "action" y qué significa la `@v6` del final?

`actions/checkout@v6`. ¿Es código de otra persona que se ejecuta en mi máquina?
¿Eso no es peligroso?

## Tarea 2 | Inputs

### ¿Por qué es peligroso escribir `${{ inputs.reason }}` dentro de un `run`?

Esta es la parte que más me ha impresionado del ejercicio y la que menos entiendo.
¿De verdad alguien podría ejecutar comandos en la máquina de GitHub escribiendo
texto en un formulario? ¿Cómo funciona ese ataque?

### ¿Y por qué pasarlo por `env` lo arregla?

Si el valor acaba llegando al mismo sitio, ¿qué cambia?

### ¿Por qué comparo `inputs.dry_run == false` si es un booleano?

He leído que a veces llega como texto `"false"`. ¿En qué casos es booleano de verdad
y en cuáles texto?

### ¿Dentro de un `if` no hacen falta las llaves `${{ }}`?

He visto las dos formas en internet. ¿Son equivalentes?

## Tarea 3 | Cron

### ¿Por qué la hora es UTC y no la mía?

Si quiero que se ejecute a las 9 de la mañana en España, ¿tengo que calcular a mano
la diferencia? ¿Y en verano cambia?

### ¿Por qué GitHub no garantiza la hora exacta?

¿Cuánto se puede retrasar? ¿Y si nunca llega a ejecutarse?

### ¿Qué pasa con los workflows programados en un repositorio que nadie toca?

He leído que GitHub los desactiva pasado un tiempo. ¿Es verdad?

### ¿Puedo tener `schedule` y `workflow_dispatch` a la vez?

Lo hemos dejado así para poder probarlo. ¿Es mala práctica dejarlo en producción?

## Tarea 4 | Eventos

### ¿Qué es `secrets.GITHUB_TOKEN` y quién lo crea?

Yo no he configurado ningún token. ¿De dónde sale? ¿Caduca?

### ¿Por qué hay que pedir permisos explícitamente con `permissions: issues: write`?

Si es mi repositorio y mi workflow, ¿por qué no tiene permiso para todo?

### ¿Qué significa "pedir lo mínimo imprescindible"?

¿Qué podría pasar si diera permisos de escritura para todo?

### ¿Cómo sé qué datos hay dentro de `github.event`?

`github.event.issue.number`, `github.event.comment.body`... ¿Cambia según el evento?
¿Hay alguna forma de ver el objeto entero para explorarlo?

### ¿Por qué se comprueba a la vez `event_name == 'issues'` y `event.action == 'opened'`?

¿No basta con el segundo? El comentario menciona que los PR también tienen un
"opened". ¿Cuántos eventos comparten nombres así?

## Tarea 5 | El pipeline de CI

### ¿Los jobs se ejecutan en paralelo por defecto?

Entonces, ¿`needs` es lo que los pone en fila? ¿Puedo hacer cadenas largas?

### ¿Por qué el build espera a los tests?

Si el build es rápido, ¿no da igual ejecutarlo siempre? El comentario habla de
ahorrar minutos de CI. ¿De verdad se paga por eso?

### Si un test falla, ¿el job de build aparece como fallido o como saltado?

¿Y cómo lo distingo mirando la pestaña Actions?

### ¿Por qué hay que repetir `checkout` y la composite action en los 6 jobs?

Sigue habiendo mucha repetición. ¿No hay forma de decir "esto para todos los jobs"?

### ¿Qué es `working-directory` y por qué hace falta aquí?

Porque el monorepo no está en la raíz del repo, ¿verdad? ¿Se puede poner una vez
para todo el job en vez de en cada step?

## Tarea 6 | La composite action

### ¿Qué es una "composite action" exactamente?

¿Es como una función que agrupa pasos? ¿Puedo publicarla para que la use otra gente?

### ¿Por qué hay que poner `shell: bash` aquí y en un workflow normal no?

Y lo peor: si me olvido, el archivo ni siquiera carga. ¿Por qué no avisa mejor?

### ¿Qué diferencia hay entre `pnpm install` y `pnpm install --frozen-lockfile`?

¿Qué es un lockfile y por qué es tan importante en CI?

### ¿Qué pasa si no tengo el `pnpm-lock.yaml` subido al repo?

¿El workflow falla directamente? ¿Debería subirlo aunque sea un archivo enorme?

### ¿Qué es la "caché" de `actions/setup-node` y qué guarda exactamente?

¿Los `node_modules`? ¿Dónde se guarda eso entre ejecuciones si la máquina es nueva?

### ¿Por qué `run_install: false` y luego instalar aparte?

¿Qué ganamos separando los dos pasos?

### ¿Por qué `default: '24'` va entre comillas?

El comentario dice que si no, YAML lo leería como número. ¿Y qué problema hay con eso?

## Tarea 7 | La matriz

### ¿La matriz crea un job por combinación? ¿6 máquinas a la vez?

¿Eso no consume muchísimo? ¿Merece la pena para un proyecto pequeño?

### ¿Qué es `fail-fast` y por qué se pone en `false`?

Entiendo que así todas terminan. Pero, ¿no es un desperdicio dejar que corran las
demás si ya sé que algo va mal?

### ¿Por qué Windows da problemas con las rutas y los comandos?

¿Es por las barras `\` en vez de `/`? ¿Y por qué `shell: bash` lo arregla?

## Sobre la ubicación de los archivos

### Si GitHub solo lee `.github/` de la raíz, ¿estos workflows se ejecutan?

Están dentro de `12-ejercicio-cicd/.github/`, que es lo que pide el enunciado.
¿Entonces solo sirven como ejercicio y no se van a ejecutar nunca de verdad?
¿Debería copiarlos a la raíz para verlos funcionar?
