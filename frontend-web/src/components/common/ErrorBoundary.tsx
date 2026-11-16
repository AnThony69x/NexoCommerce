import { Component, type ErrorInfo, type ReactNode } from 'react'

type Props = { children: ReactNode }
type State = { error: Error | null }

/**
 * Contenedor de errores de render (raíz de la app, en main.tsx).
 *
 * Sin esto, cualquier excepción durante el render desmonta toda la app y el
 * usuario ve una pantalla en blanco sin explicación ni forma de recuperarse.
 * Aquí se muestra un mensaje con la opción de recargar; el detalle completo
 * se imprime en consola para depuración.
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[NexoCommerce] Error de render:', error, info.componentStack)
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children

    return (
      <main className="flex min-h-screen items-center justify-center bg-stone-50 px-4">
        <section
          role="alert"
          className="w-full max-w-md rounded-xl border border-rose-200 bg-white p-8 text-center"
        >
          <h1 className="text-xl font-semibold text-stone-800">
            Algo salió mal
          </h1>
          <p className="mt-3 text-sm leading-6 text-stone-600">
            La aplicación encontró un error inesperado. Puedes reintentar o
            recargar la página; si persiste, vuelve más tarde.
          </p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => this.setState({ error: null })}
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-stone-800 px-5 py-3 text-sm font-medium text-white hover:bg-stone-700"
            >
              Reintentar
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-stone-300 px-5 py-3 text-sm font-medium text-stone-700 hover:border-stone-500"
            >
              Recargar página
            </button>
          </div>
          {import.meta.env.DEV && (
            <p className="mt-4 break-words rounded-lg bg-stone-100 p-3 text-left font-mono text-xs text-stone-500">
              {error.message}
            </p>
          )}
        </section>
      </main>
    )
  }
}
