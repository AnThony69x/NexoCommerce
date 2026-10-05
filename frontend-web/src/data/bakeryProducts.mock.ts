import bakeryPlaceholder from '../assets/category-bakery-placeholder.svg'
import cakePlaceholder from '../assets/product-cake-placeholder.svg'
import dessertPlaceholder from '../assets/product-dessert-placeholder.svg'
import type { Product } from '../types/product'

export const bakeryProducts: Product[] = [
  {
    id: 'torta-jardin-de-rosas',
    nombre: 'Torta Jardín de Rosas',
    precio: '$45.00',
    imagen: cakePlaceholder,
    categoría: 'Tortas',
    href: '/productos/torta-jardin-de-rosas',
    disponible: true,
  },
  {
    id: 'cheesecake-frutos-rojos',
    nombre: 'Cheesecake de Frutos Rojos',
    precio: '$28.00',
    imagen: dessertPlaceholder,
    categoría: 'Cheesecakes',
    href: '/productos/cheesecake-frutos-rojos',
    disponible: true,
  },
  {
    id: 'tarta-celebracion',
    nombre: 'Tarta Celebración',
    precio: '$35.00',
    imagen: bakeryPlaceholder,
    categoría: 'Tartas',
    href: '/productos/tarta-celebracion',
    disponible: true,
  },
  {
    id: 'postre-frutos-rojos',
    nombre: 'Postre de Frutos Rojos',
    precio: '$22.00',
    imagen: dessertPlaceholder,
    categoría: 'Postres',
    href: '/productos/postre-frutos-rojos',
    disponible: true,
  },
]
