import { Link } from 'react-router-dom'
import { STOCK_CARRITO_SIN_LIMITE } from '../../contexts/CartContext'
import { useCart } from '../../hooks/useCart'
import { formatPrice } from '../../utils/formatPrice'

const ICONO_CARRITO = (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4"
  >
    <path d="M6 8h12l-1 12H7L6 8Z" />
    <path d="M9 8a3 3 0 0 1 6 0" />
  </svg>
)

type ProductCardProps = {
  /** Id numérico: la ruta /productos/${id} se construye aquí, no se almacena. */
  id: number
  nombre: string
  /** Precio en number; el formato $18.00 se aplica solo al renderizar. */
  precio: number
  imagen: string
  categoria: string
  /** null = sin control de stock (nunca se marca agotado). */
  stock: number | null
  /** Etiqueta del maquetado: "Más pedido", "Personalizado", etc. */
  badge?: string
}

export default function ProductCard({
  id,
  nombre,
  precio,
  imagen,
  categoria,
  stock,
  badge,
}: ProductCardProps) {
  const { addItem } = useCart()
  const agotado = stock !== null && stock <= 0

  function agregarAlCarrito(event: React.MouseEvent) {
    // La tarjeta envuelve un Link: el click del botón no debe navegar.
    event.preventDefault()
    event.stopPropagation()
    if (agotado) return

    addItem(
      {
        // El carrito trabaja con ids string: se convierte aquí.
        id: String(id),
        nombre,
        imagen,
        precioUnitario: precio,
        categoría: categoria,
        stock: stock ?? STOCK_CARRITO_SIN_LIMITE,
      },
      1,
    )
  }

  return (
    <article className="group">
      <Link to={`/productos/${id}`} className="block">
        <div className="relative overflow-hidden rounded-2xl bg-cream-soft">
          <img
            src={imagen}
            alt={nombre}
            className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {badge && !agotado && (
            <span
              className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white ${
                badge === 'Más pedido' ? 'bg-rose-brand' : 'bg-brown'
              }`}
            >
              {badge}
            </span>
          )}
          {agotado && (
            <span className="absolute left-3 top-3 rounded-full bg-brown/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
              Agotado
            </span>
          )}
        </div>
      </Link>

      <div className="mt-3 flex items-start justify-between gap-3">
        <Link to={`/productos/${id}`} className="min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-brown-soft">
            {categoria}
          </p>
          <h3 className="mt-1 font-display text-base font-semibold text-brown">
            {nombre}
          </h3>
          <p className="mt-1 text-sm text-brown-soft">{formatPrice(precio)}</p>
        </Link>

        <button
          type="button"
          onClick={agregarAlCarrito}
          disabled={agotado}
          aria-label={`Agregar ${nombre} al carrito`}
          className="mt-5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-rose-brand/50 text-rose-brand transition-colors hover:bg-rose-brand hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-rose-brand"
        >
          {ICONO_CARRITO}
        </button>
      </div>
    </article>
  )
}
