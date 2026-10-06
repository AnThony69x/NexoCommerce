import type { AdminProductionConfig } from '../../types/admin'

export const adminProductionMock: AdminProductionConfig[] = [
  {
    id: 'prod-cap-001',
    fecha: '2026-10-12',
    categoriaId: 'cat-reposteria',
    categoriaNombre: 'Repostería',
    capacidad_maxima: 20,
    capacidad_ocupada: 18,
    activo: true,
  },
  {
    id: 'prod-cap-002',
    fecha: '2026-10-13',
    categoriaId: 'cat-detalles',
    categoriaNombre: 'Detalles',
    capacidad_maxima: 30,
    capacidad_ocupada: 10,
    activo: true,
  },
  {
    id: 'prod-cap-003',
    fecha: '2026-10-14',
    categoriaId: 'cat-sublimacion',
    categoriaNombre: 'Sublimación',
    capacidad_maxima: 15,
    capacidad_ocupada: 2,
    activo: false,
  },
]
