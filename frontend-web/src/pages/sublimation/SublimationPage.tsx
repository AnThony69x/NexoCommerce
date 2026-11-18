import SublimationHero from '../../components/sublimation/SublimationHero'
import SublimationProductGrid from '../../components/sublimation/SublimationProductGrid'
import CategoryCatalog from '../../components/catalog/CategoryCatalog'
import { CATEGORIA_SUBLIMACION } from '../../services/productsRepository'

export default function SublimationPage() {
  return (
    <main>
      <SublimationHero />
      <CategoryCatalog
        categoria={CATEGORIA_SUBLIMACION}
        seccion="sublimación"
        verTodos="Ver todos los productos de sublimación"
        ProductGrid={SublimationProductGrid}
      />
    </main>
  )
}
