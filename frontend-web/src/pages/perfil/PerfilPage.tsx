import BackButton from '../../components/common/BackButton'
import { useAuth } from '../../hooks/useAuth'

export default function PerfilPage() {
  const { user } = useAuth()

  // Protegida por ProtectedRoute: sin usuario no se renderiza contenido.
  if (!user) {
    return null
  }

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <BackButton fallback="/" />

        <section>
          <h1 className="text-3xl font-semibold text-stone-800">Mi perfil</h1>
          <p className="mt-2 text-sm text-stone-600">
            Datos de tu cuenta.
          </p>
        </section>

        <dl className="rounded-2xl border border-stone-200 bg-white p-6 text-sm">
          <div className="flex justify-between gap-4 border-b border-stone-100 py-3">
            <dt className="text-stone-500">Nombre completo</dt>
            <dd className="font-medium text-stone-800">{user.nombre_completo}</dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-stone-100 py-3">
            <dt className="text-stone-500">Correo</dt>
            <dd className="font-medium text-stone-800">{user.correo}</dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-stone-100 py-3">
            <dt className="text-stone-500">Teléfono</dt>
            <dd className="font-medium text-stone-800">
              {user.telefono ?? '—'}
            </dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-stone-100 py-3">
            <dt className="text-stone-500">Rol</dt>
            <dd className="font-medium text-stone-800">{user.role}</dd>
          </div>
          <div className="flex justify-between gap-4 py-3">
            <dt className="text-stone-500">Correo verificado</dt>
            <dd className="font-medium text-stone-800">
              {user.correo_verificado ? 'Sí' : 'No'}
            </dd>
          </div>
        </dl>
      </div>
    </main>
  )
}
