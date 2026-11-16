import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AuthLayout from '../../components/auth/AuthLayout'
import AuthTabs from '../../components/auth/AuthTabs'
import PasswordInput from '../../components/common/PasswordInput'
import { useAuth } from '../../hooks/useAuth'
import { ApiError } from '../../types/api'
import {
  reglaCorreoRequerido,
  reglaPasswordLogin,
} from '../../utils/validation'

type LoginFormData = {
  email: string
  password: string
}

type LoginLocationState = {
  from?: string
}

export default function LoginPage() {
  const [authError, setAuthError] = useState('')
  const [enviando, setEnviando] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>()

  async function handleLogin(data: LoginFormData) {
    setEnviando(true)
    try {
      // Mock o API real según VITE_MOCK_MODE; lanza ApiError si falla.
      const user = await login(data.email, data.password)
      setAuthError('')
      const destino =
        (location.state as LoginLocationState | null)?.from ??
        (user.role === 'ADMIN' ? '/admin' : '/')
      navigate(destino, { replace: true })
    } catch (error) {
      setAuthError(
        error instanceof ApiError
          ? error.message
          : 'No se pudo iniciar sesión. Intenta nuevamente.',
      )
    } finally {
      setEnviando(false)
    }
  }

  return (
    <AuthLayout>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">
        Bienvenido de nuevo
      </p>
      <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-stone-800">
        Qué alegría verte
      </h1>
      <p className="mt-3 text-sm leading-6 text-stone-600">
        Accede para seguir tus pedidos y guardar tus personalizaciones
        favoritas.
      </p>

      <AuthTabs variante="login" />

      {authError && (
        <p
          role="alert"
          className="mt-6 rounded-lg bg-rose-50 p-3 text-sm text-rose-700"
        >
          {authError}
        </p>
      )}

      <form
        onSubmit={handleSubmit(handleLogin)}
        className="mt-6 space-y-5"
        noValidate
      >
        <label className="flex flex-col gap-2 text-sm text-stone-600">
          <span>Correo electrónico</span>
          <input
            id="login-email"
            type="email"
            placeholder="correo@ejemplo.com"
            autoComplete="email"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'login-error-email' : undefined}
            {...register('email', reglaCorreoRequerido())}
            className="min-h-11 rounded-lg border border-stone-300 bg-white px-3 text-stone-700 outline-none placeholder:text-stone-400 focus:border-stone-500 aria-invalid:border-rose-700"
          />
          {errors.email && (
            <span
              id="login-error-email"
              role="alert"
              className="text-xs text-rose-700"
            >
              {errors.email.message}
            </span>
          )}
        </label>

        <label className="flex flex-col gap-2 text-sm text-stone-600">
          <span>Contraseña</span>
          <PasswordInput
            id="login-password"
            placeholder="Ingresa tu contraseña"
            autoComplete="current-password"
            aria-invalid={!!errors.password}
            aria-describedby={
              errors.password ? 'login-error-password' : undefined
            }
            {...register('password', reglaPasswordLogin())}
          />
          {errors.password && (
            <span
              id="login-error-password"
              role="alert"
              className="text-xs text-rose-700"
            >
              {errors.password.message}
            </span>
          )}
        </label>

        <button
          type="submit"
          disabled={enviando}
          className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-stone-800 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {enviando ? 'Iniciando sesión…' : 'Iniciar sesión'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-stone-600">
        ¿Primera vez?{' '}
        <Link
          to="/registro"
          className="font-medium text-rose-700 transition-colors hover:text-rose-800"
        >
          Crea tu cuenta en menos de un minuto
        </Link>
      </p>
    </AuthLayout>
  )
}
