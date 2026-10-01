import { Link } from 'react-router-dom'
import customizationPlaceholder from '../../assets/category-details-placeholder.svg'

export default function CustomizationSection() {
  return (
    <section className="border-b border-stone-200 bg-[#f4eadc] px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
      <div className="mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="overflow-hidden rounded-2xl bg-stone-200">
          <img
            src={customizationPlaceholder}
            alt="Imagen de referencia para personalización"
            className="aspect-[4/3] w-full object-cover"
          />
        </div>

        <div className="max-w-xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">
            Hecho para ti
          </p>
          <h2 className="text-2xl font-semibold leading-tight tracking-tight text-stone-800 sm:text-3xl">
            Personaliza cada pieza para contar tu historia.
          </h2>
          <p className="mt-4 text-sm leading-6 text-stone-600 sm:text-base">
            Elige colores, nombres y detalles especiales. Creamos un regalo que
            representa tu idea y convierte cada celebración en un recuerdo.
          </p>
          <Link
            to="/detalles"
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-rose-700 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-rose-800"
          >
            Personalizar un detalle
          </Link>
        </div>
      </div>
    </section>
  )
}
