import Footer from '../../components/common/Footer'
import Header from '../../components/common/Header'
import BackButton from '../../components/common/BackButton'
import SublimationHero from '../../components/sublimation/SublimationHero'
import SublimationOptionCard from '../../components/sublimation/SublimationOptionCard'
import SublimationProductGrid from '../../components/sublimation/SublimationProductGrid'
import { sublimationProducts } from '../../data/sublimationProducts.mock'

export default function SublimationPage() {
  return (
    <>
      <Header />

      <main>
        <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 lg:px-8">
          <BackButton fallback="/" />
        </div>
        <SublimationHero />

        <section className="border-b border-stone-200 bg-white px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-6 text-2xl font-semibold tracking-tight text-stone-800 sm:text-3xl">
              Elige cómo empezar
            </h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <SublimationOptionCard
                title="Plantilla prediseñada"
                description="Elige una idea base y personalízala con tus colores y detalles favoritos."
              />
              <SublimationOptionCard
                title="Diseño personalizado"
                description="Comparte tu idea y crea un producto único para una ocasión especial."
              />
            </div>
          </div>
        </section>

        <SublimationProductGrid products={sublimationProducts} />
      </main>

      <Footer />
    </>
  )
}
