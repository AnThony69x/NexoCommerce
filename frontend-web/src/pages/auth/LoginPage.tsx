import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import Footer from '../../components/common/Footer'
import Header from '../../components/common/Header'
import { useAuth } from '../../hooks/useAuth'

type LoginFormData = {
  email: string
  password: string
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [authError, setAuthError] = useState('')
  const navigate = useNavigate()
  const { login } = useAuth()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>()

  function handleMockLogin(data: LoginFormData) {
    const user = login(data.email, data.password)

    if (!user) {
      setAuthError('Correo, contraseña o estado de usuario inválido.')
      return
    }

    setAuthError('')
    navigate(user.role === 'ADMIN' ? '/admin' : '/')
  }

  return (
    <>
      <Header />

      <main className="min-h-[calc(100vh-17rem)] bg-stone-50 px-4 py-12 sm:px-6 lg:px-8">
        <section className="mx-auto max-w-md rounded-xl border border-stone-200 bg-white p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">
            Bienvenido de nuevo
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-stone-800">
            Iniciar sesión
          </h1>
          <p className="mt-3 text-sm leading-6 text-stone-600">
            Accede a tu cuenta para continuar con tus pedidos.
          </p>

          <form
            onSubmit={handleSubmit(handleMockLogin)}
            className="mt-7 space-y-5"
            noValidate
          >
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
              <span>Contraseña</span>
              <div className="flex gap-2">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Ingresa tu contraseña"
                  {...register('password', {
                    required: 'La contraseña es obligatoria.',
                    minLength: {
                      value: 6,
                      message: 'Debe tener al menos 6 caracteres.',
                    },
                  })}
                  className="min-h-11 min-w-0 flex-1 rounded-lg border border-stone-300 px-3 text-stone-700 outline-none placeholder:text-stone-400 focus:border-stone-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="min-h-11 rounded-lg border border-stone-300 px-3 text-xs font-medium text-stone-700 hover:border-stone-500"
                >
                  {showPassword ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
              {errors.password && (
                <span className="text-xs text-rose-700">
                  {errors.password.message}
                </span>
              )}
            </label>

            <button
              type="submit"
              className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-stone-800 px-5 py-3 text-sm font-medium text-white hover:bg-stone-700"
            >
              Iniciar sesión
            </button>

            {authError && (
              <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
                {authError}
              </p>
            )}

          </form>

          <p className="mt-6 text-center text-sm text-stone-600">
            ¿Aún no tienes una cuenta?{' '}
            <Link to="/registro" className="font-medium text-rose-700 hover:text-rose-800">
              Crear una cuenta
            </Link>
          </p>
        </section>
      </main>

      <Footer />
    </>
  )
}
