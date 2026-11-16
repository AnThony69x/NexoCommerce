import { Link } from 'react-router-dom'
import heroPlaceholder from '../../assets/hero-placeholder.svg'

export default function HeroSection() {
  return (
    <section className="bg-cream px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
      <div className="mx-auto grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="mb-5 inline-block rounded-full bg-rose-soft px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-rose-brand-ink">
            Colección de repostería aesca
          </p>
          <h1 className="max-w-xl font-display text-4xl font-semibold leading-[1.08] tracking-tight text-brown sm:text-5xl lg:text-6xl">
            Momentos dulces, hechos especialmente para ti.
          </h1>
          <p className="mt-5 max-w-lg text-sm leading-7 text-brown-soft sm:text-base">
            Repostería artesanal, regalos personalizados y detalles pensados
            para celebrar con intención.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/reposteria"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-rose-brand-dark px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-rose-brand-ink"
            >
              Explorar repostería
            </Link>
            <Link
              to="/detalles"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-stone-300 bg-white px-6 py-3 text-sm font-medium text-brown transition-colors hover:border-rose-brand hover:text-rose-brand-dark"
            >
              Personalizar el mío
            </Link>
          </div>
          <p className="mt-6 text-xs text-brown-soft">
            Pagos con tarjeta o transferencia · Envíos a toda Ecuador
          </p>
        </div>

        <div className="relative">
          <img
            src={heroPlaceholder}
            alt="Torta Jardín de Rosas, producto destacado"
            className="aspect-[5/4] w-full rounded-3xl object-cover shadow-sm"
          />
          <div className="absolute bottom-5 left-5 rounded-2xl bg-white/95 px-5 py-4 shadow-sm backdrop-blur-sm">
            <p className="font-display text-base font-semibold text-brown">
              Torta Jardín de Rosas
            </p>
            <p className="mt-1 text-xs text-brown-soft">Desde $48.00</p>
          </div>
        </div>
      </div>
    </section>
  )
}
