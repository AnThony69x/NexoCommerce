import { useState } from 'react'
import { useForm } from 'react-hook-form'
import AccountNav from '../../components/account/AccountNav'
import BackButton from '../../components/common/BackButton'
import PasswordInput from '../../components/common/PasswordInput'
import { useAuth } from '../../hooks/useAuth'
import { ApiError } from '../../types/api'
import { reglaTelefono } from '../../utils/validation'

/** Etiquetas legibles para el rol (el enum no se muestra crudo). */
const ETIQUETA_ROL: Record<string, string> = {
  ADMIN: 'Administrador',
  CLIENTE: 'Cliente',
}

type PerfilFormData = {
  nombreCompleto: string
  telefono: string
}

type PasswordFormData = {
  passwordActual: string
  passwordNueva: string
  passwordNuevaConfirmacion: string
}

export default function PerfilPage() {
  const { user, actualizarPerfil, cambiarPassword, reenviarVerificacion } =
    useAuth()
  const [editando, setEditando] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [verificando, setVerificando] = useState(false)
  const [cambiandoClave, setCambiandoClave] = useState(false)

  const {
    register: registerPerfil,
    handleSubmit: enviarPerfil,
    reset: resetPerfil,
    formState: { errors: erroresPerfil },
  } = useForm<PerfilFormData>({
    defaultValues: {
      nombreCompleto: user?.nombre_completo ?? '',
      telefono: user?.telefono ?? '',
    },
  })

  const {
    register: registerClave,
    handleSubmit: enviarClave,
    reset: resetClave,
    getValues: getValoresClave,
    formState: { errors: erroresClave },
  } = useForm<PasswordFormData>()

  // Protegida por ProtectedRoute: sin usuario no se renderiza contenido.
  if (!user) {
    return null
  }

  async function guardarPerfil(datos: PerfilFormData) {
    setGuardando(true)
    setError(null)
    setMensaje(null)
    try {
      await actualizarPerfil({
        nombre_completo: datos.nombreCompleto,
        telefono: datos.telefono.trim() ? datos.telefono.trim() : null,
      })
      setMensaje('Tus datos quedaron actualizados.')
      setEditando(false)
    } catch (falla) {
      setError(
        falla instanceof ApiError
          ? falla.message
          : 'No se pudieron guardar tus datos.',
      )
    } finally {
      setGuardando(false)
    }
  }

  async function guardarClave(datos: PasswordFormData) {
    setCambiandoClave(true)
    setError(null)
    setMensaje(null)
    try {
      await cambiarPassword(datos.passwordActual, datos.passwordNueva)
      setMensaje('Tu contraseña se actualizó correctamente.')
      resetClave()
    } catch (falla) {
      setError(
        falla instanceof ApiError
          ? falla.message
          : 'No se pudo cambiar la contraseña.',
      )
    } finally {
      setCambiandoClave(false)
    }
  }

  async function reenviarCodigo() {
    setVerificando(true)
    setError(null)
    setMensaje(null)
    try {
      await reenviarVerificacion()
      setMensaje(
        'Te enviamos un código nuevo a tu correo. Revisa también la carpeta de spam.',
      )
    } catch (falla) {
      setError(
        falla instanceof ApiError
          ? falla.message
          : 'No se pudo reenviar el código.',
      )
    } finally {
      setVerificando(false)
    }
  }

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <BackButton fallback="/" />

        <div>
          <h1 className="text-3xl font-semibold text-stone-800">Mi perfil</h1>
          <p className="mt-2 text-sm text-stone-600">
            Tus datos de cuenta y cómo los usamos para tus pedidos.
          </p>
        </div>

        <AccountNav />

        {error && (
          <p
            role="alert"
            className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
          >
            {error}
          </p>
        )}
        {mensaje && (
          <p
            role="status"
            className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
          >
            {mensaje}
          </p>
        )}

        {!user.correo_verificado && (
          <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <div className="max-w-md">
              <h2 className="text-sm font-semibold text-amber-900">
                Tu correo aún no está verificado
              </h2>
              <p className="mt-1 text-sm text-amber-800">
                Verifícalo para recibir la confirmación de tus pedidos y avisos
                de pago.
              </p>
            </div>
            <button
              type="button"
              onClick={reenviarCodigo}
              disabled={verificando}
              className="inline-flex min-h-10 items-center justify-center rounded-lg bg-amber-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {verificando ? 'Enviando…' : 'Reenviar código'}
            </button>
          </section>
        )}

        <section className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-stone-800">
              Datos de la cuenta
            </h2>
            {!editando && (
              <button
                type="button"
                onClick={() => {
                  setMensaje(null)
                  setError(null)
                  setEditando(true)
                }}
                className="inline-flex min-h-10 items-center rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition-colors hover:border-stone-500"
              >
                Editar
              </button>
            )}
          </div>

          {editando ? (
            <form
              onSubmit={enviarPerfil(guardarPerfil)}
              className="mt-5 space-y-4"
              noValidate
            >
              <label className="flex flex-col gap-2 text-sm text-stone-600">
                <span>Nombre completo</span>
                <input
                  id="perfil-nombre"
                  type="text"
                  aria-invalid={!!erroresPerfil.nombreCompleto}
                  aria-describedby={
                    erroresPerfil.nombreCompleto
                      ? 'perfil-error-nombre'
                      : undefined
                  }
                  {...registerPerfil('nombreCompleto', {
                    required: 'El nombre completo es obligatorio.',
                  })}
                  className="min-h-11 rounded-lg border border-stone-300 px-3 text-stone-700 outline-none placeholder:text-stone-400 focus:border-stone-500 aria-invalid:border-rose-700"
                />
                {erroresPerfil.nombreCompleto && (
                  <span
                    id="perfil-error-nombre"
                    role="alert"
                    className="text-xs text-rose-700"
                  >
                    {erroresPerfil.nombreCompleto.message}
                  </span>
                )}
              </label>

              <label className="flex flex-col gap-2 text-sm text-stone-600">
                <span>Teléfono</span>
                <input
                  id="perfil-telefono"
                  type="tel"
                  placeholder="Número de contacto"
                  aria-invalid={!!erroresPerfil.telefono}
                  aria-describedby={
                    erroresPerfil.telefono ? 'perfil-error-telefono' : undefined
                  }
                  {...registerPerfil('telefono', {
                    ...reglaTelefono(),
                    required: false,
                  })}
                  className="min-h-11 rounded-lg border border-stone-300 px-3 text-stone-700 outline-none placeholder:text-stone-400 focus:border-stone-500 aria-invalid:border-rose-700"
                />
                {erroresPerfil.telefono && (
                  <span
                    id="perfil-error-telefono"
                    role="alert"
                    className="text-xs text-rose-700"
                  >
                    {erroresPerfil.telefono.message}
                  </span>
                )}
              </label>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="submit"
                  disabled={guardando}
                  className="inline-flex min-h-10 items-center rounded-lg bg-stone-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {guardando ? 'Guardando…' : 'Guardar cambios'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetPerfil({
                      nombreCompleto: user.nombre_completo,
                      telefono: user.telefono ?? '',
                    })
                    setEditando(false)
                  }}
                  className="inline-flex min-h-10 items-center rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition-colors hover:border-stone-500"
                >
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            <dl className="mt-4 text-sm">
              <div className="flex flex-wrap justify-between gap-2 border-b border-stone-100 py-3">
                <dt className="text-stone-500">Nombre completo</dt>
                <dd className="font-medium text-stone-800">
                  {user.nombre_completo}
                </dd>
              </div>
              <div className="flex flex-wrap justify-between gap-2 border-b border-stone-100 py-3">
                <dt className="text-stone-500">Correo</dt>
                <dd className="font-medium text-stone-800">{user.correo}</dd>
              </div>
              <div className="flex flex-wrap justify-between gap-2 border-b border-stone-100 py-3">
                <dt className="text-stone-500">Teléfono</dt>
                <dd className="font-medium text-stone-800">
                  {user.telefono ?? 'Sin teléfono'}
                </dd>
              </div>
              <div className="flex flex-wrap justify-between gap-2 border-b border-stone-100 py-3">
                <dt className="text-stone-500">Tipo de cuenta</dt>
                <dd className="font-medium text-stone-800">
                  {ETIQUETA_ROL[user.role] ?? user.role}
                </dd>
              </div>
              <div className="flex flex-wrap justify-between gap-2 py-3">
                <dt className="text-stone-500">Correo verificado</dt>
                <dd className="font-medium text-stone-800">
                  {user.correo_verificado ? 'Sí' : 'Pendiente'}
                </dd>
              </div>
            </dl>
          )}
        </section>

        <section className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-stone-800">Seguridad</h2>
          <p className="mt-1 text-sm text-stone-600">
            Cambia tu contraseña si crees que alguien más la conoce.
          </p>

          <form
            onSubmit={enviarClave(guardarClave)}
            className="mt-5 space-y-4"
            noValidate
          >
            <label className="flex flex-col gap-2 text-sm text-stone-600">
              <span>Contraseña actual</span>
              <PasswordInput
                id="perfil-clave-actual"
                placeholder="Contraseña actual"
                autoComplete="current-password"
                aria-invalid={!!erroresClave.passwordActual}
                aria-describedby={
                  erroresClave.passwordActual
                    ? 'perfil-error-clave-actual'
                    : undefined
                }
                {...registerClave('passwordActual', {
                  required: 'Escribe tu contraseña actual.',
                })}
              />
              {erroresClave.passwordActual && (
                <span
                  id="perfil-error-clave-actual"
                  role="alert"
                  className="text-xs text-rose-700"
                >
                  {erroresClave.passwordActual.message}
                </span>
              )}
            </label>

            <label className="flex flex-col gap-2 text-sm text-stone-600">
              <span>Nueva contraseña</span>
              <PasswordInput
                id="perfil-clave-nueva"
                placeholder="Mínimo 8 caracteres"
                autoComplete="new-password"
                aria-invalid={!!erroresClave.passwordNueva}
                aria-describedby={
                  erroresClave.passwordNueva
                    ? 'perfil-error-clave-nueva'
                    : undefined
                }
                {...registerClave('passwordNueva', {
                  required: 'Escribe la nueva contraseña.',
                  minLength: {
                    value: 8,
                    message: 'Debe tener al menos 8 caracteres.',
                  },
                  validate: (valor) =>
                    valor !== getValoresClave('passwordActual') ||
                    'Debe ser distinta de la contraseña actual.',
                })}
              />
              {erroresClave.passwordNueva && (
                <span
                  id="perfil-error-clave-nueva"
                  role="alert"
                  className="text-xs text-rose-700"
                >
                  {erroresClave.passwordNueva.message}
                </span>
              )}
            </label>

            <label className="flex flex-col gap-2 text-sm text-stone-600">
              <span>Repite la nueva contraseña</span>
              <PasswordInput
                id="perfil-clave-confirmacion"
                placeholder="Repite la nueva contraseña"
                autoComplete="new-password"
                aria-invalid={!!erroresClave.passwordNuevaConfirmacion}
                aria-describedby={
                  erroresClave.passwordNuevaConfirmacion
                    ? 'perfil-error-clave-confirmacion'
                    : undefined
                }
                {...registerClave('passwordNuevaConfirmacion', {
                  required: 'Repite la nueva contraseña.',
                  validate: (valor) =>
                    valor === getValoresClave('passwordNueva') ||
                    'Las contraseñas no coinciden.',
                })}
              />
              {erroresClave.passwordNuevaConfirmacion && (
                <span
                  id="perfil-error-clave-confirmacion"
                  role="alert"
                  className="text-xs text-rose-700"
                >
                  {erroresClave.passwordNuevaConfirmacion.message}
                </span>
              )}
            </label>

            <button
              type="submit"
              disabled={cambiandoClave}
              className="inline-flex min-h-10 items-center rounded-lg bg-stone-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {cambiandoClave ? 'Actualizando…' : 'Actualizar contraseña'}
            </button>
          </form>
        </section>
      </div>
    </main>
  )
}
