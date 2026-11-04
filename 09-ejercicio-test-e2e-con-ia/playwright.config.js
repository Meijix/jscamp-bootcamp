// @ts-check
import { defineConfig, devices } from '@playwright/test'

/* =========================================================
   CONFIGURACIÓN DE PLAYWRIGHT
   =========================================================
   Documentación: https://playwright.dev/docs/test-configuration
   ========================================================= */

export default defineConfig({
  // Carpeta donde Playwright busca los archivos *.spec.js
  testDir: './tests',

  /*
    fullyParallel: ejecuta todos los tests a la vez en pestañas
    distintas. Es mucho más rápido, pero obliga a que los tests
    sean independientes entre sí (cada uno hace su propio page.goto).
  */
  fullyParallel: true,

  // En CI, prohíbe subir un test marcado con .only (se olvida muy fácil)
  forbidOnly: !!process.env.CI,

  /*
    Reintentos solo en CI. Los tests E2E fallan de vez en cuando por
    cosas de red o de tiempos, y reintentar evita falsas alarmas.
    En local prefiero 0 para enterarme de los tests inestables.
  */
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: 'html',

  use: {
    /*
      baseURL me deja escribir page.goto('/') en vez de la URL entera
      en cada test. Si mañana cambia el puerto, lo toco solo aquí.
    */
    baseURL: 'http://localhost:5173',

    /*
      trace guarda una grabación paso a paso (con capturas del DOM)
      cuando un test falla. Se abre con `npx playwright show-trace` y es
      LO MEJOR para depurar E2E: ves exactamente qué había en pantalla
      en cada momento.

      Ojo con 'on-first-retry': esa opción graba en el primer reintento,
      y en local reintentos es 0, así que NUNCA dejaría un trace justo
      cuando estás depurando. En local uso 'retain-on-failure', que graba
      siempre y solo guarda el del test que falla. En CI sigo con
      'on-first-retry' para no llenar el disco: allí los reintentos sí
      existen.
    */
    trace: process.env.CI ? 'on-first-retry' : 'retain-on-failure',
  },

  /*
    webServer arranca la app de React automáticamente antes de los
    tests y la cierra al terminar. Así no hay que acordarse de tener
    otra terminal abierta con `npm run dev`.

    reuseExistingServer: si ya la tienes levantada, la reutiliza en
    vez de dar error de "puerto ocupado".
  */
  webServer: {
    command: 'npm run dev',
    cwd: '../04-ejercicio-react-router-y-estado-global',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
})
