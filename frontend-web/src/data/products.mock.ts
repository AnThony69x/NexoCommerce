/**
 * Datos mock de productos (VITE_MOCK_MODE=true).
 *
 * Estructura canónica = detalle (ProductDetalle), igual que el backend: de
 * aquí se deriva la proyección de listado (Product), replicando lo que hace
 * ProductoListadoResource. Los ids numéricos y la categoría {id, nombre}
 * coinciden con src/data/categories.mock.ts (Repostería=1, Detalles=2,
 * Sublimación=3).
 *
 * El stock se autora en TODOS los productos (disponibilidad local), tal como
 * hasta hoy: los mocks no siguen la restricción de que solo DETALLE tenga
 * stock del backend.
 */
import bakeryCategoryPlaceholder from '../assets/category-bakery-placeholder.svg'
import detailsCategoryPlaceholder from '../assets/category-details-placeholder.svg'
import boxPlaceholder from '../assets/product-box-placeholder.svg'
import cakePlaceholder from '../assets/product-cake-placeholder.svg'
import dessertPlaceholder from '../assets/product-dessert-placeholder.svg'
import mugPlaceholder from '../assets/product-mug-placeholder.svg'
import type {
  Product,
  ProductDetalle,
  ProductoImagenDetalle,
  ProductoTipo,
} from '../types/product'

export const CATEGORIA_REPOSTERIA = 'Repostería'
export const CATEGORIA_DETALLES = 'Detalles personalizados'
export const CATEGORIA_SUBLIMACION = 'Sublimación'

export type NombreCategoriaMock =
  | typeof CATEGORIA_REPOSTERIA
  | typeof CATEGORIA_DETALLES
  | typeof CATEGORIA_SUBLIMACION

/** ids de categorías mock, alineados con src/data/categories.mock.ts. */
const IDS_CATEGORIAS_MOCK: Record<NombreCategoriaMock, number> = {
  [CATEGORIA_REPOSTERIA]: 1,
  [CATEGORIA_DETALLES]: 2,
  [CATEGORIA_SUBLIMACION]: 3,
}

type ProductoMockDef = {
  id: number
  tipo: ProductoTipo
  nombre: string
  descripcion: string
  /** Precio en number (nunca cadena con "$"). */
  precio: number
  categoria: NombreCategoriaMock
  stock: number
  imagenPrincipal: string
  /** Solo para TORTA. */
  torta?: { tamano: string; porciones: number; sabor: string }
  /** Solo para SUBLIMACION. */
  sublimacion?: { tipo_material: string }
}

