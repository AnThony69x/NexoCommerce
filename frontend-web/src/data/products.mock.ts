import bakeryCategoryPlaceholder from '../assets/category-bakery-placeholder.svg'
import detailsCategoryPlaceholder from '../assets/category-details-placeholder.svg'
import boxPlaceholder from '../assets/product-box-placeholder.svg'
import cakePlaceholder from '../assets/product-cake-placeholder.svg'
import dessertPlaceholder from '../assets/product-dessert-placeholder.svg'
import mugPlaceholder from '../assets/product-mug-placeholder.svg'
import type { Product } from '../types/product'

export const CATEGORIA_REPOSTERIA = 'Repostería'
export const CATEGORIA_DETALLES = 'Detalles personalizados'
export const CATEGORIA_SUBLIMACION = 'Sublimación'

export const productsMock: Product[] = [
  {
    id: 'torta-jardin-de-rosas',
    nombre: 'Torta Jardín de Rosas',
    precio: 45,
    imagen: cakePlaceholder,
    categoría: CATEGORIA_REPOSTERIA,
    href: '/productos/torta-jardin-de-rosas',
    disponible: true,
  },
  {
    id: 'cheesecake-frutos-rojos',
    nombre: 'Cheesecake de Frutos Rojos',
    precio: 28,
    imagen: dessertPlaceholder,
    categoría: CATEGORIA_REPOSTERIA,
    href: '/productos/cheesecake-frutos-rojos',
    disponible: true,
  },
  {
    id: 'tarta-celebracion',
    nombre: 'Tarta Celebración',
    precio: 35,
    imagen: bakeryCategoryPlaceholder,
    categoría: CATEGORIA_REPOSTERIA,
    href: '/productos/tarta-celebracion',
    disponible: true,
  },
  {
    id: 'postre-frutos-rojos',
    nombre: 'Postre de Frutos Rojos',
    precio: 22,
    imagen: dessertPlaceholder,
    categoría: CATEGORIA_REPOSTERIA,
    href: '/productos/postre-frutos-rojos',
    disponible: true,
  },
  {
    id: 'caja-dulce-celebracion',
    nombre: 'Caja Dulce Celebración',
    precio: 32,
    imagen: boxPlaceholder,
    categoría: CATEGORIA_DETALLES,
    href: '/productos/caja-dulce-celebracion',
    disponible: true,
  },
  {
    id: 'kit-regalo-especial',
    nombre: 'Kit Regalo Especial',
    precio: 38,
    imagen: detailsCategoryPlaceholder,
    categoría: CATEGORIA_DETALLES,
    href: '/productos/kit-regalo-especial',
    disponible: true,
  },
  {
    id: 'postre-personalizado',
    nombre: 'Postre Personalizado',
    precio: 24,
    imagen: dessertPlaceholder,
    categoría: CATEGORIA_DETALLES,
    href: '/productos/postre-personalizado',
    disponible: true,
  },
  {
    id: 'taza-flores-nombre',
    nombre: 'Taza Flores & Nombre',
    precio: 18,
    imagen: mugPlaceholder,
    categoría: CATEGORIA_SUBLIMACION,
    href: '/productos/taza-flores-nombre',
    disponible: true,
  },
  {
    id: 'taza-mensaje-especial',
    nombre: 'Taza Mensaje Especial',
    precio: 16,
    imagen: detailsCategoryPlaceholder,
    categoría: CATEGORIA_SUBLIMACION,
    href: '/productos/taza-mensaje-especial',
    disponible: true,
  },
  {
    id: 'set-sublimado-celebracion',
    nombre: 'Set Sublimado Celebración',
    precio: 26,
    imagen: mugPlaceholder,
    categoría: CATEGORIA_SUBLIMACION,
    href: '/productos/set-sublimado-celebracion',
    disponible: true,
  },
  {
    id: 'detalle-sublimado-especial',
    nombre: 'Detalle Sublimado Especial',
    precio: 22,
    imagen: detailsCategoryPlaceholder,
    categoría: CATEGORIA_SUBLIMACION,
    href: '/productos/detalle-sublimado-especial',
    disponible: true,
  },
]

export const bakeryProducts: Product[] = productsMock.filter(
  (product) => product.categoría === CATEGORIA_REPOSTERIA,
)

export const detailsProducts: Product[] = productsMock.filter(
  (product) => product.categoría === CATEGORIA_DETALLES,
)

export const sublimationProducts: Product[] = productsMock.filter(
  (product) => product.categoría === CATEGORIA_SUBLIMACION,
)

export function obtenerProductoPorId(id: string): Product | undefined {
  return productsMock.find((product) => product.id === id)
}

export function obtenerRelacionados(
  excluirId: string,
  limite = 3,
): Product[] {
  return productsMock.filter((product) => product.id !== excluirId).slice(0, limite)
}
