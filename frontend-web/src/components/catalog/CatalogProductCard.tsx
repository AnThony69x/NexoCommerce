import { Link } from 'react-router-dom'
import type { Product } from '../../types/product'

type CatalogProductCardProps = Pick<
  Product,
  'nombre' | 'precio' | 'imagen' | 'categoría' | 'href'
>

export default function CatalogProductCard({
  nombre,
  precio,
  imagen,
  categoría,
  href,
}: CatalogProductCardProps) {
  return (
    <Link
      to={href}
      className="group block overflow-hidden rounded-xl border border-stone-200 bg-white"
    >
      <img
        src={imagen}
        alt={nombre}
        className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div className="p-4">
        <p className="text-xs uppercase tracking-wide text-stone-500">
          {categoría}
        </p>
        <div className="mt-2 flex items-start justify-between gap-3">
          <h3 className="text-sm font-semibold text-stone-800">{nombre}</h3>
          <p className="shrink-0 text-sm text-stone-600">{precio}</p>
        </div>
      </div>
    </Link>
  )
}
