import type { AdminCategory } from '../../types/admin'

export const adminCategoriesMock: AdminCategory[] = [
  {
    id: 'cat-reposteria',
    nombre: 'Repostería',
    descripcion: 'Tortas y postres artesanales.',
    categoria_padre_id: null,
    activo: true,
  },
  {
    id: 'cat-detalles',
    nombre: 'Detalles',
    descripcion: 'Regalos y cajas personalizadas.',
    categoria_padre_id: null,
    activo: true,
  },
  {
    id: 'cat-sublimacion',
    nombre: 'Sublimación',
    descripcion: 'Productos sublimados.',
    categoria_padre_id: null,
    activo: true,
  },
  {
    id: 'cat-tortas-clasicas',
    nombre: 'Tortas clásicas',
    descripcion: 'Subcategoría mock de repostería.',
    categoria_padre_id: 'cat-reposteria',
    activo: true,
  },
  {
    id: 'cat-cajas',
    nombre: 'Cajas de regalo',
    descripcion: 'Subcategoría mock de detalles.',
    categoria_padre_id: 'cat-detalles',
    activo: false,
  },
]
