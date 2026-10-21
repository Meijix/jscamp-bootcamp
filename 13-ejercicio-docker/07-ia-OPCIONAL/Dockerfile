# =========================================================
# TAREA 7 (OPCIONAL): Docker con IA local
# =========================================================
# Una app Flask (Python) que habla con un modelo de IA que corre
# en tu propio ordenador a través de Docker Model Runner.
#
#   docker model pull ai/smollm2
#   docker build -t midu-ia .
#   docker run --rm -p 5000:5000 --name midu-ia midu-ia
#   curl "http://localhost:5000/ask?q=What+is+a+Docker+container"
#
# Fíjate en que la estructura es IDÉNTICA a la del Dockerfile de
# Node de la tarea 3, solo cambian los comandos. Docker funciona
# igual sea cual sea el lenguaje: esa es toda su gracia.
# =========================================================

# "slim" es la versión ligera de la imagen oficial de Python:
# trae lo justo para ejecutar Python, sin compiladores ni extras.
FROM python:3.12-slim

WORKDIR /app

# Mismo truco de caché que con package.json en Node:
# copio primero la lista de dependencias, y el código después.
# Así, al editar app.py no se reinstalan las librerías.
COPY requirements.txt .

# ---------------------------------------------------------
# --no-cache-dir evita que pip guarde una copia de cada paquete
# descargado en /root/.cache/pip.
#
# En tu ordenador esa caché es útil (reinstalar va más rápido),
# pero dentro de una imagen es peso muerto: nunca vas a volver a
# instalar nada ahí. Quitarla ahorra bastantes MB.
# ---------------------------------------------------------
RUN pip install --no-cache-dir -r requirements.txt

COPY app.py .

# Flask escucha por defecto en el 5000
EXPOSE 5000

CMD ["python", "app.py"]
