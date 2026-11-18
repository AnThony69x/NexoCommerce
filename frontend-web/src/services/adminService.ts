import { apiClient } from './api'
import type { ApiEnvelope, ApiEnvelopePaginado } from '../types/api'
import { config } from '../config/app'
import type {
  AdminCategory,
  AdminDashboard,
  AdminMedia,
  AdminOrder,
  AdminOrderDetail,
  AdminPayment,
  AdminProduct,
  AdminProductionConfig,
  AdminPublication,
  AdminUser,
  PagoEstado,
  PedidoEstado,
  StoreConfiguration,
} from '../types/admin'

type ApiRecord = Record<string, unknown>

function urlMultimedia(api: ApiRecord): string {
  if (typeof api.url === 'string' && api.url !== '') return api.url
  if (typeof api.ruta_archivo !== 'string' || api.ruta_archivo === '') return ''
  const base = (config.apiUrl ?? '').replace(/\/+$/, '')
  return `${base}/multimedia/publico/${api.ruta_archivo}`
}

async function listarTodas<T>(ruta: string, params: Record<string, unknown> = {}) {
  const primera = await apiClient.get<ApiEnvelopePaginado<T>>(ruta, {
    params: { ...params, page: 1 },
  })
  const resultado = [...primera.data.data]
  const total = Math.min(primera.data.meta.total_paginas ?? 1, 100)
  for (let page = 2; page <= total; page += 1) {
    const { data } = await apiClient.get<ApiEnvelopePaginado<T>>(ruta, {
      params: { ...params, page },
    })
    resultado.push(...data.data)
  }
  return resultado
}

function aCategoria(api: ApiRecord): AdminCategory {
  return {
    id: String(api.id),
    nombre: String(api.nombre ?? ''),
    descripcion: String(api.descripcion ?? ''),
    categoria_padre_id:
      api.categoria_padre_id === null || api.categoria_padre_id === undefined
        ? null
        : String(api.categoria_padre_id),
    activo: Boolean(api.activo),
  }
}

function aplanarCategorias(nodos: ApiRecord[]): AdminCategory[] {
  return nodos.flatMap((nodo) => {
    const hijas = Array.isArray(nodo.subcategorias)
      ? (nodo.subcategorias as ApiRecord[])
      : []
    return [aCategoria(nodo), ...aplanarCategorias(hijas)]
  })
}

function aProducto(api: ApiRecord): AdminProduct {
  const categoria = (api.categoria ?? {}) as ApiRecord
  const torta = (api.torta ?? {}) as ApiRecord
  const detalle = (api.detalle ?? {}) as ApiRecord
  const sublimacion = (api.sublimacion ?? {}) as ApiRecord
  const imagenesApi = Array.isArray(api.imagenes)
    ? (api.imagenes as ApiRecord[])
    : api.imagen_principal
      ? [api.imagen_principal as ApiRecord]
      : []
  return {
    id: String(api.id),
    nombre: String(api.nombre ?? ''),
    descripcion: String(api.descripcion ?? ''),
    categoriaId: String(api.categoria_id ?? categoria.id ?? ''),
    categoriaNombre: String(categoria.nombre ?? ''),
    tipo: api.tipo as AdminProduct['tipo'],
    precio_base: Number(api.precio_base ?? 0),
    activo: Boolean(api.activo),
    imagenes: imagenesApi.map(urlMultimedia).filter(Boolean),
    imagenIds: imagenesApi.map((imagen) => Number(imagen.id)).filter(Number.isFinite),
    tamano: torta.tamano === undefined ? undefined : String(torta.tamano),
    porciones: torta.porciones === undefined ? undefined : Number(torta.porciones),
    sabor: torta.sabor === undefined ? undefined : String(torta.sabor),
    stock: detalle.stock === undefined ? undefined : Number(detalle.stock),
    tipo_material:
      sublimacion.tipo_material === undefined
        ? undefined
        : String(sublimacion.tipo_material),
  }
}

