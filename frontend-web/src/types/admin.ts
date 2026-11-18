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

export interface AdminDashboard {
  productos_activos: number
  pedidos_pendientes: number
  pedidos_listos: number
  total_productos_stock_bajo: number
  pagos_pendientes: number
  usuarios_registrados: number
  pedidos_recientes: Array<{ id: string; estado: PedidoEstado; cliente: string; fechaEntrega: string; total: number }>
  productos_stock_bajo: Array<{ id: string; nombre: string; stock: number }>
}

export type ProductoTipo = 'TORTA' | 'DETALLE' | 'SUBLIMACION'
export type PedidoEstado =
  | 'PENDIENTE'
  | 'EN_PREPARACION'
  | 'LISTO'
  | 'ENTREGADO'
  | 'CANCELADO'
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
  /** Referencias a multimedia (urls o nombres de asset mock). La primera es la principal. */
  imagenes: string[]
  /** IDs reales de multimedia alineados con imagenes cuando vienen del backend. */
  imagenIds?: number[]
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
  tipoConfiguracion?: string
  nombreDiseno?: string
  costoDiseno?: number
  personalizacion?: string
  indicaciones?: string
}

export interface AdminOrder {
  id: string
  numero: string
  clienteId?: string
  clienteNombre: string
  clienteCorreo: string
  clienteTelefono: string
  fecha_entrega: string
  tipo_entrega?: 'RETIRO' | 'DOMICILIO'
  subtotal: number
  total: number
  estado: PedidoEstado
  detalles: AdminOrderDetail[]
  direccion?: string
  referencia?: string
  horaEntrega?: string
  telefonoContacto?: string
  pagoId?: string
  pagoMonto?: number
  metodo_pago?: PagoMetodo
  pago_estado?: PagoEstado | null
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
  fechaRegistro?: string
  pedidoEstado?: PedidoEstado
  comprobanteId?: string
  fechaRevision?: string
  revisorId?: string
  comentarioRevision?: string
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
  rutaArchivo?: string
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
