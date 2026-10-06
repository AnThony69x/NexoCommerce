export interface AdminQuickAccessItem {
  titulo: string
  descripcion: string
  href: string
}

export interface AdminSummaryItem {
  etiqueta: string
  valor: string
  detalle: string
}

export type ProductoTipo = 'TORTA' | 'DETALLE' | 'SUBLIMACION'
export type PedidoEstado =
  | 'PENDIENTE'
  | 'EN_PREPARACION'
  | 'LISTO'
  | 'ENTREGADO'
export type PagoMetodo = 'PASARELA' | 'TRANSFERENCIA'
export type PagoEstado = 'PENDIENTE' | 'APROBADO' | 'RECHAZADO'

export interface AdminProduct {
  id: string
  nombre: string
  descripcion: string
  categoriaId: string
  categoriaNombre: string
  tipo: ProductoTipo
  precio_base: number
  activo: boolean
  tamano?: string
  porciones?: number
  sabor?: string
  stock?: number
  tipo_material?: string
}

export interface AdminCategory {
  id: string
  nombre: string
  descripcion: string
  categoria_padre_id: string | null
  activo: boolean
}

export interface AdminOrderDetail {
  id: string
  productoNombre: string
  cantidad: number
  precio_unitario: number
  subtotal: number
  personalizacion?: string
}

export interface AdminOrder {
  id: string
  numero: string
  clienteNombre: string
  clienteCorreo: string
  clienteTelefono: string
  fecha_entrega: string
  subtotal: number
  total: number
  estado: PedidoEstado
  detalles: AdminOrderDetail[]
}

export interface AdminPayment {
  id: string
  pedidoId: string
  pedidoNumero: string
  metodo: PagoMetodo
  monto: number
  estado: PagoEstado
  referencia: string
  fecha: string
  comprobanteMock?: string
}

export interface AdminUser {
  id: string
  nombre_completo: string
  correo: string
  telefono: string
  rol: 'ADMIN' | 'CLIENTE'
  correo_verificado: boolean
  activo: boolean
}

export interface AdminPublication {
  id: string
  titulo: string
  descripcion: string
  categoriaId?: string
  categoriaNombre?: string
  productoId?: string
  productoNombre?: string
  multimediaUrl?: string
  activo: boolean
}

export interface AdminMedia {
  id: string
  nombre: string
  tipoMime: string
  tamanoKb: number
  ancho?: number
  alto?: number
  url: string
  destino: string
  activo: boolean
}

export interface AdminProductionConfig {
  id: string
  fecha: string
  categoriaId: string
  categoriaNombre: string
  capacidad_maxima: number
  capacidad_ocupada: number
  activo: boolean
}

export interface StoreConfiguration {
  nombre_tienda: string
  logoUrl: string
  faviconUrl: string
  color_primario: string
  color_secundario: string
  color_acento: string
  color_fondo: string
  color_texto: string
  telefono: string
  correo: string
  direccion: string
}

export interface AdminFeedbackMessage {
  tipo: 'exito' | 'error'
  texto: string
}

export const PEDIDO_FLUJO: PedidoEstado[] = [
  'PENDIENTE',
  'EN_PREPARACION',
  'LISTO',
  'ENTREGADO',
]
