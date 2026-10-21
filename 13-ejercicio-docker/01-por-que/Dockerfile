# =========================================================
# TAREA 1: "En mi máquina funciona"
# =========================================================
# Este Dockerfile demuestra el problema que Docker viene a resolver.
#
# app.js usa structuredClone (Node 17+) y findLast (Node 18+).
# Cambiando UNA SOLA LÍNEA de este archivo, el mismo código pasa
# de funcionar a petar. Y no hace falta tocar nada de tu ordenador.
#
# Pruébalo:
#   docker build -t por-que-node22 .
#   docker run --rm por-que-node22          -> ✅ ¡Todo funcionó!
#
#   (cambia el FROM de abajo a node:16-alpine)
#   docker build -t por-que-node16 .
#   docker run --rm por-que-node16          -> ❌ ReferenceError
# =========================================================

# FROM es SIEMPRE la primera instrucción: define la imagen base,
# el "sistema operativo + herramientas" sobre el que se construye
# todo lo demás.
#
# node:22-alpine = Node 22 sobre Alpine Linux.
# Alpine es una distribución minúscula (unos 5 MB frente a los
# ~380 MB de la imagen de Debian). Menos peso = descargas más
# rápidas y menos programas instalados que puedan tener fallos
# de seguridad.
#
# 👉 Cambia esta línea a "node:16-alpine" para ver el error.
FROM node:22-alpine

# WORKDIR crea la carpeta (si no existe) y se mete dentro.
# Todo lo que venga después (COPY, RUN, CMD) parte de aquí.
#
# ¿Por qué no trabajar en la raíz "/"? Porque se mezclaría tu
# código con los archivos del sistema. /app es la convención.
WORKDIR /app

# COPY <origen> <destino>
#   origen  -> ruta en TU ordenador (relativa al "contexto de build",
#              que es el "." del final del comando docker build)
#   destino -> ruta DENTRO de la imagen
#
# El "." de destino significa "el WORKDIR actual", o sea /app.
COPY app.js .

# CMD es el comando que se ejecuta al ARRANCAR el contenedor
# (no al construir la imagen: eso es RUN).
#
# Uso la forma de array ["node", "app.js"] y no el texto suelto
# "node app.js". Es la llamada "exec form" y es la recomendada:
# ejecuta el programa directamente, sin meter una shell por medio.
# Así el proceso de Node es el PID 1 y recibe bien las señales de
# parada (docker stop) en vez de quedarse colgado.
CMD ["node", "app.js"]
