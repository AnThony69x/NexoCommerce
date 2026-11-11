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
  reglaPasswordRegistro,
  reglaTelefono,
} from '../../utils/validation'

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
  const location = useLocation()
  const { registrar } = useAuth()
  const [registerError, setRegisterError] = useState('')
  const [enviando, setEnviando] = useState(false)
  const {
    register,
    getValues,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>()

  async function handleRegister(data: RegisterFormData) {
    setEnviando(true)
    try {
      // El registro público siempre crea CLIENTE. El repositorio decide
      // mock o API real según VITE_MOCK_MODE (términos/versión enviados allí).
      await registrar({
        nombre_completo: data.fullName,
        correo: data.email,
        telefono: data.phone.trim() || null,
        password: data.password,
      })
      setRegisterError('')
      // Conserva el destino original (ej. /checkout): quien llegó al registro
      // bloqueado vuelve a su flujo en vez de caer siempre en el inicio.
      const destino =
        (location.state as { from?: string } | null)?.from ?? '/'
      navigate(destino, { replace: true })
    } catch (error) {
      setRegisterError(
        error instanceof ApiError
          ? error.message
          : 'No se pudo crear la cuenta. Intenta nuevamente.',
      )
    } finally {
      setEnviando(false)
    }
  }

  return (
    <AuthLayout>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">
        Únete a nosotros
      </p>
      <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-stone-800">
        Crea tu cuenta
      </h1>
      <p className="mt-3 text-sm leading-6 text-stone-600">
        Regístrate para guardar tus datos y continuar tus compras.
      </p>

      <AuthTabs variante="registro" />

      {registerError && (
        <p
          role="alert"
          className="mt-6 rounded-lg bg-rose-50 p-3 text-sm text-rose-700"
        >
          {registerError}
        </p>
      )}

      <form
        onSubmit={handleSubmit(handleRegister)}
        className="mt-6 space-y-5"
        noValidate
      >
        <label className="flex flex-col gap-2 text-sm text-stone-600">
          <span>Nombre completo</span>
          <input
            id="register-fullname"
            type="text"
            placeholder="Nombre del cliente"
            autoComplete="name"
            aria-invalid={!!errors.fullName}
            aria-describedby={
              errors.fullName ? 'register-error-fullname' : undefined
            }
            {...register('fullName', {
              required: 'El nombre completo es obligatorio.',
            })}
            className="min-h-11 rounded-lg border border-stone-300 bg-white px-3 text-stone-700 outline-none placeholder:text-stone-400 focus:border-stone-500 aria-invalid:border-rose-700"
          />
          {errors.fullName && (
            <span
              id="register-error-fullname"
              role="alert"
              className="text-xs text-rose-700"
            >
              {errors.fullName.message}
            </span>
          )}
        </label>

        <label className="flex flex-col gap-2 text-sm text-stone-600">
          <span>Correo electrónico</span>
          <input
            id="register-email"
            type="email"
            placeholder="correo@ejemplo.com"
            autoComplete="email"
            aria-invalid={!!errors.email}
            aria-describedby={
              errors.email ? 'register-error-email' : undefined
            }
            {...register('email', reglaCorreoRequerido())}
            className="min-h-11 rounded-lg border border-stone-300 bg-white px-3 text-stone-700 outline-none placeholder:text-stone-400 focus:border-stone-500 aria-invalid:border-rose-700"
          />
          {errors.email && (
            <span
              id="register-error-email"
              role="alert"
              className="text-xs text-rose-700"
            >
              {errors.email.message}
            </span>
          )}
        </label>

        <label className="flex flex-col gap-2 text-sm text-stone-600">
          <span>Teléfono</span>
          <input
            id="register-phone"
            type="tel"
            placeholder="Número de contacto"
            autoComplete="tel"
            aria-invalid={!!errors.phone}
            aria-describedby={
              errors.phone ? 'register-error-phone' : undefined
            }
            {...register('phone', reglaTelefono())}
            className="min-h-11 rounded-lg border border-stone-300 bg-white px-3 text-stone-700 outline-none placeholder:text-stone-400 focus:border-stone-500 aria-invalid:border-rose-700"
          />
          {errors.phone && (
            <span
              id="register-error-phone"
              role="alert"
              className="text-xs text-rose-700"
            >
              {errors.phone.message}
            </span>
          )}
        </label>

        <label className="flex flex-col gap-2 text-sm text-stone-600">
          <span>Contraseña</span>
          <PasswordInput
            id="register-password"
            placeholder="Mínimo 8 caracteres"
            autoComplete="new-password"
            aria-invalid={!!errors.password}
            aria-describedby={
              errors.password ? 'register-error-password' : undefined
            }
            {...register('password', reglaPasswordRegistro())}
          />
          {errors.password && (
            <span
              id="register-error-password"
              role="alert"
              className="text-xs text-rose-700"
            >
              {errors.password.message}
            </span>
          )}
        </label>

        <label className="flex flex-col gap-2 text-sm text-stone-600">
          <span>Confirmar contraseña</span>
          <PasswordInput
            id="register-confirm-password"
            placeholder="Repite tu contraseña"
            autoComplete="new-password"
            aria-invalid={!!errors.confirmPassword}
            aria-describedby={
              errors.confirmPassword
                ? 'register-error-confirm-password'
                : undefined
            }
            {...register('confirmPassword', {
              required: 'Confirma tu contraseña.',
              validate: (value) =>
                value === getValues('password') ||
                'Las contraseñas no coinciden.',
            })}
          />
          {errors.confirmPassword && (
            <span
              id="register-error-confirm-password"
              role="alert"
              className="text-xs text-rose-700"
            >
              {errors.confirmPassword.message}
            </span>
          )}
        </label>

        <label className="flex items-start gap-3 text-sm text-stone-600">
          <input
            id="register-terms"
            type="checkbox"
            aria-invalid={!!errors.termsAccepted}
            aria-describedby={
              errors.termsAccepted ? 'register-error-terms' : undefined
            }
            {...register('termsAccepted', {
              required: 'Debes aceptar los términos.',
            })}
            className="mt-1 h-4 w-4 rounded border-stone-300 accent-stone-800"
          />
          <span>Acepto los términos y condiciones.</span>
        </label>
        {errors.termsAccepted && (
          <span
            id="register-error-terms"
            role="alert"
            className="-mt-3 block text-xs text-rose-700"
          >
            {errors.termsAccepted.message}
          </span>
        )}

        <button
          type="submit"
          disabled={enviando}
          className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-stone-800 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {enviando ? 'Creando cuenta…' : 'Crear cuenta'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-stone-600">
        ¿Ya tienes cuenta?{' '}
        <Link
          to="/login"
          state={location.state ?? undefined}
          className="font-medium text-rose-700 transition-colors hover:text-rose-800"
        >
          Inicia sesión
        </Link>
      </p>
    </AuthLayout>
  )
}