function aPedidoResumen(api: ApiRecord): AdminOrder {
  const cliente = (api.cliente ?? {}) as ApiRecord
  return {
    id: String(api.id),
    numero: `PED-${String(api.id).padStart(5, '0')}`,
    clienteId: api.usuario_id === undefined ? undefined : String(api.usuario_id),
    clienteNombre: String(cliente.nombre_completo ?? 'Cliente sin nombre'),
    clienteCorreo: String(cliente.correo ?? ''),
    clienteTelefono: String(cliente.telefono ?? ''),
    fecha_entrega: String(api.fecha_entrega ?? ''),
    subtotal: Number(api.subtotal ?? api.total ?? 0),
    total: Number(api.total ?? 0),
    estado: api.estado as PedidoEstado,
    detalles: [],
  }
}

function aPedidoDetalle(api: ApiRecord): AdminOrder {
  const pedido = aPedidoResumen(api)
  const items = Array.isArray(api.items) ? (api.items as ApiRecord[]) : []
  return {
    ...pedido,
    detalles: items.map((item): AdminOrderDetail => ({
      id: String(item.id),
      productoNombre: String(item.nombre_producto ?? `Producto ${item.producto_id ?? ''}`),
      cantidad: Number(item.cantidad ?? 0),
      precio_unitario: Number(item.precio_unitario ?? 0),
      subtotal: Number(item.subtotal ?? 0),
      personalizacion:
        [item.nombre_diseno, item.indicaciones]
          .filter((valor) => typeof valor === 'string' && valor.trim() !== '')
          .join(' · ') || undefined,
    })),
    clienteNombre: String(((api.cliente ?? {}) as ApiRecord).nombre_completo ?? pedido.clienteNombre),
    clienteCorreo: String(((api.cliente ?? {}) as ApiRecord).correo ?? ''),
    clienteTelefono: String(((api.cliente ?? {}) as ApiRecord).telefono ?? ''),
    direccion: String(api.direccion_entrega ?? ''),
    referencia: String(api.referencia_entrega ?? ''),
    tipo_entrega: api.tipo_entrega as AdminOrder['tipo_entrega'],
    metodo_pago: (api.pago as ApiRecord | null)?.metodo as AdminOrder['metodo_pago'],
    pago_estado: (api.pago as ApiRecord | null)?.estado as PagoEstado | undefined,
  }
}

function aPago(api: ApiRecord): AdminPayment {
  const comprobante = (api.comprobante ?? null) as ApiRecord | null
  const multimediaId = comprobante?.multimedia_id
  const pedidoId = String(api.pedido_id ?? '')
  return {
    id: String(api.id),
    pedidoId,
    pedidoNumero: `PED-${pedidoId.padStart(5, '0')}`,
    metodo: api.metodo as AdminPayment['metodo'],
    monto: Number(api.monto ?? 0),
    estado: api.estado as PagoEstado,
    referencia: String(api.referencia_pasarela ?? ''),
    fecha: String(api.fecha_pago ?? ''),
    comprobanteId:
      multimediaId === null || multimediaId === undefined ? undefined : String(multimediaId),
    comprobanteMock:
      multimediaId === null || multimediaId === undefined
        ? undefined
        : `/multimedia/${String(multimediaId)}/archivo`,
  }
}

function aUsuario(api: ApiRecord): AdminUser {
  return {
    id: String(api.id),
    nombre_completo: String(api.nombre_completo ?? ''),
    correo: String(api.correo ?? ''),
    telefono: String(api.telefono ?? ''),
    rol: api.rol as AdminUser['rol'],
    correo_verificado: Boolean(api.correo_verificado),
    activo: Boolean(api.activo),
  }
}

function aPublicacion(api: ApiRecord): AdminPublication {
  const imagenes = Array.isArray(api.imagenes) ? (api.imagenes as ApiRecord[]) : []
  const primera = imagenes[0]
  return {
    id: String(api.id),
    titulo: String(api.titulo ?? ''),
    descripcion: String(api.descripcion ?? ''),
    categoriaId: api.categoria_id ? String(api.categoria_id) : undefined,
    productoId: api.producto_id ? String(api.producto_id) : undefined,
    multimediaUrl: primera ? String(primera.id ?? primera.url ?? '') : undefined,
    activo: Boolean(api.activo),
  }
}

function aProduccion(api: ApiRecord, categorias: AdminCategory[]): AdminProductionConfig {
  const categoriaId = api.categoria_id === null || api.categoria_id === undefined
    ? ''
    : String(api.categoria_id)
  const categoria = categorias.find((item) => item.id === categoriaId)
  const maximo = Number(api.capacidad_maxima ?? 0)
  const disponible = Number(api.disponible ?? 0)
  return {
    id: String(api.id),
    fecha: String(api.fecha ?? ''),
    categoriaId,
    categoriaNombre: categoria?.nombre ?? (categoriaId === '' ? 'Todas' : 'Categoría'),
    capacidad_maxima: maximo,
    capacidad_ocupada: Number(api.ocupado ?? maximo - disponible),
    activo: Boolean(api.activo),
  }
}

