/**
 * Detección segura de "entrada previa dentro del SPA" para el botón Volver.
 *
 * React Router v7 con BrowserRouter deja `history.state.idx` en null, y
 * `history.length > 1` también cuenta pestañas entradas desde otro sitio
 * (WhatsApp, Google): con esas señales, Volver podía salir de la app.
 *
 * La solución: registrar la clave (location.key) de la PRIMERA entrada que
 * ve la app y compararla con la actual. Si son distintas, el router empujó
 * al menos una entrada más y navigate(-1) es seguro; si son iguales, es la
 * entrada de carga (directa o desde un enlace externo) y se usa el fallback.
 */
let claveInicial: string | null = null

/** Registra la primera entrada (idempotente: solo el primer registro vale). */
export function marcarEntradaInicial(clave: string): void {
  if (claveInicial === null) {
    claveInicial = clave
  }
}

/** true si hay al menos una entrada del SPA antes de la actual. */
export function hayEntradaPreviaSpa(claveActual: string): boolean {
  return claveInicial !== null && claveActual !== claveInicial
}
