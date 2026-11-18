import DetailsHero from '../../components/details/DetailsHero'
import DetailsProductGrid from '../../components/details/DetailsProductGrid'
import CategoryCatalog from '../../components/catalog/CategoryCatalog'
import { CATEGORIA_DETALLES } from '../../services/productsRepository'

export default function DetailsPage() {
  return (
    <main>
      <DetailsHero />
      <CategoryCatalog
        categoria={CATEGORIA_DETALLES}
        seccion="detalles"
        verTodos="Ver todos los detalles"
        ProductGrid={DetailsProductGrid}
      />
    </main>
  )
}
