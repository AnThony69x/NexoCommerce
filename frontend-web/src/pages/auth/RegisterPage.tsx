import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import Footer from '../../components/common/Footer'
import Header from '../../components/common/Header'
import { useAuth } from '../../hooks/useAuth'

type RegisterFormData = {
  fullName: string
  email: string
  phone: string
  password: string
  confirmPassword: string
  termsAccepted: boolean
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const { registerMock } = useAuth()
  const {
    register,
    getValues,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>()

  function handleMockRegister(data: RegisterFormData) {
    const user = registerMock(
      data.fullName,
      data.email,
      data.phone,
      data.password,
    )
    navigate(user.role === 'ADMIN' ? '/admin' : '/')
  }

  return (
    <>
      <Header />

      <main className="min-h-[calc(100vh-17rem)] bg-stone-50 px-4 py-12 sm:px-6 lg:px-8">
        <section className="mx-auto max-w-md rounded-xl border border-stone-200 bg-white p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">
            Únete a nosotros
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-stone-800">
            Crear cuenta
          </h1>
          <p className="mt-3 text-sm leading-6 text-stone-600">
            Regístrate para guardar tus datos y continuar tus compras.
          </p>

          <form
            onSubmit={handleSubmit(handleMockRegister)}
            className="mt-7 space-y-5"
            noValidate
          >
            <label className="flex flex-col gap-2 text-sm text-stone-600">
              <span>Nombre completo</span>
              <input
                type="text"
                placeholder="Nombre del cliente"
                {...register('fullName', {
                  required: 'El nombre completo es obligatorio.',
                })}
                className="min-h-11 rounded-lg border border-stone-300 px-3 text-stone-700 outline-none placeholder:text-stone-400 focus:border-stone-500"
              />
              {errors.fullName && (
                <span className="text-xs text-rose-700">
                  {errors.fullName.message}
                </span>
              )}
            </label>

            <label className="flex flex-col gap-2 text-sm text-stone-600">
              <span>Correo electrónico</span>
              <input
                type="email"
                placeholder="correo@ejemplo.com"
                {...register('email', {
                  required: 'El correo es obligatorio.',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Ingresa un correo válido.',
                  },
                })}
                className="min-h-11 rounded-lg border border-stone-300 px-3 text-stone-700 outline-none placeholder:text-stone-400 focus:border-stone-500"
              />
              {errors.email && (
                <span className="text-xs text-rose-700">
                  {errors.email.message}
                </span>
              )}
            </label>

            <label className="flex flex-col gap-2 text-sm text-stone-600">
              <span>Teléfono</span>
              <input
                type="tel"
                placeholder="Número de contacto"
                {...register('phone', {
                  required: 'El teléfono es obligatorio.',
                })}
                className="min-h-11 rounded-lg border border-stone-300 px-3 text-stone-700 outline-none placeholder:text-stone-400 focus:border-stone-500"
              />
              {errors.phone && (
                <span className="text-xs text-rose-700">
                  {errors.phone.message}
                </span>
              )}
            </label>

            <label className="flex flex-col gap-2 text-sm text-stone-600">
              <span>Contraseña</span>
              <input
                type="password"
                placeholder="Mínimo 8 caracteres"
                {...register('password', {
                  required: 'La contraseña es obligatoria.',
                  minLength: {
                    value: 8,
                    message: 'Debe tener al menos 8 caracteres.',
                  },
                })}
                className="min-h-11 rounded-lg border border-stone-300 px-3 text-stone-700 outline-none placeholder:text-stone-400 focus:border-stone-500"
              />
              {errors.password && (
                <span className="text-xs text-rose-700">
                  {errors.password.message}
                </span>
              )}
            </label>

            <label className="flex flex-col gap-2 text-sm text-stone-600">
              <span>Confirmar contraseña</span>
              <input
                type="password"
                placeholder="Repite tu contraseña"
                {...register('confirmPassword', {
                  required: 'Confirma tu contraseña.',
                  validate: (value) =>
                    value === getValues('password') ||
                    'Las contraseñas no coinciden.',
                })}
                className="min-h-11 rounded-lg border border-stone-300 px-3 text-stone-700 outline-none placeholder:text-stone-400 focus:border-stone-500"
              />
              {errors.confirmPassword && (
                <span className="text-xs text-rose-700">
                  {errors.confirmPassword.message}
                </span>
              )}
            </label>

            <label className="flex items-start gap-3 text-sm text-stone-600">
              <input
                type="checkbox"
                {...register('termsAccepted', {
                  required: 'Debes aceptar los términos.',
                })}
                className="mt-1 h-4 w-4 rounded border-stone-300 accent-stone-800"
              />
              <span>Acepto los términos y condiciones.</span>
            </label>
            {errors.termsAccepted && (
              <span className="-mt-3 block text-xs text-rose-700">
                {errors.termsAccepted.message}
              </span>
            )}

            <button
              type="submit"
              className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-stone-800 px-5 py-3 text-sm font-medium text-white hover:bg-stone-700"
            >
              Crear cuenta
            </button>

          </form>

          <p className="mt-6 text-center text-sm text-stone-600">
            ¿Ya tienes una cuenta?{' '}
            <Link to="/login" className="font-medium text-rose-700 hover:text-rose-800">
              Volver a iniciar sesión
            </Link>
          </p>
        </section>
      </main>

      <Footer />
    </>
  )
}
