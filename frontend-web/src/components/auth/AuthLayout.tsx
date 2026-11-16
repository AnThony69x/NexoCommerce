import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

type AuthLayoutProps = {
  children: ReactNode
}

const BENEFICIOS = [
  'Historial de pedidos',
  'Favoritos guardados',
  'Compra más rápida',
]

/**
 * Marco de las pantallas de acceso: panel editorial a la izquierda con la
 * marca y la promesa de la tienda, y a la derecha la tarjeta con el
 * formulario. En movil solo se ve la tarjeta (con la marca arriba).
 *
 * El panel izquierdo es decorativo: en cuanto exista la foto de marca
 * (src/assets/), se puede sustituir el fondo por <img> sin tocar el resto.
 */
export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-cream lg:grid lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-brown lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute -left-28 -top-28 h-96 w-96 rounded-full bg-rose-brand/25 blur-3xl" />
          <div className="absolute -bottom-40 -right-24 h-[30rem] w-[30rem] rounded-full bg-rose-brand-dark/30 blur-3xl" />
          <svg
            viewBox="0 0 400 200"
            className="absolute inset-x-0 bottom-0 h-1/2 w-full text-white/5"
            preserveAspectRatio="none"
          >
            <path
              fill="currentColor"
              d="M0 120c50 0 50-40 100-40s50 40 100 40 50-40 100-40 50 40 100 40v80H0z"
            />
          </svg>
        </div>

        <div className="relative">
          <p className="font-display text-2xl font-semibold text-white">
            Dulces Aesca
          </p>
          <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.3em] text-stone-300">
            Hecho para celebrar
          </p>
        </div>

        <div className="relative">
          <p className="max-w-md font-display text-4xl leading-[1.15] text-white xl:text-[2.75rem]">
            Cada celebración merece sentirse tan única como quien la recibe.
          </p>
          <p className="mt-6 text-sm text-stone-300">
            — El equipo de Dulces Aesca
          </p>
        </div>
      </aside>

      <main className="flex min-h-screen flex-col px-4 py-6 sm:px-6 lg:px-10">
        <div className="flex items-center justify-between gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded text-sm font-medium text-stone-500 transition-colors hover:text-rose-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-brand/40"
          >
            <span aria-hidden="true">←</span>
            Volver a la tienda
          </Link>
          <span className="font-display text-lg font-semibold text-brown lg:hidden">
            Dulces Aesca
          </span>
        </div>

        <div className="flex flex-1 items-center justify-center py-8">
          <div className="w-full max-w-md">
            <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-10">
              {children}
            </div>

            <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-stone-500">
              {BENEFICIOS.map((beneficio) => (
                <li key={beneficio} className="inline-flex items-center gap-1.5">
                  <span aria-hidden="true" className="text-rose-brand-dark">
                    ✓
                  </span>
                  {beneficio}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
}
