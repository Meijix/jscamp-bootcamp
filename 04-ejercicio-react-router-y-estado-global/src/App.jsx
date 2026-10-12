/* =========================================================
   PRIMERA + CUARTA PARTE: rutas con React Router y lazy loading
   ========================================================= */

import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router'

import { Header } from './components/Header.jsx'
import { Footer } from './components/Footer.jsx'

/* ---------------------------------------------------------
   CUARTA PARTE: Carga diferida (lazy loading)
   ---------------------------------------------------------
   Antes: import { HomePage } from './pages/Home.jsx'
   -> Vite metía TODAS las páginas en un único archivo .js gigante,
      así que al entrar en la home ya te descargabas el código de
      Search y de Detail aunque no fueras a visitarlas.

   Ahora, con lazy(), Vite crea un archivo .js aparte por página y
   solo lo descarga cuando el usuario navega ahí de verdad.
   Se nota muchísimo en la pestaña Coverage de las DevTools.

   Detalle: lazy() necesita un import() DINÁMICO (con paréntesis),
   que devuelve una promesa. Y espera un "export default", por eso
   uso .then() para convertir mi export nombrado en uno por defecto.
   --------------------------------------------------------- */
const HomePage = lazy(() =>
  import('./pages/Home.jsx').then((modulo) => ({ default: modulo.HomePage }))
)
const SearchPage = lazy(() =>
  import('./pages/Search.jsx').then((modulo) => ({ default: modulo.SearchPage }))
)
const DetailPage = lazy(() =>
  import('./pages/Detail.jsx').then((modulo) => ({ default: modulo.DetailPage }))
)
const NotFoundPage = lazy(() =>
  import('./pages/404.jsx').then((modulo) => ({ default: modulo.NotFoundPage }))
)

function App() {
  return (
    <>
      <Header />

      {/*
        Suspense es el "mientras tanto" de React.
        Como las páginas ahora tardan un momento en descargarse,
        React necesita saber qué pintar durante esa espera.
        Eso es el fallback. Sin Suspense, lazy() daría error.
      */}
      <Suspense fallback={<p style={{ textAlign: 'center', padding: '2rem' }}>Cargando...</p>}>
        {/*
          <Routes> mira la URL actual y pinta SOLO la <Route> que
          mejor coincida. Es más listo que el Route que hicimos a mano
          en el ejercicio 03: aquí no hay que preocuparse por el orden.
        */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />

          {/*
            SEGUNDA PARTE: ruta dinámica.
            Los dos puntos (:id) significan "aquí va un valor variable".
            /job/abc-123 -> React Router guarda id = "abc-123"
            y lo leo dentro de la página con useParams().
          */}
          <Route path="/job/:id" element={<DetailPage />} />

          {/*
            El asterisco "*" es el comodín: coincide con CUALQUIER
            ruta que no haya encajado antes. Es el 404.
          */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>

      <Footer />
    </>
  )
}

export default App
