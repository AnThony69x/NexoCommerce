/**
 * Servicio de productos contra el backend real (GET /api/v1/productos).
 * NO decide mock/real (eso es productsRepository): aquí solo hay HTTP y
 * mappers de snake_case → modelo UI.
 *
 * - precio SIEMPRE number (precio_base). El formato $18.00 se aplica SOLO al
 *   renderizar (utils/formatPrice); aquí jamás se manipula como cadena.
 * - GET /productos pagina (meta.total_paginas); listarProductos recorre todas
 *   las páginas porque la UI trabaja con el catálogo completo.
 * - GET /productos/{id} devuelve null cuando responde 404 (la página muestra
 *   "Producto no encontrado"); cualquier otro error se propaga sin fallback.
 */
import { apiClient } from './api'
import { getCategories } from './categoriesService'
import { ApiError } from '../types/api'
import type { ApiEnvelope, ApiEnvelopePaginado, ApiMetaPaginacion } from '../types/api'
import type { CategoryNode } from '../types/category'
import type {
  Product,
  ProductDetalle,
  ProductoDetalleApi,
  ProductoDiseno,
  ProductoDisenoApi,
  ProductoListadoApi,
} from '../types/product'

/** Tope de seguridad al recorrer páginas (protege contra meta inconsistente). */
const MAXIMO_PAGINAS = 100

// ---------------------------------------------------------------------------
// Mappers (respuesta backend → modelo UI)
// ---------------------------------------------------------------------------

function aDiseno(api: ProductoDisenoApi): ProductoDiseno {
  return {
    id: Number(api.id),
    nombre: api.nombre,
    descripcion: api.descripcion,
    costo_adicional: Number(api.costo_adicional),
    multimedia_id: api.multimedia_id,
    activo: api.activo,
  }
}

function aProducto(api: ProductoListadoApi): Product {
  return {
    id: Number(api.id),
    tipo: api.tipo,
    nombre: api.nombre,
    descripcion: api.descripcion,
    precio: Number(api.precio_base),
    activo: api.activo,
    categoria: { id: Number(api.categoria.id), nombre: api.categoria.nombre },
    imagen: api.imagen_principal?.url ?? null,
    // stock: solo DETALLE lo informa; el resto queda null (disponible).
    stock: api.detalle?.stock ?? null,
  }
}

function aProductDetalle(
  api: ProductoDetalleApi,
  nombreCategoria: string | null,
): ProductDetalle {
  return {
    id: Number(api.id),
    tipo: api.tipo,
    nombre: api.nombre,
    descripcion: api.descripcion,
    precio: Number(api.precio_base),
    activo: api.activo,
    stock: api.detalle?.stock ?? null,
    categoria: { id: Number(api.categoria_id), nombre: nombreCategoria },
    imagenes: api.imagenes.map((imagen) => ({
      id: Number(imagen.id),
      ruta_archivo: imagen.ruta_archivo,
      url: imagen.url,
      orden: imagen.orden,
      es_principal: imagen.es_principal,
    })),
    torta: api.torta
      ? {
          tamano: api.torta.tamano,
          porciones: api.torta.porciones,
          sabor: api.torta.sabor,
          disenos: api.torta.disenos.map(aDiseno),
        }
      : null,
    detalle: api.detalle ? { stock: Number(api.detalle.stock) } : null,
    sublimacion: api.sublimacion
      ? {
          tipo_material: api.sublimacion.tipo_material,
          plantillas: api.sublimacion.plantillas.map(aDiseno),
        }
      : null,
  }
}

/** Busca el nombre de una categoría en el árbol (recursivo, por id). */
function buscarNombreCategoria(nodos: CategoryNode[], id: number): string | null {
  for (const nodo of nodos) {
    if (nodo.id === id) return nodo.nombre
    const nombreHijo = buscarNombreCategoria(nodo.subcategorias, id)
    if (nombreHijo !== null) return nombreHijo
  }
  return null
}

// ---------------------------------------------------------------------------
// Endpoints
// ---------------------------------------------------------------------------

async function listarPagina(
  pagina: number,
): Promise<{ productos: Product[]; meta: ApiMetaPaginacion }> {
  const { data } = await apiClient.get<ApiEnvelopePaginado<ProductoListadoApi>>(
    '/productos',
    { params: { page: pagina } },
  )
  return { productos: data.data.map(aProducto), meta: data.meta }
}

/**
 * GET /productos → catálogo COMPLETO recorriendo todas las páginas que
 * reporte meta.total_paginas (el backend pagina en por_pagina; la UI y los
 * mocks trabajan con la lista completa).
 */
export async function listarProductos(): Promise<Product[]> {
  const primera = await listarPagina(1)
  const productos = [...primera.productos]
  let paginaActual = 1
  let totalPaginas = primera.meta.total_paginas

  while (paginaActual < totalPaginas && paginaActual < MAXIMO_PAGINAS) {
    paginaActual += 1
    const siguiente = await listarPagina(paginaActual)
    productos.push(...siguiente.productos)
    totalPaginas = siguiente.meta.total_paginas
  }

  return productos
}

/**
 * GET /productos/{id} → detalle con el nombre de categoría resuelto desde el
 * árbol de categorías (el detalle solo envía categoria_id). Se piden en
 * paralelo producto y árbol; si falla alguno, el error se propaga.
 * 404 → null (la UI muestra "Producto no encontrado").
 */
export async function obtenerProducto(
  id: number,
): Promise<ProductDetalle | null> {
  if (!Number.isInteger(id) || id < 1) return null

  try {
    const [respuesta, arbol] = await Promise.all([
      apiClient.get<ApiEnvelope<ProductoDetalleApi>>(`/productos/${id}`),
      getCategories(),
    ])
    const detalleApi = respuesta.data.data
    const nombreCategoria = buscarNombreCategoria(arbol, detalleApi.categoria_id)
    return aProductDetalle(detalleApi, nombreCategoria)
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null
    throw error
  }
}
