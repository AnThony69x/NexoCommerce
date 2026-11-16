import { Link } from 'react-router-dom'

type AuthTabsProps = {
  variante: 'login' | 'registro'
}

const PESTANAS = [
  { clave: 'login', texto: 'Iniciar sesión', to: '/login' },
  { clave: 'registro', texto: 'Regístrate', to: '/registro' },
] as const

/**
 * Pestanas de acceso (iniciar sesión / registrarse) al estilo de la pantalla
 * de acceso: la activa se resalta sobre blanco, la otra queda discreta.
 */
export default function AuthTabs({ variante }: AuthTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Acceso a la cuenta"
      className="mt-6 grid grid-cols-2 gap-1 rounded-full bg-cream-soft p-1"
    >
      {PESTANAS.map((pestana) => {
        const activa = pestana.clave === variante

        return (
          <Link
            key={pestana.clave}
            to={pestana.to}
            role="tab"
            aria-selected={activa}
            className={`rounded-full px-4 py-2 text-center text-sm font-medium transition-colors ${
              activa
                ? 'bg-white text-rose-brand-dark shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {pestana.texto}
          </Link>
        )
      })}
    </div>
  )
}
