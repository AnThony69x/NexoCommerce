import { Link } from 'react-router-dom'
import heroPlaceholder from '../../assets/hero-placeholder.svg'

export default function HeroSection() {
  return (
    <section className="border-b border-stone-200 bg-stone-50 px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
      <div className="mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-2 lg:gap-12">
        <div>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">
            Celebramos tus momentos
          </p>
          <h1 className="max-w-xl text-4xl font-semibold leading-tight tracking-tight text-stone-800 sm:text-5xl">
            Momentos dulces,
            <br />
            hechos especialmente
            <br />
            para ti.
          </h1>
          <p className="mt-5 max-w-lg text-sm leading-6 text-stone-600 sm:text-base">
            Repostería artesanal, regalos personalizados y detalles pensados
            para celebrar con intención.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              to="/catalogo"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-rose-700 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-rose-800"
            >
              Explorar catálogo
            </Link>
            <Link
              to="/detalles-personalizados"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-stone-300 bg-white px-5 py-3 text-sm font-medium text-stone-700 transition-colors hover:border-stone-500"
            >
              Personalizar un detalle
            </Link>
          </div>
        </div>

        <div className="relative">
          <img
            src={heroPlaceholder}
            alt="Imagen temporal del producto destacado"
            className="aspect-[5/4] w-full rounded-2xl object-cover"
          />
          <div className="absolute bottom-4 left-4 rounded-lg bg-white/95 px-4 py-3 shadow-sm">
            <p className="text-sm font-semibold text-stone-800">
              Tarta Jardín de Rosas
            </p>
            <p className="mt-1 text-xs text-rose-700">Imagen y precio temporales</p>
          </div>
        </div>
      </div>
    </section>
  )
}
