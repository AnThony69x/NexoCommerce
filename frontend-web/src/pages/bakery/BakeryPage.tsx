import BackButton from '../../components/common/BackButton'
import BakeryCategoryCard from '../../components/bakery/BakeryCategoryCard'
import BakeryHero from '../../components/bakery/BakeryHero'
import BakeryProductGrid from '../../components/bakery/BakeryProductGrid'
import { ApiErrorState, LoadingState } from '../../components/common/RequestState'
import { useAsync } from '../../hooks/useAsync'
import {
  CATEGORIA_REPOSTERIA,
  listarPorCategoria,
} from '../../services/productsRepository'

export default function BakeryPage() {
  const {
    data: productos,
    loading,
    error,
    recargar,
  } = useAsync(() => listarPorCategoria(CATEGORIA_REPOSTERIA), [])

  return (
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

        {loading ? (
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
            <LoadingState mensaje="Cargando repostería…" />
          </div>
        ) : error ? (
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
            <ApiErrorState mensaje={error} onReintentar={recargar} />
          </div>
        ) : (
          <BakeryProductGrid products={productos ?? []} />
        )}
    </main>
  )
}
