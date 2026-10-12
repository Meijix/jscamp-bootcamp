/* =========================================================
   PRIMERA PARTE: Configurar React Router
   =========================================================
   main.jsx es el punto de entrada: aquí React se "engancha"
   al HTML de index.html.
   ========================================================= */

import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'

import './index.css'
import App from './App.jsx'

/*
  Envuelvo <App /> con <BrowserRouter>.

  ¿Por qué es necesario? Porque BrowserRouter es un "proveedor de
  contexto": mete la información de la URL en un sitio al que pueden
  acceder TODOS los componentes de dentro, por muy profundos que estén.

  Si me olvidara de esto, cualquier hook de React Router (useNavigate,
  useParams, useSearchParams...) daría error al usarse.

  "Browser" porque usa la History API del navegador (URLs limpias
  tipo /search). Existe también HashRouter, que usa /#/search, para
  servidores que no saben manejar rutas.
*/
createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
)
