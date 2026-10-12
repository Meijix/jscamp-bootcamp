/* =========================================================
   TAREA 1: Conexión a la base de datos
   =========================================================
   SQLite es una base de datos que vive en UN SOLO ARCHIVO
   (aquí, jobs.db). No hay que instalar ni arrancar ningún servidor:
   es perfecta para aprender y para proyectos pequeños.

   better-sqlite3 es la librería más usada para hablar con SQLite
   desde Node. Su particularidad es que es SÍNCRONA: no hace falta
   await. Puede sonar raro, pero al ser un archivo local es tan
   rápido que usar promesas solo añadiría complicación.
   ========================================================= */

import Database from 'better-sqlite3'
import { join } from 'node:path'

/*
  Construyo la ruta del archivo a partir de la carpeta actual.

  import.meta.dirname es la carpeta donde está ESTE archivo (db/).
  Con "..", subo un nivel para dejar el jobs.db en la raíz del proyecto.

  ¿Por qué no poner 'jobs.db' a secas? Porque las rutas relativas se
  resuelven desde donde EJECUTAS el comando, no desde donde está el
  archivo. Si lanzaras el servidor desde otra carpeta, te crearía
  una base de datos nueva y vacía sin avisarte.
*/
const rutaBaseDeDatos = join(import.meta.dirname, '..', 'jobs.db')

/*
  Abre el archivo. Si no existe, lo crea vacío.
*/
export const db = new Database(rutaBaseDeDatos)

/* ---------------------------------------------------------
   PRAGMAS: ajustes de configuración de SQLite
   --------------------------------------------------------- */

/*
  WAL = Write-Ahead Logging.

  Por defecto, SQLite bloquea todo el archivo mientras alguien
  escribe, así que nadie puede leer a la vez. Con WAL, las escrituras
  se apuntan en un archivo aparte y las lecturas siguen funcionando
  mientras tanto.

  En un servidor web, donde llegan varias peticiones a la vez,
  esto mejora bastante el rendimiento.
*/
db.pragma('journal_mode = WAL')

/*
  ⚠️ Este es importante y mucha gente no lo sabe:
  SQLite IGNORA las claves foráneas por defecto (por compatibilidad
  con versiones antiguas).

  Sin esta línea, podrías insertar una tecnología apuntando a un job
  que no existe, o borrar un job y dejar sus tecnologías huérfanas.
  El ON DELETE CASCADE del seed tampoco funcionaría.
*/
db.pragma('foreign_keys = ON')
