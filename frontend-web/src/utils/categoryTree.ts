import type { CategoryNode } from '../types/category'

export function incluirCategoriasActivas(categoria: CategoryNode, ids: Set<number>) {
  if (!categoria.activo) return

  ids.add(categoria.id)
  for (const hija of categoria.subcategorias) {
    incluirCategoriasActivas(hija, ids)
  }
}
