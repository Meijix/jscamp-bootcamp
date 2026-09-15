/* =========================================================
   App.jsx - el componente raíz
   =========================================================
   rutas y componentes
   ========================================================= */

import { Header } from './components/Header.jsx'
import { Footer } from './components/Footer.jsx'
import { Route } from './components/Route.jsx'
import { useRouter } from './hooks/useRouter.jsx'

import { HomePage } from './pages/Home.jsx'
import { SearchPage } from './pages/Search.jsx'
import { NotFoundPage } from './pages/404.jsx'

// Lista de rutas que SÍ existen. La uso abajo para detectar el 404.
const RUTAS_VALIDAS = ['/', '/search']

function App() {
  // la App se REPINTA cuando cambia la ruta
  const { currentPath } = useRouter()

  return (
    /*
      <> </> es un FRAGMENT.
      Para devolver varios elementos.
    */
    <>
      {}
      <Header />

      {/*
        Cada Route comprueba por su cuenta si su path coincide con
        la URL. Solo se pinta la que coincide; las demás devuelven null.
      */}
      <Route path="/" component={HomePage} />
      <Route path="/search" component={SearchPage} />

      {/*
        Para el 404 no puedo usar <Route> (no hay un path concreto
        que coincida). Compruebo si la ruta actual NO está en mi lista.
        includes() devuelve true si el array contiene ese valor.
      */}
      {!RUTAS_VALIDAS.includes(currentPath) && <NotFoundPage />}

      <Footer />
    </>
  )
}

export default App
