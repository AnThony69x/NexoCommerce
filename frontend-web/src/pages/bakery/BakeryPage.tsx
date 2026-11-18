import BakeryHero from '../../components/bakery/BakeryHero'
import BakeryProductGrid from '../../components/bakery/BakeryProductGrid'
import CategoryCatalog from '../../components/catalog/CategoryCatalog'
import { CATEGORIA_REPOSTERIA } from '../../services/productsRepository'

export default function BakeryPage() {
  return (
    <main>
      <BakeryHero />
      <CategoryCatalog
        categoria={CATEGORIA_REPOSTERIA}
        seccion="repostería"
        verTodos="Ver todos los productos de repostería"
        ProductGrid={BakeryProductGrid}
      />
    </main>
  )
}
