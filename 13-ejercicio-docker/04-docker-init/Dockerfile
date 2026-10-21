# syntax=docker/dockerfile:1

# =========================================================
# TAREA 4: `docker init` en acción
# =========================================================
# Estos tres archivos (Dockerfile, .dockerignore y compose.yaml)
# son los que genera el comando:
#
#   cd 04-docker-init
#   docker init
#
# La herramienta pregunta el lenguaje (Node), la versión, el gestor
# de paquetes y el comando de arranque, y escribe la plantilla.
#
# Merece la pena compararlo con el Dockerfile de la tarea 3, que
# escribí a mano: hace lo mismo, pero docker init añade un par de
# trucos avanzados que están muy bien explicados abajo.
# =========================================================

# La primera línea (# syntax=...) no es un comentario cualquiera:
# le dice a Docker que use la última versión del parser, que es la
# que entiende cosas como --mount. Sin ella, RUN --mount da error.

ARG NODE_VERSION=22.0.0

# "AS base" le pone nombre a esta etapa para poder referirse a ella.
FROM node:${NODE_VERSION}-alpine AS base

# Le dice a las librerías en qué modo corren.
# Muchas (Express entre ellas) desactivan avisos y cachean plantillas
# cuando ven "production", así que va bastante más rápido.
ENV NODE_ENV=production

WORKDIR /usr/src/app

# ---------------------------------------------------------
# EL TRUCO BUENO DE docker init: los "bind mounts" de build.
#
#   --mount=type=bind,source=package.json,target=package.json
#
# En vez de COPIAR los archivos a una capa de la imagen, los "asoma"
# temporalmente solo mientras dura este RUN. Cuando termina, ya no
# están en la imagen final.
#
# Ventaja: el package.json y el lockfile no dejan una capa propia,
# así que la imagen queda algo más pequeña.
#
#   --mount=type=cache,target=/root/.npm
#
# Este es aún mejor: guarda la caché de descargas de npm ENTRE
# builds distintos. La primera vez descarga; las siguientes,
# aunque cambien las dependencias, reutiliza lo que ya bajó.
# ---------------------------------------------------------
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev

# Usuario sin privilegios (mismo motivo que en la tarea 3)
USER node

# El código sí se copia de verdad: tiene que quedarse en la imagen
COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
