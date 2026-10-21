# =========================================================
# TAREA 6: Volúmenes y bind mounts
# =========================================================
# La gracia de esta tarea no está en el Dockerfile (es muy simple)
# sino en CÓMO se ejecuta el contenedor.
# =========================================================

FROM node:22-alpine

WORKDIR /app

COPY server.js .

EXPOSE 3000

# ---------------------------------------------------------
# PASO 4 DEL ENUNCIADO: cambio "node" por "node --watch".
#
# --watch hace que Node se reinicie solo cuando cambia un archivo
# (es lo que antes había que instalar con nodemon; desde Node 18
# viene incluido).
#
# ¿Y de qué sirve dentro de un contenedor, si el código está
# "congelado" dentro de la imagen? De nada... a menos que uses un
# BIND MOUNT, que es justo lo que hace el paso 4:
#
#   docker run --rm -p 3000:3000 \
#     -v "$(pwd)/06-volumenes:/app" \
#     --name midu-visitas midu-visitas
#
# El bind mount "enchufa" una carpeta de tu ordenador dentro del
# contenedor. Editas server.js en tu editor, el contenedor lo ve al
# instante y --watch reinicia Node. Eso es hot reload.
# ---------------------------------------------------------
CMD ["node", "--watch", "server.js"]

# ---------------------------------------------------------
# RESUMEN DE LA TAREA (las tres situaciones):
#
# 1. SIN NADA -> los datos se pierden
#    docker run --rm -p 3000:3000 midu-visitas
#    El contador vive dentro del contenedor y muere con él.
#    Los contenedores son EFÍMEROS por diseño.
#
# 2. CON UN VOLUMEN -> los datos persisten
#    docker volume create visitas-data
#    docker run --rm -p 3000:3000 -v visitas-data:/app/data midu-visitas
#    El volumen lo gestiona Docker y vive fuera del contenedor.
#    Es la opción correcta para DATOS DE PRODUCCIÓN.
#
# 3. CON UN BIND MOUNT -> desarrollo con hot reload
#    docker run --rm -p 3000:3000 -v "$(pwd):/app" midu-visitas
#    Enchufas una carpeta tuya. Es la opción para DESARROLLO
#    (en producción no se usa: tu app quedaría atada a las rutas
#    concretas de una máquina).
# ---------------------------------------------------------
