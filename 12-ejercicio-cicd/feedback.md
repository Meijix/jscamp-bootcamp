# Feedback — Ejercicio 12: CI/CD con GitHub Actions

Muy buen trabajo. Antes de tocar nada comprobé el baseline: los seis comandos que corre el pipeline (`lint` y `test` de frontend y de backend, más los dos `build`) pasan en verde en local, el `pnpm-lock.yaml` está commiteado y en sincronía, y los seis archivos de `.github/` parsean sin errores. Las explicaciones dentro de los YAML son lo que más valoro de la entrega: se nota que entendiste el por qué y no solo el qué.

Dejé cuatro ajustes en el código, todos chicos:

- **La matriz ahora llama a la action sin caché** (`05-ci.yml` + `action.yml`). La Tarea 7 lo pedía explícitamente y no había forma de lograrlo: el `cache: 'pnpm'` estaba escrito dentro de la composite action y el caller no lo podía apagar. Agregué un input `cache` (por defecto `'true'`, así los otros seis jobs no cambian) y la matriz pasa `'false'`.
- **Corregí el comentario del boolean en `02-manual.yml`**. Decía que el input llega como el texto `"true"`/`"false"` y que por eso había que compararlo entre comillas, pero el código compara contra el booleano `false` (que es lo correcto). El detalle fino: `inputs.*` conserva el tipo, `github.event.inputs.*` convierte todo a texto. La explicación completa quedó en `dudas.md`.
- **`04-events.yml` ya no interpola `${{ github.repository }}` dentro del `run`**. No era explotable (ese valor no lo controla un atacante), pero el archivo predica "ningún `${{ }}` dentro de un `run`" y después lo hacía. Se lo pasé por `env` como el resto.
- Aclaré por qué las actions invocadas con `uses` no necesitan `shell`, que era la duda implícita en `action.yml`.

Y una cosa que no es un bug, pero que conviene tener clarísima: **tal como está, ninguno de estos workflows se ejecuta**. GitHub solo lee `.github/workflows/` en la raíz del repositorio, así que los seis archivos de `12-ejercicio-cicd/.github/` no aparecen ni en la pestaña Actions. Es la ubicación que pide el enunciado, así que está bien dejarlos ahí; pero si querés verlos correr, copiá la carpeta `.github/` **completa** a la raíz del repo: las rutas del código (`working-directory: 12-ejercicio-cicd` y `uses: ./.github/actions/setup-pnpm-ci-cd`) ya están escritas para esa copia y funcionan sin tocar nada.

Las 41 dudas quedaron respondidas en `dudas.md`. Hay unas cuantas que valen más que el ejercicio en sí: la de la inyección de comandos, la de los dos contextos de inputs y la de la matriz versus el costo en minutos de macOS.

Cualquier cosa, acá estoy. Un saludo!
