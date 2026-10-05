import { useState } from 'react'
import BackButton from '../../components/common/BackButton'
import { useSearchParams } from 'react-router-dom'
import CatalogFilters from '../../components/catalog/CatalogFilters'
import CatalogPagination from '../../components/catalog/CatalogPagination'
import CatalogSearch from '../../components/catalog/CatalogSearch'
import ProductGrid, {
  type CatalogProduct,
} from '../../components/catalog/ProductGrid'
import boxPlaceholder from '../../assets/product-box-placeholder.svg'
import cakePlaceholder from '../../assets/product-cake-placeholder.svg'
import dessertPlaceholder from '../../assets/product-dessert-placeholder.svg'
import mugPlaceholder from '../../assets/product-mug-placeholder.svg'

const mockProducts: CatalogProduct[] = [
  {
    nombre: 'Torta Jardín de Rosas',
    precio: '$45.00',
    imagen: cakePlaceholder,
    categoría: 'Repostería',
    href: '/productos/torta-jardin-de-rosas',
    disponible: true,
  },
  {
    nombre: 'Caja Dulce Celebración',
    precio: '$32.00',
    imagen: boxPlaceholder,
    categoría: 'Detalles personalizados',
    href: '/productos/caja-dulce-celebracion',
    disponible: true,
  },
  {
    nombre: 'Taza Flores & Nombre',
    precio: '$18.00',
    imagen: mugPlaceholder,
    categoría: 'Sublimación',
    href: '/productos/taza-flores-nombre',
    disponible: false,
  },
  {
    nombre: 'Cheesecake de Frutos Rojos',
    precio: '$28.00',
    imagen: dessertPlaceholder,
    categoría: 'Repostería',
    href: '/productos/cheesecake-frutos-rojos',
    disponible: true,
  },
]

export default function CatalogPage() {
  const productsPerPage = 2
  const [searchParams] = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(
    () => searchParams.get('search') ?? '',
  )
  const [selectedCategory, setSelectedCategory] = useState('Todas las categorías')
  const [onlyAvailable, setOnlyAvailable] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  const normalizedSearchTerm = searchTerm.trim().toLowerCase()
  const filteredProducts = mockProducts.filter((product) => {
    const matchesName = product.nombre.toLowerCase().includes(normalizedSearchTerm)
    const matchesCategory =
      selectedCategory === 'Todas las categorías' ||
      product.categoría === selectedCategory
    const matchesAvailability = !onlyAvailable || product.disponible

    return matchesName && matchesCategory && matchesAvailability
  })
  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / productsPerPage),
  )
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage,
  )

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <BackButton fallback="/" />
        <section>
          <h1 className="text-3xl font-semibold text-stone-800">Catálogo</h1>
        </section>

        <CatalogSearch
          searchTerm={searchTerm}
          onSearchChange={(value) => {
            setSearchTerm(value)
            setCurrentPage(1)
          }}
        />

        <CatalogFilters
          selectedCategory={selectedCategory}
          onCategoryChange={(value) => {
            setSelectedCategory(value)
            setCurrentPage(1)
          }}
          onlyAvailable={onlyAvailable}
          onAvailabilityChange={(value) => {
            setOnlyAvailable(value)
            setCurrentPage(1)
          }}
        />

        <ProductGrid productos={paginatedProducts} />

        <CatalogPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </main>
  )
}
