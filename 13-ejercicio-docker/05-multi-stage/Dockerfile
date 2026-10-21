# =========================================================
# TAREA 5: Dockerfile multipaso (multi-stage)
# =========================================================
# El problema: para COMPILAR esta app hace falta esbuild (que pesa
# lo suyo) y todo el código fuente. Pero para EJECUTARLA solo hace
# falta el bundle de dist/.
#
# Un Dockerfile de una sola etapa se lo llevaría todo dentro:
# el compilador, las devDependencies y el código fuente.
# Resultado: una imagen mucho más grande y con más superficie de
# ataque de la necesaria.
#
# La solución son varias etapas: compilo en una y me llevo a la
# final SOLO el resultado.
#
#   docker build -t midu-mini .
#   docker run --rm -p 3000:3000 --name midu-mini midu-mini
# =========================================================

# =========================================================
# ETAPA 1: builder (aquí se compila)
# =========================================================
# "AS builder" le pone nombre a la etapa para poder copiar cosas
# de ella más adelante.
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./

# ---------------------------------------------------------
# Aquí instalo TODAS las dependencias, incluidas las de desarrollo.
#
# Fíjate en que NO pongo --omit=dev como en la tarea 3: esbuild
# está en devDependencies y sin él no puedo compilar.
#
# Y no pasa nada por instalarlas: esta etapa se queda en el
# ordenador de quien construye la imagen y NO viaja a la imagen final.
# ---------------------------------------------------------
RUN npm ci

COPY . .

# RUN ejecuta el comando DURANTE la construcción (a diferencia de
# CMD, que se ejecuta al arrancar el contenedor).
# Genera el bundle en /app/dist/server.js
RUN npm run build

# =========================================================
# ETAPA 2: runner (esta sí es la imagen final)
# =========================================================
# Empiezo DE CERO otra vez, con una imagen limpia.
# Todo lo que había en la etapa builder se queda atrás.
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# ---------------------------------------------------------
# ESTA es la línea clave de todo el multi-stage.
#
# COPY --from=builder coge archivos de la OTRA etapa, no de tu
# ordenador. Me traigo solo /app/dist y nada más.
#
# Lo que NO viaja a la imagen final:
#   - esbuild y el resto de devDependencies
#   - la carpeta src/ con el código fuente
#   - el package.json y el package-lock.json
#   - node_modules entero (el bundle ya lleva dentro lo que necesita)
#
# El "--chown=node:node" hace que los archivos pertenezcan al
# usuario node, para que pueda leerlos sin ser root.
# ---------------------------------------------------------
COPY --from=builder --chown=node:node /app/dist ./dist

EXPOSE 3000

# Usuario sin privilegios
USER node

# Arranco el bundle compilado, no el código fuente
CMD ["node", "dist/server.js"]

# ---------------------------------------------------------
# Para comprobarlo (paso 4 del enunciado):
#
#   docker exec -it midu-mini sh
#   ls -la /app
#
# Solo debería aparecer dist/. Ni src/, ni node_modules,
# ni package.json.
# ---------------------------------------------------------
