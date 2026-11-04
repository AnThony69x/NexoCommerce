import { Link } from 'react-router-dom'
import customizationPlaceholder from '../../assets/category-details-placeholder.svg'

export default function CustomizationSection() {
  return (
    <section className="bg-cream px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
      <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="overflow-hidden rounded-3xl bg-cream-soft">
          <img
            src={customizationPlaceholder}
            alt="Detalle personalizado envuelto a mano"
            className="aspect-[4/3] w-full object-cover"
          />
        </div>

        <div className="max-w-xl">
          <p className="mb-4 inline-block rounded-full bg-rose-soft px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-rose-brand-dark">
            Taller a medida
          </p>
          <h2 className="font-display text-3xl font-semibold leading-tight tracking-tight text-brown sm:text-4xl">
            Personalizamos cada pieza para contar tu historia.
          </h2>
          <p className="mt-4 text-sm leading-7 text-brown-soft sm:text-base">
            Elige colores, nombres, mensajes y empaques. Nuestro equipo lo
            prepara desde la idea hasta la entrega.
          </p>
          <Link
            to="/detalles"
            className="mt-7 inline-flex min-h-11 items-center justify-center rounded-full bg-rose-brand px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-rose-brand-dark"
          >
            Conocer el taller
          </Link>
        </div>
      </div>
    </section>
  )
}
