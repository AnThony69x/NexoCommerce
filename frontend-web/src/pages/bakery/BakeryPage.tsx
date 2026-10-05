import Footer from '../../components/common/Footer'
import Header from '../../components/common/Header'
import BackButton from '../../components/common/BackButton'
import BakeryCategoryCard from '../../components/bakery/BakeryCategoryCard'
import BakeryHero from '../../components/bakery/BakeryHero'
import BakeryProductGrid from '../../components/bakery/BakeryProductGrid'
import { bakeryProducts } from '../../data/bakeryProducts.mock'

export default function BakeryPage() {
  return (
    <>
      <Header />

      <main>
        <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 lg:px-8">
          <BackButton fallback="/" />
        </div>
        <BakeryHero />

        <section className="border-b border-stone-200 bg-white px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-6 text-2xl font-semibold tracking-tight text-stone-800 sm:text-3xl">
              Encuentra algo especial
            </h2>
            <div className="grid gap-5 md:grid-cols-3">
              <BakeryCategoryCard
                title="Tortas"
                description="Creaciones para cumpleaños y celebraciones especiales."
              />
              <BakeryCategoryCard
                title="Cheesecakes"
                description="Texturas suaves y sabores para compartir."
              />
              <BakeryCategoryCard
                title="Postres y tartas"
                description="Pequeños detalles dulces para cualquier momento."
              />
            </div>
          </div>
        </section>

        <BakeryProductGrid products={bakeryProducts} />
      </main>

      <Footer />
    </>
  )
}
