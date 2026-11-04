/**
 * Tipos de productos: contrato crudo del backend (snake_case) y modelo UI.
 * Fuente: docs/04-api/specs/04-productos.spec.md y los Resources
 * ProductoListadoResource / ProductoDetalleResource / DisenoResource.
 *
 * Reglas clave del módulo:
 * - id SIEMPRE number (seriales del backend). Las rutas se construyen en UI
 *   como `/productos/${id}`; el dato NUNCA almacena href.
 * - precio SIEMPRE number (proviene de precio_base; el formato $18.00 se
 *   aplica SOLO al renderizar con utils/formatPrice).
 * - stock solo lo informa el backend para DETALLE; en TORTA/SUBLIMACION es
 *   null (sin control de inventario) y el producto se asume disponible.
 * - El tipo (TORTA/DETALLE/SUBLIMACION) es derivado: una única especialización.
 */

// ---------------------------------------------------------------------------
// Contrato crudo (respuesta HTTP) — solo para mappers de services.
// ---------------------------------------------------------------------------

export type ProductoTipo = 'TORTA' | 'DETALLE' | 'SUBLIMACION'

/** Imagen en GET /productos (sin orden). */
export interface ProductoImagenListadoApi {
  id: number
  ruta_archivo: string
  url: string | null
  es_principal: boolean
}

/** Imagen en GET /productos/{id} (con orden). */
export interface ProductoImagenDetalleApi {
  id: number
  ruta_archivo: string
  url: string | null
  orden: number
  es_principal: boolean
}

/** Diseño de torta o plantilla de sublimación (DisenoResource). */
export interface ProductoDisenoApi {
  id: number
  nombre: string
  descripcion: string | null
  costo_adicional: number
  multimedia_id: number | null
  activo: boolean
}

/** data de GET /productos (elemento del listado paginado). */
export interface ProductoListadoApi {
  id: number
  tipo: ProductoTipo
  nombre: string
  descripcion: string | null
  precio_base: number
  activo: boolean
  categoria: { id: number; nombre: string }
  imagen_principal: ProductoImagenListadoApi | null
  torta: { tamano: string; porciones: number; sabor: string } | null
  detalle: { stock: number } | null
  sublimacion: { tipo_material: string } | null
}

/** data de GET /productos/{id} (detalle completo). */
export interface ProductoDetalleApi {
  id: number
  tipo: ProductoTipo
  nombre: string
  descripcion: string | null
  precio_base: number
  activo: boolean
  /** El detalle NO incluye el nombre de categoría: solo el id. */
  categoria_id: number
  imagenes: ProductoImagenDetalleApi[]
  torta: {
    tamano: string
    porciones: number
    sabor: string
    disenos: ProductoDisenoApi[]
  } | null
  detalle: { stock: number } | null
  sublimacion: {
    tipo_material: string
    plantillas: ProductoDisenoApi[]
  } | null
}

// ---------------------------------------------------------------------------
// Modelo UI (lo que consumen los componentes).
// ---------------------------------------------------------------------------

export interface ProductoCategoria {
  id: number
  nombre: string
}

/** Diseño/plantilla (versión UI). */
export interface ProductoDiseno {
  id: number
  nombre: string
  descripcion: string | null
  costo_adicional: number
  multimedia_id: number | null
  activo: boolean
}

export interface ProductoImagenDetalle {
  id: number
  ruta_archivo: string
  url: string | null
  orden: number
  es_principal: boolean
}

export interface ProductoTortaDetalle {
  tamano: string
  porciones: number
  sabor: string
  disenos: ProductoDiseno[]
}

export interface ProductoSublimacionDetalle {
  tipo_material: string
  plantillas: ProductoDiseno[]
}

export interface ProductoInventario {
  stock: number
}

/** Campos comunes de listado y detalle. */
export interface ProductoBase {
  id: number
  tipo: ProductoTipo
  nombre: string
  descripcion: string | null
  /** precio_base como number. El formato $18.00 solo al renderizar. */
  precio: number
  activo: boolean
  /**
   * Disponibilidad para la UI: number cuando el origen informa inventario
   * (DETALLE en backend; todos los datos mock). null = sin control de stock
   * (TORTA/SUBLIMACION en backend) y se asume disponible.
   */
  stock: number | null
}

/** Producto para grids, tarjetas y filtros (GET /productos). */
export interface Product extends ProductoBase {
  categoria: ProductoCategoria
  /** URL de imagen_principal; null si no hay multimedia. */
  imagen: string | null
}

/** Detalle completo para la página de producto (GET /productos/{id}). */
export interface ProductDetalle extends ProductoBase {
  /**
   * El backend solo envía categoria_id; el nombre se resuelve con el árbol
   * de categorías en el repositorio (null si no se encuentra).
   */
  categoria: { id: number; nombre: string | null }
  imagenes: ProductoImagenDetalle[]
  torta: ProductoTortaDetalle | null
  detalle: ProductoInventario | null
  sublimacion: ProductoSublimacionDetalle | null
}
