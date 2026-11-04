import BackButton from '../../components/common/BackButton'

export default function NotificacionesPage() {

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <BackButton fallback="/" />

        <section>
          <h1 className="text-3xl font-semibold text-stone-800">
            Notificaciones
          </h1>
          <p className="mt-2 text-sm text-stone-600">
            Avisos mock de tus pedidos y pagos (temporal, sin backend).
          </p>
        </section>

        <div className="rounded-xl border border-dashed border-stone-300 bg-white p-8 text-center">
          <p className="text-lg font-semibold text-stone-800">
            Sin notificaciones
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-stone-600">
            No tienes avisos por ahora. Te notificaremos cuando haya novedades.
          </p>
        </div>
      </div>
    </main>
  )
}
