import { useState, type ComponentProps } from 'react'

/**
 * Ojo abierto (mostrar): almendra con pupila y pestañas.
 */
const ICONO_OJO = (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5"
  >
    <path d="M2.5 12S6 6.5 12 6.5 21.5 12 21.5 12 18 17.5 12 17.5 2.5 12 2.5 12Z" />
    <circle cx="12" cy="12" r="2.75" />
    <path d="M6.4 8.2 5 6M12 6.2V3.6M17.6 8.2 19 6" />
  </svg>
)

/**
 * Ojo tachado (ocultar).
 */
const ICONO_OJO_TACHADO = (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5"
  >
    <path d="M2.5 12S6 6.5 12 6.5c1.5 0 2.8.4 3.9 1" />
    <path d="M21.5 12s-1 1.6-2.7 3.1c-1.7 1.5-4 2.4-6.8 2.4-2 0-3.8-.6-5.2-1.4" />
    <circle cx="12" cy="12" r="2.75" />
    <path d="M4 4l16 16" />
  </svg>
)

const CLASE_INPUT =
  'min-h-11 w-full rounded-lg border border-stone-300 bg-white px-3 pr-12 text-stone-700 outline-none placeholder:text-stone-400 focus:border-stone-500 aria-invalid:border-rose-700'

type PasswordInputProps = ComponentProps<'input'>

/**
 * Campo de contraseña con boton de ojo para mostrar u ocultar el valor.
 * Acepta las mismas props que un input (incluido el spread de React Hook
 * Form), asi que se usa igual que un input normal.
 */
export default function PasswordInput({
  className = '',
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative">
      <input
        {...props}
        type={visible ? 'text' : 'password'}
        className={`${CLASE_INPUT} ${className}`}
      />
      <button
        type="button"
        onClick={() => setVisible((actual) => !actual)}
        aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        aria-pressed={visible}
        title={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-brand/40"
      >
        {visible ? ICONO_OJO_TACHADO : ICONO_OJO}
      </button>
    </div>
  )
}
