import bakeryPlaceholder from '../../assets/category-bakery-placeholder.svg'
import detailsPlaceholder from '../../assets/category-details-placeholder.svg'
import sublimationPlaceholder from '../../assets/category-sublimation-placeholder.svg'
import CategoryCard from './CategoryCard'

export default function CategoriesSection() {
  return (
    <section className="border-b border-stone-200 bg-white px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-6 text-2xl font-semibold tracking-tight text-stone-800 sm:text-3xl">
          Elige cómo quieres celebrar
        </h2>

        <div className="grid gap-5 md:grid-cols-3">
          <CategoryCard
            title="Repostería"
            description="Tortas, dulces y creaciones para compartir."
            image={bakeryPlaceholder}
            href="/reposteria"
          />
          <CategoryCard
            title="Detalles personalizados"
            description="Regalos pensados especialmente para ti."
            image={detailsPlaceholder}
            href="/detalles-personalizados"
          />
          <CategoryCard
            title="Sublimación"
            description="Objetos únicos con tu estilo y tus ideas."
            image={sublimationPlaceholder}
            href="/sublimacion"
          />
        </div>
      </div>
    </section>
  )
}
