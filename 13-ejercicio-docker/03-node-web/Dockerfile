# =========================================================
# TAREA 3: Una app real con Node.js y buenas prácticas
# =========================================================
#   docker build -t midu-web .
#   docker run --rm -p 3000:3000 --name midu-web midu-web
#   curl http://localhost:3000/
# =========================================================

FROM node:22-alpine

WORKDIR /app

# ---------------------------------------------------------
# ⚠️ EL PASO MÁS IMPORTANTE DE TODO EL DOCKERFILE:
# copiar SOLO los manifiestos antes que el código.
#
# ¿Por qué no hacer un "COPY . ." directamente y ya está?
#
# Porque Docker cachea capa a capa y la caché se invalida en
# cuanto cambia algo de esa capa. Si copiara todo de golpe:
#
#   COPY . .          <- cambio una coma de server.js -> capa nueva
#   RUN npm ci        <- como la capa anterior cambió, se reinstala
#                        TODO otra vez. 2 minutos por cada cambio.
#
# Copiando primero solo los manifiestos, la capa del npm ci solo
# se invalida cuando cambian las DEPENDENCIAS (que es casi nunca).
# Editar server.js pasa a costar 1 segundo en vez de 2 minutos.
#
# El asterisco de package*.json coge package.json y package-lock.json
# de una vez.
# ---------------------------------------------------------
COPY package*.json ./

# ---------------------------------------------------------
# ¿npm ci o npm install?
#
#   npm install -> puede ACTUALIZAR versiones y modificar el
#                  package-lock.json. Bien en tu portátil.
#   npm ci      -> instala EXACTAMENTE lo que dice el lockfile,
#                  ni una versión más nueva. Y borra node_modules
#                  antes, así que siempre parte de cero.
#
# En Docker y en CI se usa siempre "ci": queremos que la imagen
# de hoy y la de dentro de seis meses sean idénticas.
# ---------------------------------------------------------
RUN npm ci --omit=dev

# Ahora sí, el resto del código. Va DESPUÉS del npm ci a propósito
# (ver el razonamiento de la caché de arriba).
COPY . .

# ---------------------------------------------------------
# EXPOSE es solo DOCUMENTACIÓN. No abre ningún puerto.
#
# Sirve para que quien lea el Dockerfile (o use la imagen) sepa
# por dónde escucha la app. Para poder entrar de verdad desde fuera
# hay que publicar el puerto al ejecutar: -p 3000:3000
# ---------------------------------------------------------
EXPOSE 3000

# ---------------------------------------------------------
# USER: ejecutar como usuario SIN privilegios.
#
# Por defecto, todo dentro de un contenedor corre como root.
# Si alguien encontrara un fallo en tu app, tendría permisos de
# administrador dentro del contenedor, lo que le facilita mucho
# el siguiente paso del ataque.
#
# Las imágenes oficiales de Node ya traen creado un usuario "node",
# así que solo hay que decir que se use.
#
# Ojo al ORDEN: el USER va DESPUÉS del npm ci. Si lo pusiera antes,
# el usuario "node" no tendría permisos para escribir en /app y la
# instalación fallaría.
# ---------------------------------------------------------
USER node

CMD ["node", "server.js"]
