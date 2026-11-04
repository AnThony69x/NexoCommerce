import { Link } from 'react-router-dom'
import BackButton from '../components/common/BackButton'

export default function NotFoundPage() {
  return (
    <main className="min-h-[calc(100vh-17rem)] bg-stone-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <BackButton fallback="/" />

        <section className="rounded-xl border border-stone-200 bg-white p-6 text-center sm:p-10">
          <p className="text-6xl font-semibold tracking-tight text-stone-800">
            404
          </p>
          <h1 className="mt-3 text-2xl font-semibold text-stone-800">
            Página no encontrada
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-stone-600">
            La ruta que intentas visitar no existe o fue movida. Revisa la
            dirección o vuelve a un lugar seguro.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/"
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-stone-800 px-5 py-3 text-sm font-medium text-white hover:bg-stone-700"
            >
              Volver al inicio
            </Link>
            <BackButton fallback="/" />
          </div>
        </section>
      </div>
    </main>
  )
}
