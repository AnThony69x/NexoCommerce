import DetailsCategoryCard from '../../components/details/DetailsCategoryCard'
import DetailsHero from '../../components/details/DetailsHero'
import DetailsProductGrid from '../../components/details/DetailsProductGrid'
import { ApiErrorState, LoadingState } from '../../components/common/RequestState'
import { useAsync } from '../../hooks/useAsync'
import {
  CATEGORIA_DETALLES,
  listarPorCategoria,
} from '../../services/productsRepository'

export default function DetailsPage() {
  const {
    data: productos,
    loading,
    error,
    recargar,
  } = useAsync(() => listarPorCategoria(CATEGORIA_DETALLES), [])
  return (
    <main>
        <DetailsHero />

        <section className="border-b border-stone-200 bg-white px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <div className="mx-auto">
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

        {loading ? (
          <div className="mx-auto px-4 py-10 sm:px-6 lg:px-8">
            <LoadingState mensaje="Cargando detalles…" />
          </div>
        ) : error ? (
          <div className="mx-auto px-4 py-10 sm:px-6 lg:px-8">
            <ApiErrorState mensaje={error} onReintentar={recargar} />
          </div>
        ) : (
          <DetailsProductGrid products={productos ?? []} />
        )}
    </main>
  )
}
