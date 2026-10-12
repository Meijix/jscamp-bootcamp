// @ts-check
import { test, expect } from '@playwright/test'

/* =========================================================
   TESTS E2E (End-to-End) de DevJobs
   =========================================================
   Un test E2E abre un navegador de verdad y hace lo mismo que
   haría una persona: escribir, hacer clic, leer la pantalla.
   No sabe nada de React ni de componentes: solo ve la página.

   Dos ideas clave de Playwright:

   1. AUTO-WAITING: no hay que poner esperas a mano. Cuando escribes
      await page.getByRole('button').click(), Playwright espera solo
      a que el botón exista, sea visible y se pueda pulsar. Adiós a
      los sleep(2000) que hacen los tests lentos e inestables.

   2. JERARQUÍA DE SELECTORES (de mejor a peor):
        1º getByRole   -> como lo ve un lector de pantalla
        2º getByText / getByLabel
        3º getByTestId
        4º selectores CSS (último recurso: se rompen al cambiar estilos)

      Uso getByRole siempre que puedo: si el test lo encuentra por
      su rol, es que la página es accesible. El test comprueba dos
      cosas a la vez.
   ========================================================= */

/* =========================================================
   SEGUNDO EJERCICIO: navegación básica
   ========================================================= */
test('la página principal carga y muestra el buscador', async ({ page }) => {
  /*
    '/' se convierte en http://localhost:5173/ gracias al baseURL
    que puse en playwright.config.js.
  */
  await page.goto('/')

  /*
    Un <input type="search"> tiene el rol "searchbox".
    Por eso cambié el type en el componente: para poder localizarlo
    de la forma correcta y no con un selector CSS frágil.
  */
  const buscador = page.getByRole('searchbox')

  /*
    expect(...).toBeVisible() es una aserción "con reintentos":
    Playwright lo comprueba una y otra vez durante unos segundos
    hasta que se cumple o se agota el tiempo. Por eso funciona bien
    con contenido que tarda en aparecer.
  */
  await expect(buscador).toBeVisible()
})

/* =========================================================
   TERCER EJERCICIO: búsqueda de empleos
   ========================================================= */
test('buscar por tecnología muestra resultados', async ({ page }) => {
  await page.goto('/')

  // 1. Escribo en el buscador
  await page.getByRole('searchbox').fill('React')

  /*
    2. Pulso el botón "Buscar".
    El { name: 'Buscar' } filtra por el texto accesible del botón,
    así que no me confundo con otros botones de la página.
  */
  await page.getByRole('button', { name: 'Buscar' }).click()

  /*
    3. Compruebo que hemos llegado a la página de resultados.
    La expresión regular /\/search/ busca "/search" dentro de la URL
    (no puedo comparar la URL entera porque lleva ?text=React detrás).
  */
  await expect(page).toHaveURL(/\/search/)

  /*
    4. Compruebo que aparecen resultados.
    Aquí sí uso un selector CSS porque la tarjeta de empleo no tiene
    un rol ARIA propio; es la excepción que comenta el enunciado.
    Le pongo .first() porque hay varias y expect necesita UNA sola.
  */
  const primerResultado = page.locator('.job-listing-card').first()
  await expect(primerResultado).toBeVisible()
})

/* =========================================================
   CUARTO EJERCICIO: flujo completo de aplicación
   ========================================================= */
