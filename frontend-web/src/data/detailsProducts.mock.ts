import detailsPlaceholder from '../assets/category-details-placeholder.svg'
import dessertPlaceholder from '../assets/product-dessert-placeholder.svg'
import boxPlaceholder from '../assets/product-box-placeholder.svg'
import mugPlaceholder from '../assets/product-mug-placeholder.svg'
import type { Product } from '../types/product'

export const detailsProducts: Product[] = [
  {
    id: 'caja-dulce-celebracion',
    nombre: 'Caja Dulce Celebración',
    precio: '$32.00',
    imagen: boxPlaceholder,
    categoría: 'Cajas de regalo',
    href: '/productos/caja-dulce-celebracion',
    disponible: true,
  },
  {
    id: 'taza-flores-nombre',
    nombre: 'Taza Flores & Nombre',
    precio: '$18.00',
    imagen: mugPlaceholder,
    categoría: 'Detalles personalizados',
    href: '/productos/taza-flores-nombre',
    disponible: true,
  },
  {
    id: 'kit-regalo-especial',
    nombre: 'Kit Regalo Especial',
    precio: '$38.00',
    imagen: detailsPlaceholder,
    categoría: 'Kits personalizados',
    href: '/productos/kit-regalo-especial',
    disponible: true,
  },
  {
    id: 'postre-personalizado',
    nombre: 'Postre Personalizado',
    precio: '$24.00',
    imagen: dessertPlaceholder,
    categoría: 'Detalles dulces',
    href: '/productos/postre-personalizado',
    disponible: true,
  },
]
