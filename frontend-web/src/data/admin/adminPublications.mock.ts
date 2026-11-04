import type { AdminPublication } from '../../types/admin'

export const adminPublicationsMock: AdminPublication[] = [
  {
    id: 'pub-001',
    titulo: 'Nueva colección de tortas',
    descripcion: 'Anuncio mock de temporada.',
    categoriaId: 'cat-reposteria',
    categoriaNombre: 'Repostería',
    productoId: 'prod-torta-001',
    productoNombre: 'Torta Jardín de Rosas',
    multimediaUrl: 'hero-placeholder.svg (mock)',
    activo: true,
  },
  {
    id: 'pub-002',
    titulo: 'Detalles para celebrar',
    descripcion: 'Publicación mock inactiva.',
    categoriaId: 'cat-detalles',
    categoriaNombre: 'Detalles',
    activo: false,
  },
]
