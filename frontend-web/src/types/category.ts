/**
 * Contrato real de categoría según el backend (GET /api/v1/categorias).
 * Fuente: App\Http\Resources\CategoriaArbolResource (árbol con subcategorias).
 * No inventar campos: se replica exactamente el shape del backend.
 */

export interface CategoryImagen {
  id: number
  ruta_archivo: string
  /** URL pública completa; null si el backend no tiene base de multimedia. */
  url: string | null
}

export interface CategoryNode {
  id: number
  categoria_padre_id: number | null
  nombre: string
  descripcion: string | null
  imagen: CategoryImagen | null
  activo: boolean
  /** Árbol recursivo de subcategorías. */
  subcategorias: CategoryNode[]
}
