import { Link } from 'react-router-dom'
import { formatPrice } from '../../utils/formatPrice'

type ProductCardProps = {
  nombre: string
  precio: number
  imagen: string
  href: string
}

export default function ProductCard({
  nombre,
  precio,
  imagen,
  href,
}: ProductCardProps) {
  return (
    <Link to={href} className="group block">
      <div className="overflow-hidden rounded-xl bg-stone-100">
        <img
          src={imagen}
          alt={nombre}
          className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="mt-3 flex items-start justify-between gap-3">
        <h3 className="text-sm font-medium text-stone-800">{nombre}</h3>
        <p className="shrink-0 text-sm text-stone-600">{formatPrice(precio)}</p>
      </div>
    </Link>
  )
}