export async function listarCategoriasAdmin() {
  const { data } = await apiClient.get<ApiEnvelope<ApiRecord[]>>('/categorias', {
    params: { solo_activas: false },
  })
  return aplanarCategorias(data.data)
}

export async function listarProductosAdmin() {
  const productos = await listarTodas<ApiRecord>('/admin/productos')
  return productos.map(aProducto)
}

export async function obtenerProductoAdmin(id: string, categorias: AdminCategory[]) {
  const { data } = await apiClient.get<ApiEnvelope<ApiRecord>>(`/admin/productos/${id}`)
  const producto = aProducto(data.data)
  return {
    ...producto,
    categoriaNombre: categorias.find((categoria) => categoria.id === producto.categoriaId)?.nombre ?? '',
  }
}

function payloadProducto(dato: Omit<AdminProduct, 'id'>, incluirEstado = true) {
  return {
    categoria_id: Number(dato.categoriaId),
    nombre: dato.nombre,
    descripcion: dato.descripcion,
    precio_base: dato.precio_base,
    ...(incluirEstado ? { activo: dato.activo } : {}),
    tipo: dato.tipo,
    ...(dato.tipo === 'TORTA'
      ? { torta: { tamano: dato.tamano ?? '', porciones: dato.porciones ?? 1, sabor: dato.sabor ?? '' } }
      : {}),
    ...(dato.tipo === 'DETALLE' ? { detalle: { stock: dato.stock ?? 0 } } : {}),
    ...(dato.tipo === 'SUBLIMACION'
      ? { sublimacion: { tipo_material: dato.tipo_material ?? '' } }
      : {}),
    ...(dato.imagenIds !== undefined
      ? { imagenes: dato.imagenIds.map((multimedia_id, orden) => ({ multimedia_id, orden, es_principal: orden === 0 })) }
      : {}),
  }
}

export async function guardarProducto(id: string | undefined, dato: Omit<AdminProduct, 'id'>) {
  const payload = payloadProducto(dato, id === undefined)
  if (id) await apiClient.put(`/admin/productos/${id}`, payload)
  else await apiClient.post('/admin/productos', payload)
}

export async function alternarProducto(id: string, activo: boolean) {
  if (activo) await apiClient.delete(`/admin/productos/${id}`)
  else await apiClient.put(`/admin/productos/${id}`, { activo: true })
}

function payloadCategoria(dato: Omit<AdminCategory, 'id'>, incluirEstado = true) {
  return {
    nombre: dato.nombre,
    descripcion: dato.descripcion,
    categoria_padre_id: dato.categoria_padre_id ? Number(dato.categoria_padre_id) : null,
    ...(incluirEstado ? { activo: dato.activo } : {}),
  }
}

export async function guardarCategoria(id: string | undefined, dato: Omit<AdminCategory, 'id'>) {
  const payload = payloadCategoria(dato, id === undefined)
  if (id) await apiClient.put(`/admin/categorias/${id}`, payload)
  else await apiClient.post('/admin/categorias', payload)
}

export async function alternarCategoria(categoria: AdminCategory) {
  if (categoria.activo) await apiClient.delete(`/admin/categorias/${categoria.id}`)
  else await apiClient.put(`/admin/categorias/${categoria.id}`, payloadCategoria({
    nombre: categoria.nombre,
    descripcion: categoria.descripcion,
    categoria_padre_id: categoria.categoria_padre_id,
    activo: true,
  }))
}

export async function listarPedidosAdmin() {
  return (await listarTodas<ApiRecord>('/admin/pedidos')).map(aPedidoResumen)
}

export async function obtenerPedidoAdmin(id: string) {
  const { data } = await apiClient.get<ApiEnvelope<ApiRecord>>(`/pedidos/${id}`)
  return aPedidoDetalle(data.data)
}

export async function cambiarEstadoPedido(id: string, estado: PedidoEstado) {
  await apiClient.patch(`/admin/pedidos/${id}/estado`, { estado })
}