test('flujo completo: buscar, entrar al detalle, iniciar sesión y aplicar', async ({ page }) => {
  // 1. Busco empleos de JavaScript
  await page.goto('/')
  await page.getByRole('searchbox').fill('JavaScript')
  await page.getByRole('button', { name: 'Buscar' }).click()

  // 2. Entro en el primer resultado (el título es un enlace)
  const primerResultado = page.locator('.job-listing-card').first()
  await expect(primerResultado).toBeVisible()
  await primerResultado.getByRole('link').first().click()

  /*
    3. Compruebo que estoy en el detalle.
    /\/job\// busca "/job/" en la URL. Las barras van escapadas
    con \ porque dentro de una expresión regular la barra tiene
    significado propio.
  */
  await expect(page).toHaveURL(/\/job\//)

  /*
    El h1 del detalle es el título del empleo.

    Lo busco DENTRO de <main> a propósito: el logo "DevJobs" del
    header también es un h1, así que buscar en toda la página
    encontraría dos elementos y Playwright daría error de "strict
    mode violation" (se niega a adivinar cuál quieres).
  */
  await expect(page.locator('main').getByRole('heading', { level: 1 })).toBeVisible()

  // 4. Inicio sesión (el botón está en el Header)
  await page.getByRole('button', { name: 'Iniciar sesión' }).click()

  // 5. Aplico. Antes de iniciar sesión el botón estaba deshabilitado.
  const botonAplicar = page.getByRole('button', { name: 'Aplicar', exact: true })
  await expect(botonAplicar).toBeEnabled()
  await botonAplicar.click()

  // 6. El botón debe cambiar a "Aplicado"
  await expect(page.getByRole('button', { name: 'Aplicado' })).toBeVisible()
})

/* =========================================================
   QUINTO EJERCICIO: filtros
   ========================================================= */
test('el filtro de ubicación deja solo empleos remotos', async ({ page }) => {
  await page.goto('/search')

  /*
    selectOption elige una opción del <select> por su value.
    Uso el id porque los selects no tienen un <label> visible con el
    que localizarlos por texto.
  */
  await page.locator('#filter-location').selectOption('remoto')

  // Compruebo que la URL refleja el filtro (lo pedía el ejercicio 04)
  await expect(page).toHaveURL(/type=remoto/)

  const tarjetas = page.locator('.job-listing-card')
  await expect(tarjetas.first()).toBeVisible()

  /*
    Cada tarjeta lleva data-modalidad con su modalidad.
    Recorro TODAS las visibles y compruebo una a una que son remotas.
    Con mirar solo la primera, se me colaría un fallo en la segunda.

    .all() devuelve un array con todos los elementos encontrados
    en este momento.
  */
  for (const tarjeta of await tarjetas.all()) {
    await expect(tarjeta).toHaveAttribute('data-modalidad', 'remoto')
  }
})

test('el filtro de nivel deja solo empleos senior', async ({ page }) => {
  await page.goto('/search')

  await page.locator('#filter-experience-level').selectOption('senior')
  await expect(page).toHaveURL(/level=senior/)

  const tarjetas = page.locator('.job-listing-card')
  await expect(tarjetas.first()).toBeVisible()

  for (const tarjeta of await tarjetas.all()) {
    await expect(tarjeta).toHaveAttribute('data-nivel', 'senior')
  }
})

/* =========================================================
   SEXTO EJERCICIO: paginación
   ========================================================= */
test('aparece la paginación y se puede pasar a la página siguiente', async ({ page }) => {
  /*
    Entro sin filtros: hay 34 empleos y se muestran de 5 en 5,
    así que seguro que hay varias páginas.
  */
  await page.goto('/search')

  await expect(page.locator('.job-listing-card').first()).toBeVisible()

  // 1. La paginación tiene que estar visible
  const paginacion = page.getByRole('navigation', { name: 'Paginación de resultados' })
  await expect(paginacion).toBeVisible()

  /*
    2. Me guardo el título del primer resultado ANTES de cambiar
    de página, para poder compararlo después.
    textContent() devuelve el texto que hay dentro del elemento.
  */
  const tituloPagina1 = await page.locator('.job-listing-card h3').first().textContent()

  // 3. Voy a la página siguiente
  await paginacion.getByRole('link', { name: 'Página siguiente' }).click()

  // 4. La URL ahora lleva page=2
  await expect(page).toHaveURL(/page=2/)

  /*
    5. Y los resultados tienen que ser DISTINTOS.
    not.toHaveText comprueba que el texto ya no es el mismo, y como
    es una aserción con reintentos, espera a que la API responda.
    Esto es mucho mejor que comprobar solo que la URL cambió: la URL
    puede cambiar y los resultados quedarse igual por un bug.
  */
  await expect(page.locator('.job-listing-card h3').first()).not.toHaveText(tituloPagina1 ?? '')
})

/* =========================================================
   SÉPTIMO EJERCICIO: detalle de un empleo
   ========================================================= */
test('el detalle muestra la información del empleo y permite aplicar', async ({ page }) => {
  await page.goto('/search')

  // Entro en el primer empleo de la lista
  const primerResultado = page.locator('.job-listing-card').first()
  await expect(primerResultado).toBeVisible()

  // Me guardo el título para comprobar que el detalle es EL de este empleo
  const titulo = await primerResultado.locator('h3').textContent()

  await primerResultado.getByRole('link').first().click()

  await expect(page).toHaveURL(/\/job\//)

  // El detalle enseña el mismo título que la tarjeta
  // (busco dentro de <main> porque el logo del header también es un h1)
  await expect(
    page.locator('main').getByRole('heading', { level: 1, name: titulo ?? '' })
  ).toBeVisible()

  // Y las secciones de contenido en markdown
  await expect(page.getByRole('heading', { name: 'Descripción' })).toBeVisible()

  // El botón de aplicar existe pero está bloqueado hasta iniciar sesión
  const botonAplicar = page.getByRole('button', { name: 'Aplicar', exact: true })
  await expect(botonAplicar).toBeVisible()
  await expect(botonAplicar).toBeDisabled()

  await page.getByRole('button', { name: 'Iniciar sesión' }).click()
  await botonAplicar.click()

  await expect(page.getByRole('button', { name: 'Aplicado' })).toBeVisible()
})
