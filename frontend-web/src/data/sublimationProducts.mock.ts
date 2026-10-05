import detailsPlaceholder from '../assets/category-details-placeholder.svg'
import mugPlaceholder from '../assets/product-mug-placeholder.svg'
import type { Product } from '../types/product'

export const sublimationProducts: Product[] = [
  {
    id: 'taza-flores-nombre',
    nombre: 'Taza Flores & Nombre',
    precio: '$18.00',
    imagen: mugPlaceholder,
    categoría: 'Tazas',
    href: '/productos/taza-flores-nombre',
    disponible: true,
  },
  {
    id: 'taza-mensaje-especial',
    nombre: 'Taza Mensaje Especial',
    precio: '$16.00',
    imagen: detailsPlaceholder,
    categoría: 'Tazas',
    href: '/productos/taza-mensaje-especial',
    disponible: true,
  },
  {
    id: 'set-sublimado-celebracion',
    nombre: 'Set Sublimado Celebración',
    precio: '$26.00',
    imagen: mugPlaceholder,
    categoría: 'Sets personalizados',
    href: '/productos/set-sublimado-celebracion',
    disponible: true,
  },
  {
    id: 'detalle-sublimado-especial',
    nombre: 'Detalle Sublimado Especial',
    precio: '$22.00',
    imagen: detailsPlaceholder,
    categoría: 'Detalles sublimados',
    href: '/productos/detalle-sublimado-especial',
    disponible: true,
  },
]