export async function listarPagosAdmin() {
  return (await listarTodas<ApiRecord>('/admin/pagos')).map(aPago)
}

function aMultimedia(api: ApiRecord): AdminMedia {
  return {
    id: String(api.id),
    nombre: String(api.nombre_archivo ?? ''),
    tipoMime: String(api.tipo_mime ?? ''),
    tamanoKb: Math.ceil(Number(api.tamano_bytes ?? 0) / 1024),
    ancho: api.ancho == null ? undefined : Number(api.ancho),
    alto: api.alto == null ? undefined : Number(api.alto),
    rutaArchivo: String(api.ruta_archivo ?? ''),
    url: typeof api.url === 'string' ? api.url : '',
    destino: String(api.destino ?? ''),
    activo: Boolean(api.activo),
  }
}

export async function listarMultimediaAdmin() {
  const [activos, inactivos] = await Promise.all([
    listarTodas<ApiRecord>('/admin/multimedia', { activo: 1 }),
    listarTodas<ApiRecord>('/admin/multimedia', { activo: 0 }),
  ])
  return [...activos, ...inactivos].map(aMultimedia)
}

export async function obtenerDashboardAdmin() {
  const { data } = await apiClient.get<ApiEnvelope<ApiRecord>>('/admin/dashboard')
  const dashboard = data.data
  return {
    productos_activos: Number(dashboard.productos_activos ?? 0),
    pedidos_pendientes: Number(dashboard.pedidos_pendientes ?? 0),
    pagos_pendientes: Number(dashboard.pagos_pendientes ?? 0),
    usuarios_registrados: Number(dashboard.usuarios_registrados ?? 0),
    pedidos_recientes: (dashboard.pedidos_recientes as ApiRecord[] ?? []).map((item) => ({
      id: String(item.id),
      estado: item.estado as PedidoEstado,
    })),
    productos_stock_bajo: (dashboard.productos_stock_bajo as ApiRecord[] ?? []).map((item) => ({
      id: String(item.id),
      nombre: String(item.nombre ?? ''),
      stock: Number(item.stock ?? 0),
    })),
  } satisfies AdminDashboard
}

export async function verificarPago(id: string, estado: 'APROBADO' | 'RECHAZADO') {
  await apiClient.patch(`/admin/pagos/${id}/verificar`, { estado })
}

export async function listarUsuariosAdmin() {
  return (await listarTodas<ApiRecord>('/admin/usuarios')).map(aUsuario)
}

export async function alternarEstadoUsuario(id: string, activo: boolean) {
  await apiClient.patch(`/admin/usuarios/${id}`, { activo: !activo })
}

export async function listarPublicacionesAdmin() {
  return (await listarTodas<ApiRecord>('/publicaciones')).map(aPublicacion)
}

function payloadPublicacion(dato: Omit<AdminPublication, 'id'>, incluirImagenes = true, incluirEstado = true) {
  const mediaId = dato.multimediaUrl?.trim()
  const multimediaId = mediaId && /^\d+$/.test(mediaId) ? Number(mediaId) : undefined
  return {
    titulo: dato.titulo,
    descripcion: dato.descripcion,
    categoria_id: dato.categoriaId ? Number(dato.categoriaId) : null,
    producto_id: dato.productoId ? Number(dato.productoId) : null,
    ...(incluirEstado ? { activo: dato.activo } : {}),
    ...(incluirImagenes ? { imagenes: multimediaId ? [{ multimedia_id: multimediaId, orden: 0 }] : [] } : {}),
  }
}

export async function guardarPublicacion(id: string | undefined, dato: Omit<AdminPublication, 'id'>) {
  const payload = payloadPublicacion(dato, true, id === undefined)
  if (id) {
    const seleccion = dato.multimediaUrl?.trim()
    if (seleccion && /^\d+$/.test(seleccion)) {
      const { data } = await apiClient.get<ApiEnvelope<ApiRecord>>(`/publicaciones/${id}`)
      const actual = Array.isArray(data.data.imagenes) ? data.data.imagenes as ApiRecord[] : []
      if (Number(actual[0]?.id) === Number(seleccion)) {
        await apiClient.put(`/admin/publicaciones/${id}`, payloadPublicacion(dato, false, false))
        return
      }
    }
    await apiClient.put(`/admin/publicaciones/${id}`, payload)
  } else {
    await apiClient.post('/admin/publicaciones', payload)
  }
}

