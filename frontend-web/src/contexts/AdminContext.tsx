/* eslint-disable react-refresh/only-export-components */
/**
 * Capa de datos del panel: consultas y acciones administrativas mediante la API.
 * Las páginas usan una sola interfaz; los mappers HTTP viven en adminService.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type {
  AdminCategory,
  AdminDashboard,
  AdminMedia,
  AdminOrder,
  AdminPayment,
  AdminProduct,
  AdminProductionConfig,
  AdminPublication,
  AdminUser,
  StoreConfiguration,
} from '../types/admin'
import { PEDIDO_FLUJO } from '../types/admin'
import * as adminApi from '../services/adminService'
import { useAuth } from '../hooks/useAuth'

export type AdminContextValue = {
  cargando: boolean
  error: string | null
  recargar: () => Promise<void>
  dashboard: AdminDashboard
  productos: AdminProduct[]
  crearProducto: (dato: Omit<AdminProduct, 'id'>) => void | Promise<void>
  actualizarProducto: (id: string, dato: Omit<AdminProduct, 'id'>) => void | Promise<void>
  alternarProducto: (id: string) => void | Promise<void>
  categorias: AdminCategory[]
  crearCategoria: (dato: Omit<AdminCategory, 'id'>) => void | Promise<void>
  actualizarCategoria: (id: string, dato: Omit<AdminCategory, 'id'>) => void | Promise<void>
  alternarCategoria: (id: string) => void | Promise<void>
  pedidos: AdminOrder[]
  obtenerPedido: (id: string) => AdminOrder | undefined
  avanzarPedido: (id: string) => boolean | Promise<boolean>
  pagos: AdminPayment[]
  cambiarEstadoPago: (id: string, estado: 'APROBADO' | 'RECHAZADO') => void | Promise<void>
  usuarios: AdminUser[]
  alternarUsuario: (id: string) => boolean | Promise<boolean>
  publicaciones: AdminPublication[]
  crearPublicacion: (dato: Omit<AdminPublication, 'id'>) => void | Promise<void>
  actualizarPublicacion: (id: string, dato: Omit<AdminPublication, 'id'>) => void | Promise<void>
  alternarPublicacion: (id: string) => void | Promise<void>
  multimedia: AdminMedia[]
  subirMultimedia: (archivo: File, destino: string) => Promise<AdminMedia>
  alternarMultimedia: (id: string) => void | Promise<void>
  produccion: AdminProductionConfig[]
  crearProduccion: (dato: Omit<AdminProductionConfig, 'id'>) => void | Promise<void>
  actualizarProduccion: (
    id: string,
    dato: Omit<AdminProductionConfig, 'id'>,
  ) => void | Promise<void>
  alternarProduccion: (id: string) => void | Promise<void>
  tienda: StoreConfiguration
  actualizarTienda: (dato: StoreConfiguration) => void | Promise<void>
}

export const AdminContext = createContext<AdminContextValue | undefined>(
  undefined,
)

export function useAdmin(): AdminContextValue {
  const contexto = useContext(AdminContext)
  if (!contexto) {
    throw new Error('useAdmin debe usarse dentro de AdminProvider')
  }
  return contexto
}

export function AdminProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [productos, setProductos] = useState<AdminProduct[]>([])
  const [categorias, setCategorias] = useState<AdminCategory[]>([])
  const [pedidos, setPedidos] = useState<AdminOrder[]>([])
  const [pagos, setPagos] = useState<AdminPayment[]>([])
  const [usuarios, setUsuarios] = useState<AdminUser[]>([])
  const [publicaciones, setPublicaciones] = useState<AdminPublication[]>([])
  const [multimedia, setMultimedia] = useState<AdminMedia[]>([])
  const [produccion, setProduccion] = useState<AdminProductionConfig[]>([])
  const [tienda, setTienda] = useState<StoreConfiguration>({
    nombre_tienda: '', logoUrl: '', faviconUrl: '',
    color_primario: '', color_secundario: '', color_acento: '',
    color_fondo: '', color_texto: '', telefono: '', correo: '', direccion: '',
  })
  const [dashboard, setDashboard] = useState<AdminDashboard>({
    productos_activos: 0,
    pedidos_pendientes: 0,
    pagos_pendientes: 0,
    usuarios_registrados: 0,
    pedidos_recientes: [],
    productos_stock_bajo: [],
  })
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const recargar = useCallback(async () => {
    setCargando(true)
    setError(null)
    try {
      const [categoriasNuevas, productosNuevos, pedidosNuevos, usuariosNuevos,
        publicacionesNuevas, tiendaNueva, multimediaNueva, dashboardNuevo, pagosNuevos] = await Promise.all([
        adminApi.listarCategoriasAdmin(),
        adminApi.listarProductosAdmin(),
        adminApi.listarPedidosAdmin(),
        adminApi.listarUsuariosAdmin(),
        adminApi.listarPublicacionesAdmin(),
        adminApi.obtenerConfiguracionTienda(),
        adminApi.listarMultimediaAdmin(),
        adminApi.obtenerDashboardAdmin(),
        adminApi.listarPagosAdmin(),
      ])
      const produccionNueva = await adminApi.listarProduccionAdmin(categoriasNuevas)
      setCategorias(categoriasNuevas)
      setProductos(productosNuevos)
      setPedidos(pedidosNuevos)
      setUsuarios(usuariosNuevos)
      setPublicaciones(publicacionesNuevas.map((publicacion) => ({
        ...publicacion,
        categoriaNombre: categoriasNuevas.find((categoria) => categoria.id === publicacion.categoriaId)?.nombre,
        productoNombre: productosNuevos.find((producto) => producto.id === publicacion.productoId)?.nombre,
      })))
      setTienda(tiendaNueva)
      setProduccion(produccionNueva)
      setPagos(pagosNuevos)
      setMultimedia(multimediaNueva)
      setDashboard(dashboardNuevo)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudieron cargar los datos administrativos.')
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => { void recargar() }, [recargar])

  const ejecutarYRecargar = useCallback(async (accion: () => Promise<unknown>) => {
    await accion()
    await recargar()
  }, [recargar])

  const valor = useMemo<AdminContextValue>(() => ({
    cargando,
    error,
    recargar,
    dashboard,
    productos,
    crearProducto: (dato) => ejecutarYRecargar(() => adminApi.guardarProducto(undefined, dato)),
    actualizarProducto: (id, dato) => ejecutarYRecargar(() => adminApi.guardarProducto(id, dato)),
    alternarProducto: (id) => {
      const item = productos.find((producto) => producto.id === id)
      return item ? ejecutarYRecargar(() => adminApi.alternarProducto(id, item.activo)) : Promise.resolve()
    },
    categorias,
    crearCategoria: (dato) => ejecutarYRecargar(() => adminApi.guardarCategoria(undefined, dato)),
    actualizarCategoria: (id, dato) => ejecutarYRecargar(() => adminApi.guardarCategoria(id, dato)),
    alternarCategoria: (id) => {
      const item = categorias.find((categoria) => categoria.id === id)
      return item ? ejecutarYRecargar(() => adminApi.alternarCategoria(item)) : Promise.resolve()
    },
    pedidos,
    obtenerPedido: (id) => pedidos.find((pedido) => pedido.id === id),
    avanzarPedido: async (id) => {
      const item = pedidos.find((pedido) => pedido.id === id)
      if (!item) return false
      const indice = PEDIDO_FLUJO.indexOf(item.estado)
      const siguiente = PEDIDO_FLUJO[indice + 1]
      if (!siguiente) return false
      await ejecutarYRecargar(() => adminApi.cambiarEstadoPedido(id, siguiente))
      return true
    },
    pagos,
    cambiarEstadoPago: (id, estado) => ejecutarYRecargar(() => adminApi.verificarPago(id, estado)),
    usuarios,
    alternarUsuario: async (id) => {
      const usuario = usuarios.find((item) => item.id === id)
      if (!usuario || id === String(user?.id)) return false
      await ejecutarYRecargar(() => adminApi.alternarEstadoUsuario(id, usuario.activo))
      return true
    },
    publicaciones,
    crearPublicacion: (dato) => ejecutarYRecargar(() => adminApi.guardarPublicacion(undefined, dato)),
    actualizarPublicacion: (id, dato) => ejecutarYRecargar(() => adminApi.guardarPublicacion(id, dato)),
    alternarPublicacion: (id) => {
      const item = publicaciones.find((publicacion) => publicacion.id === id)
      return item ? ejecutarYRecargar(() => adminApi.alternarPublicacion(id, item.activo)) : Promise.resolve()
    },
    multimedia,
    subirMultimedia: async (archivo, destino) => {
      const item = await adminApi.subirMultimedia(archivo, destino)
      setMultimedia((actual) => [item, ...actual])
      return item
    },
    alternarMultimedia: async (id) => {
      const item = multimedia.find((medio) => medio.id === id)
      if (!item) return
      const activo = !item.activo
      await adminApi.alternarEstadoMultimedia(id, activo)
      setMultimedia((actual) => actual.map((medio) => medio.id === id ? { ...medio, activo } : medio))
    },
    produccion,
    crearProduccion: (dato) => ejecutarYRecargar(() => adminApi.guardarProduccion(undefined, dato)),
    actualizarProduccion: (id, dato) => ejecutarYRecargar(() => adminApi.guardarProduccion(id, dato)),
    alternarProduccion: (id) => {
      const item = produccion.find((configuracion) => configuracion.id === id)
      return item ? ejecutarYRecargar(() => adminApi.alternarProduccion(id, item.activo)) : Promise.resolve()
    },
    tienda,
    actualizarTienda: (dato) => ejecutarYRecargar(async () => {
      await adminApi.actualizarConfiguracionTienda(dato)
      setTienda(dato)
    }),
  }), [cargando, error, recargar, dashboard, productos, categorias, pedidos, pagos, usuarios, publicaciones, multimedia, produccion, tienda, ejecutarYRecargar, user?.id])

  return <AdminContext.Provider value={valor}>{children}</AdminContext.Provider>
}

