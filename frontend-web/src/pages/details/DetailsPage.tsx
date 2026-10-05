import Footer from '../../components/common/Footer'
import Header from '../../components/common/Header'
import BackButton from '../../components/common/BackButton'
import DetailsCategoryCard from '../../components/details/DetailsCategoryCard'
import DetailsHero from '../../components/details/DetailsHero'
import DetailsProductGrid from '../../components/details/DetailsProductGrid'
import { detailsProducts } from '../../data/detailsProducts.mock'

export default function DetailsPage() {
  return (
    <>
      <Header />

      <main>
        <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 lg:px-8">
          <BackButton fallback="/" />
        </div>
        <DetailsHero />

        <section className="border-b border-stone-200 bg-white px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-6 text-2xl font-semibold tracking-tight text-stone-800 sm:text-3xl">
              Elige un detalle especial
            </h2>
            <div className="grid gap-5 md:grid-cols-3">
              <DetailsCategoryCard
                title="Cajas de regalo"
                description="Combinaciones dulces para sorprender en cualquier ocasión."
              />
              <DetailsCategoryCard
                title="Kits personalizados"
                description="Regalos armados con nombres, colores y mensajes únicos."
              />
              <DetailsCategoryCard
                title="Detalles dulces"
                description="Pequeños gestos preparados con intención y cariño."
              />
            </div>
          </div>
        </section>

        <DetailsProductGrid products={detailsProducts} />
      </main>

      <Footer />
    </>
  )
}