export async function alternarPublicacion(id: string, activo: boolean) {
  if (activo) await apiClient.delete(`/admin/publicaciones/${id}`)
  else await apiClient.put(`/admin/publicaciones/${id}`, { activo: true })
}

export async function listarProduccionAdmin(categorias: AdminCategory[]) {
  const { data } = await apiClient.get<ApiEnvelope<ApiRecord[]>>('/admin/produccion')
  return data.data.map((item) => aProduccion(item, categorias))
}

function payloadProduccion(dato: Omit<AdminProductionConfig, 'id'>, incluirEstado = true) {
  return {
    fecha: dato.fecha,
    categoria_id: dato.categoriaId ? Number(dato.categoriaId) : null,
    capacidad_maxima: dato.capacidad_maxima,
    ...(incluirEstado ? { activo: dato.activo } : {}),
  }
}

export async function guardarProduccion(id: string | undefined, dato: Omit<AdminProductionConfig, 'id'>) {
  const payload = payloadProduccion(dato, id === undefined)
  if (id) await apiClient.put(`/admin/produccion/${id}`, payload)
  else await apiClient.post('/admin/produccion', payload)
}

export async function alternarProduccion(id: string, activo: boolean) {
  if (activo) await apiClient.delete(`/admin/produccion/${id}`)
  else await apiClient.put(`/admin/produccion/${id}`, { activo: true })
}

export async function obtenerConfiguracionTienda(): Promise<StoreConfiguration> {
  const { data } = await apiClient.get<ApiEnvelope<ApiRecord>>('/tienda/configuracion')
  const config = data.data
  return {
    nombre_tienda: String(config.nombre_tienda ?? ''),
    logoUrl: String(config.logo_url ?? ''),
    faviconUrl: String(config.favicon_url ?? ''),
    color_primario: String(config.color_primario ?? '#7f1d1d'),
    color_secundario: String(config.color_secundario ?? '#f5f5f4'),
    color_acento: String(config.color_acento ?? '#be123c'),
    color_fondo: String(config.color_fondo ?? '#ffffff'),
    color_texto: String(config.color_texto ?? '#292524'),
    telefono: String(config.telefono ?? ''),
    correo: String(config.correo ?? ''),
    direccion: String(config.direccion ?? ''),
  }
}

export async function actualizarConfiguracionTienda(dato: StoreConfiguration) {
  await apiClient.put('/admin/tienda/configuracion', {
    nombre_tienda: dato.nombre_tienda,
    logo_url: dato.logoUrl || null,
    favicon_url: dato.faviconUrl || null,
    color_primario: dato.color_primario,
    color_secundario: dato.color_secundario,
    color_acento: dato.color_acento || null,
    color_fondo: dato.color_fondo || null,
    color_texto: dato.color_texto || null,
    telefono: dato.telefono || null,
    correo: dato.correo || null,
    direccion: dato.direccion || null,
  })
}

export async function subirMultimedia(archivo: File, destino: string): Promise<AdminMedia> {
  const formulario = new FormData()
  formulario.append('archivo', archivo)
  formulario.append('destino', destino)
  const { data } = await apiClient.post<ApiEnvelope<ApiRecord>>('/multimedia', formulario)
  const media = data.data
  return {
    id: String(media.id),
    nombre: String(media.nombre_archivo ?? archivo.name),
    tipoMime: String(media.tipo_mime ?? archivo.type),
    tamanoKb: Math.ceil(Number(media.tamano_bytes ?? archivo.size) / 1024),
    ancho: media.ancho === null ? undefined : Number(media.ancho),
    alto: media.alto === null ? undefined : Number(media.alto),
    rutaArchivo: String(media.ruta_archivo ?? ''),
    url:
      typeof media.url === 'string' && media.url !== ''
        ? media.url
        : destino === 'comprobantes'
          ? ''
          : urlMultimedia(media),
    destino,
    activo: Boolean(media.activo),
  }
}

export async function alternarEstadoMultimedia(id: string, activo: boolean) {
  await apiClient.patch(`/admin/multimedia/${id}/estado`, { activo })
}

export async function abrirMultimediaPrivada(id: string) {
  const { data } = await apiClient.get<Blob>(`/multimedia/${id}/archivo`, {
    responseType: 'blob',
  })
  return URL.createObjectURL(data)
}
