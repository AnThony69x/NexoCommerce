/**
 * Categorías públicas mock (VITE_MOCK_MODE=true).
 *
 * Se expresan en el MISMO contrato que devuelve el backend (CategoryNode,
 * ver src/types/category.ts) para que la UI reciba una estructura idéntica
 * sin importar el modo. Los nombres reutilizan las constantes de
 * products.mock.ts (fuente única de cadenas) y las descripciones/ imágenes
 * replican el contenido que hoy muestra CategoriesSection en HomePage.
 */
import bakeryPlaceholder from '../assets/category-bakery-placeholder.svg'
import detailsPlaceholder from '../assets/category-details-placeholder.svg'
import sublimationPlaceholder from '../assets/category-sublimation-placeholder.svg'
import {
  CATEGORIA_DETALLES,
  CATEGORIA_REPOSTERIA,
  CATEGORIA_SUBLIMACION,
} from './products.mock'
import type { CategoryNode } from '../types/category'

export const categoriesMock: CategoryNode[] = [
  {
    id: 1,
    categoria_padre_id: null,
    nombre: CATEGORIA_REPOSTERIA,
    descripcion: 'Tortas, dulces y creaciones para compartir.',
    imagen: {
      id: 1,
      ruta_archivo: 'mock/category-bakery-placeholder.svg',
      url: bakeryPlaceholder,
    },
    activo: true,
    subcategorias: [],
  },
  {
    id: 2,
    categoria_padre_id: null,
    nombre: CATEGORIA_DETALLES,
    descripcion: 'Regalos pensados especialmente para ti.',
    imagen: {
      id: 2,
      ruta_archivo: 'mock/category-details-placeholder.svg',
      url: detailsPlaceholder,
    },
    activo: true,
    subcategorias: [],
  },
  {
    id: 3,
    categoria_padre_id: null,
    nombre: CATEGORIA_SUBLIMACION,
    descripcion: 'Objetos únicos con tu estilo y tus ideas.',
    imagen: {
      id: 3,
      ruta_archivo: 'mock/category-sublimation-placeholder.svg',
      url: sublimationPlaceholder,
    },
    activo: true,
    subcategorias: [],
  },
]