const DEFS: ProductoMockDef[] = [
  {
    id: 1,
    tipo: 'TORTA',
    nombre: 'Torta Jardín de Rosas',
    descripcion: 'Bizcocho de vainilla con decoración floral en crema pastelera.',
    precio: 45,
    categoria: CATEGORIA_REPOSTERIA,
    stock: 20,
    imagenPrincipal: cakePlaceholder,
    torta: { tamano: 'Mediana', porciones: 12, sabor: 'Vainilla' },
  },
  {
    id: 2,
    tipo: 'TORTA',
    nombre: 'Cheesecake de Frutos Rojos',
    descripcion: 'Cheesecake horneado con cobertura de frutos rojos frescos.',
    precio: 28,
    categoria: CATEGORIA_REPOSTERIA,
    stock: 12,
    imagenPrincipal: dessertPlaceholder,
    torta: { tamano: 'Grande', porciones: 10, sabor: 'Queso' },
  },
  {
    id: 3,
    tipo: 'TORTA',
    nombre: 'Tarta Celebración',
    descripcion: 'Tarta artesanal con base de frutas de temporada.',
    precio: 35,
    categoria: CATEGORIA_REPOSTERIA,
    stock: 8,
    imagenPrincipal: bakeryCategoryPlaceholder,
    torta: { tamano: 'Mediana', porciones: 8, sabor: 'Frutas' },
  },
  {
    id: 4,
    tipo: 'DETALLE',
    nombre: 'Postre de Frutos Rojos',
    descripcion: 'Postre individual de frutos rojos en copa de cristal.',
    precio: 22,
    categoria: CATEGORIA_REPOSTERIA,
    stock: 0,
    imagenPrincipal: dessertPlaceholder,
  },
  {
    id: 5,
    tipo: 'DETALLE',
    nombre: 'Caja Dulce Celebración',
    descripcion: 'Caja assortiment de dulces con lazo y tarjeta personalizada.',
    precio: 32,
    categoria: CATEGORIA_DETALLES,
    stock: 15,
    imagenPrincipal: boxPlaceholder,
  },
  {
    id: 6,
    tipo: 'DETALLE',
    nombre: 'Kit Regalo Especial',
    descripcion: 'Kit de regalo con snacks dulces y detalles coordinados.',
    precio: 38,
    categoria: CATEGORIA_DETALLES,
    stock: 6,
    imagenPrincipal: detailsCategoryPlaceholder,
  },
  {
    id: 7,
    tipo: 'DETALLE',
    nombre: 'Postre Personalizado',
    descripcion: 'Postre preparado a pedido con mensaje escrito a mano.',
    precio: 24,
    categoria: CATEGORIA_DETALLES,
    stock: 9,
    imagenPrincipal: dessertPlaceholder,
  },
  {
    id: 8,
    tipo: 'SUBLIMACION',
    nombre: 'Taza Flores & Nombre',
    descripcion: 'Taza de cerámica con diseño floral y nombre a elección.',
    precio: 18,
    categoria: CATEGORIA_SUBLIMACION,
    stock: 25,
    imagenPrincipal: mugPlaceholder,
    sublimacion: { tipo_material: 'Cerámica' },
  },
  {
    id: 9,
    tipo: 'SUBLIMACION',
    nombre: 'Taza Mensaje Especial',
    descripcion: 'Taza de cerámica con mensaje especial estampado.',
    precio: 16,
    categoria: CATEGORIA_SUBLIMACION,
    stock: 30,
    imagenPrincipal: detailsCategoryPlaceholder,
    sublimacion: { tipo_material: 'Cerámica' },
  },
  {
    id: 10,
    tipo: 'SUBLIMACION',
    nombre: 'Set Sublimado Celebración',
    descripcion: 'Set sublimado con taza y libreta para regalar en pareja.',
    precio: 26,
    categoria: CATEGORIA_SUBLIMACION,
    stock: 10,
    imagenPrincipal: mugPlaceholder,
    sublimacion: { tipo_material: 'Acero inoxidable' },
  },
  {
    id: 11,
    tipo: 'SUBLIMACION',
    nombre: 'Detalle Sublimado Especial',
    descripcion: 'Detalle sublimado con lámina y mensaje personalizado.',
    precio: 22,
    categoria: CATEGORIA_SUBLIMACION,
    stock: 7,
    imagenPrincipal: detailsCategoryPlaceholder,
    sublimacion: { tipo_material: 'MDF' },
  },
]

/**
 * Galería mock: imagen principal + vistas temporales. Conserva la galería de
 * 3 imágenes que mostraba ProductDetailPage antes de la integración.
 */
function imagenesMock(id: number, principal: string): ProductoImagenDetalle[] {
  return [
    {
      id: id * 100 + 1,
      ruta_archivo: `mock/producto-${id}-principal.svg`,
      url: principal,
      orden: 0,
      es_principal: true,
    },
    {
      id: id * 100 + 2,
      ruta_archivo: 'mock/product-box-placeholder.svg',
      url: boxPlaceholder,
      orden: 1,
      es_principal: false,
    },
    {
      id: id * 100 + 3,
      ruta_archivo: 'mock/product-dessert-placeholder.svg',
      url: dessertPlaceholder,
      orden: 2,
      es_principal: false,
    },
  ]
}

function construirDetalle(def: ProductoMockDef): ProductDetalle {
  return {
    id: def.id,
    tipo: def.tipo,
    nombre: def.nombre,
    descripcion: def.descripcion,
    precio: def.precio,
    activo: true,
    stock: def.stock,
    categoria: { id: IDS_CATEGORIAS_MOCK[def.categoria], nombre: def.categoria },
    imagenes: imagenesMock(def.id, def.imagenPrincipal),
    torta: def.torta ? { ...def.torta, disenos: [] } : null,
    detalle: def.tipo === 'DETALLE' ? { stock: def.stock } : null,
    sublimacion: def.sublimacion ? { ...def.sublimacion, plantillas: [] } : null,
  }
}

/** Detalle mock canónico: fuente de verdad de los datos locales. */
export const productosDetalleMock: ProductDetalle[] = DEFS.map(construirDetalle)

/** Proyección de listado (equivalente a ProductoListadoResource). */
function aProductoListado(detalle: ProductDetalle): Product {
  const principal =
    detalle.imagenes.find((imagen) => imagen.es_principal) ??
    detalle.imagenes[0] ??
    null

  return {
    id: detalle.id,
    tipo: detalle.tipo,
    nombre: detalle.nombre,
    descripcion: detalle.descripcion,
    precio: detalle.precio,
    activo: detalle.activo,
    stock: detalle.stock,
    categoria: {
      id: detalle.categoria.id,
      nombre: detalle.categoria.nombre ?? '',
    },
    imagen: principal?.url ?? null,
  }
}

export const productsMock: Product[] = productosDetalleMock.map(aProductoListado)
