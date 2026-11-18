/* eslint-disable react-refresh/only-export-components */
/**
 * Capa de datos del panel: fixtures en modo mock y endpoints existentes en modo API.
 * Las páginas usan una sola interfaz; los mappers HTTP viven en adminService.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type {
  AdminCategory,
  AdminMedia,
  AdminOrder,
  AdminPayment,
  AdminProduct,
  AdminProductionConfig,
  AdminPublication,
  AdminUser,
  PedidoEstado,
  StoreConfiguration,
} from '../types/admin'
import { PEDIDO_FLUJO } from '../types/admin'
import { adminCategoriesMock } from '../data/admin/adminCategories.mock'
import { adminMediaMock } from '../data/admin/adminMedia.mock'
import { adminOrdersMock } from '../data/admin/adminOrders.mock'
import { adminPaymentsMock } from '../data/admin/adminPayments.mock'
import { adminProductsMock } from '../data/admin/adminProducts.mock'
import { adminProductionMock } from '../data/admin/adminProduction.mock'
import { adminPublicationsMock } from '../data/admin/adminPublications.mock'
import { ADMIN_PRINCIPAL_ID, adminUsersMock } from '../data/admin/adminUsers.mock'
import { storeConfigurationMock } from '../data/admin/storeConfiguration.mock'
import { config } from '../config/app'
import * as adminApi from '../services/adminService'
import { useAuth } from '../hooks/useAuth'

function crearId(prefijo: string): string {
  return `${prefijo}-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`
}

export type AdminMockContextValue = {
  cargando: boolean
  error: string | null
  recargar: () => Promise<void>
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

export const AdminMockContext = createContext<AdminMockContextValue | undefined>(
  undefined,
)

function AdminMockDataProvider({ children }: { children: ReactNode }) {
  const [productos, setProductos] = useState<AdminProduct[]>(adminProductsMock)
  const [categorias, setCategorias] =
    useState<AdminCategory[]>(adminCategoriesMock)
  const [pedidos, setPedidos] = useState<AdminOrder[]>(adminOrdersMock)
  const [pagos, setPagos] = useState<AdminPayment[]>(adminPaymentsMock)
  const [usuarios, setUsuarios] = useState<AdminUser[]>(adminUsersMock)
  const [publicaciones, setPublicaciones] =
    useState<AdminPublication[]>(adminPublicationsMock)
  const [multimedia, setMultimedia] = useState<AdminMedia[]>(adminMediaMock)
  const [produccion, setProduccion] =
    useState<AdminProductionConfig[]>(adminProductionMock)
  const [tienda, setTienda] = useState<StoreConfiguration>(storeConfigurationMock)

  const valor = useMemo<AdminMockContextValue>(
    () => ({
      cargando: false,
      error: null,
      recargar: async () => {},
      productos,
      crearProducto: (dato) =>
        setProductos((actual) => [...actual, { ...dato, id: crearId('prod') }]),
      actualizarProducto: (id, dato) =>
        setProductos((actual) =>
          actual.map((item) => (item.id === id ? { ...dato, id } : item)),
        ),
      alternarProducto: (id) =>
        setProductos((actual) =>
          actual.map((item) =>
            item.id === id ? { ...item, activo: !item.activo } : item,
          ),
        ),
      categorias,
      crearCategoria: (dato) =>
        setCategorias((actual) => [...actual, { ...dato, id: crearId('cat') }]),
      actualizarCategoria: (id, dato) =>
        setCategorias((actual) =>
          actual.map((item) => (item.id === id ? { ...dato, id } : item)),
        ),
      alternarCategoria: (id) =>
        setCategorias((actual) =>
          actual.map((item) =>
            item.id === id ? { ...item, activo: !item.activo } : item,
          ),
        ),
      pedidos,
      obtenerPedido: (id) => pedidos.find((item) => item.id === id),
      avanzarPedido: (id) => {
        let avanzo = false
        setPedidos((actual) =>
          actual.map((item) => {
            if (item.id !== id) return item
            const indice = PEDIDO_FLUJO.indexOf(item.estado)
            const siguiente: PedidoEstado | undefined = PEDIDO_FLUJO[indice + 1]
            if (indice < 0 || !siguiente) return item
            avanzo = true
            return { ...item, estado: siguiente }
          }),
        )
        return avanzo
      },
      pagos,
      cambiarEstadoPago: (id, estado) =>
        setPagos((actual) =>
          actual.map((item) =>
            item.id === id ? { ...item, estado } : item,
          ),
        ),
      usuarios,
      alternarUsuario: (id) => {
        if (id === ADMIN_PRINCIPAL_ID) return false
        setUsuarios((actual) =>
          actual.map((item) =>
            item.id === id ? { ...item, activo: !item.activo } : item,
          ),
        )
        return true
      },
      publicaciones,
      crearPublicacion: (dato) =>
        setPublicaciones((actual) => [...actual, { ...dato, id: crearId('pub') }]),
      actualizarPublicacion: (id, dato) =>
        setPublicaciones((actual) =>
          actual.map((item) => (item.id === id ? { ...dato, id } : item)),
        ),
      alternarPublicacion: (id) =>
        setPublicaciones((actual) =>
          actual.map((item) =>
            item.id === id ? { ...item, activo: !item.activo } : item,
          ),
        ),
      multimedia,
      subirMultimedia: async (archivo, destino) => {
        const url = URL.createObjectURL(archivo)
        const multimedia = {
          id: crearId('med'),
          nombre: archivo.name,
          tipoMime: archivo.type,
          tamanoKb: Math.max(1, Math.round(archivo.size / 1024)),
          url,
          destino,
          activo: true,
        }
        setMultimedia((actual) => [...actual, multimedia])
        return multimedia
      },
      alternarMultimedia: (id) =>
        setMultimedia((actual) =>
          actual.map((item) =>
            item.id === id ? { ...item, activo: !item.activo } : item,
          ),
        ),
      produccion,
      crearProduccion: (dato) =>
        setProduccion((actual) => [...actual, { ...dato, id: crearId('cap') }]),
      actualizarProduccion: (id, dato) =>
        setProduccion((actual) =>
          actual.map((item) => (item.id === id ? { ...dato, id } : item)),
        ),
      alternarProduccion: (id) =>
        setProduccion((actual) =>
          actual.map((item) =>
            item.id === id ? { ...item, activo: !item.activo } : item,
          ),
        ),
      tienda,
      actualizarTienda: (dato) => setTienda(dato),
    }),
    [
      productos,
      categorias,
      pedidos,
      pagos,
      usuarios,
      publicaciones,
      multimedia,
      produccion,
      tienda,
    ],
  )

  return (
    <AdminMockContext.Provider value={valor}>
      {children}
    </AdminMockContext.Provider>
  )
}

export function useAdminMock(): AdminMockContextValue {
  const contexto = useContext(AdminMockContext)
  if (!contexto) {
    throw new Error('useAdminMock debe usarse dentro de AdminMockProvider')
  }
  return contexto
}

function AdminBackendProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [productos, setProductos] = useState<AdminProduct[]>([])
  const [categorias, setCategorias] = useState<AdminCategory[]>([])
  const [pedidos, setPedidos] = useState<AdminOrder[]>([])
  const [pagos, setPagos] = useState<AdminPayment[]>([])
  const [usuarios, setUsuarios] = useState<AdminUser[]>([])
  const [publicaciones, setPublicaciones] = useState<AdminPublication[]>([])
  const [multimedia, setMultimedia] = useState<AdminMedia[]>([])
  const [produccion, setProduccion] = useState<AdminProductionConfig[]>([])
  const [tienda, setTienda] = useState<StoreConfiguration>(storeConfigurationMock)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const recargar = useCallback(async () => {
    setCargando(true)
    setError(null)
    try {
      const [categoriasNuevas, productosNuevos, pedidosNuevos, usuariosNuevos,
        publicacionesNuevas, tiendaNueva] = await Promise.all([
        adminApi.listarCategoriasAdmin(),
        adminApi.listarProductosAdmin(),
        adminApi.listarPedidosAdmin(),
        adminApi.listarUsuariosAdmin(),
        adminApi.listarPublicacionesAdmin(),
        adminApi.obtenerConfiguracionTienda(),
      ])
      const [produccionNueva, pagosNuevos] = await Promise.all([
        adminApi.listarProduccionAdmin(categoriasNuevas),
        adminApi.listarPagosAdmin(pedidosNuevos),
      ])
      setCategorias(categoriasNuevas)
      setProductos(productosNuevos)
      setPedidos(pedidosNuevos.map((pedido) => {
        const cliente = usuariosNuevos.find((usuario) => usuario.id === pedido.clienteId)
        return cliente ? {
          ...pedido,
          clienteNombre: cliente.nombre_completo,
          clienteCorreo: cliente.correo,
          clienteTelefono: cliente.telefono,
        } : pedido
      }))
      setUsuarios(usuariosNuevos)
      setPublicaciones(publicacionesNuevas.map((publicacion) => ({
        ...publicacion,
        categoriaNombre: categoriasNuevas.find((categoria) => categoria.id === publicacion.categoriaId)?.nombre,
        productoNombre: productosNuevos.find((producto) => producto.id === publicacion.productoId)?.nombre,
      })))
      setTienda(tiendaNueva)
      setProduccion(produccionNueva)
      setPagos(pagosNuevos)
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

  const valor = useMemo<AdminMockContextValue>(() => ({
    cargando,
    error,
    recargar,
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
      await adminApi.alternarEstadoMultimedia(id)
      setMultimedia((actual) => actual.map((item) => item.id === id ? { ...item, activo: false } : item))
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
  }), [cargando, error, recargar, productos, categorias, pedidos, pagos, usuarios, publicaciones, multimedia, produccion, tienda, ejecutarYRecargar, user?.id])

  return <AdminMockContext.Provider value={valor}>{children}</AdminMockContext.Provider>
}

export function AdminMockProvider({ children }: { children: ReactNode }) {
  return config.mockMode
    ? <AdminMockDataProvider>{children}</AdminMockDataProvider>
    : <AdminBackendProvider>{children}</AdminBackendProvider>
}
