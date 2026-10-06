/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState } from 'react'
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

function crearId(prefijo: string): string {
  return `${prefijo}-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`
}

type AdminMockContextValue = {
  productos: AdminProduct[]
  crearProducto: (dato: Omit<AdminProduct, 'id'>) => void
  actualizarProducto: (id: string, dato: Omit<AdminProduct, 'id'>) => void
  alternarProducto: (id: string) => void
  categorias: AdminCategory[]
  crearCategoria: (dato: Omit<AdminCategory, 'id'>) => void
  actualizarCategoria: (id: string, dato: Omit<AdminCategory, 'id'>) => void
  alternarCategoria: (id: string) => void
  pedidos: AdminOrder[]
  obtenerPedido: (id: string) => AdminOrder | undefined
  avanzarPedido: (id: string) => boolean
  pagos: AdminPayment[]
  cambiarEstadoPago: (id: string, estado: 'APROBADO' | 'RECHAZADO') => void
  usuarios: AdminUser[]
  alternarUsuario: (id: string) => boolean
  publicaciones: AdminPublication[]
  crearPublicacion: (dato: Omit<AdminPublication, 'id'>) => void
  actualizarPublicacion: (id: string, dato: Omit<AdminPublication, 'id'>) => void
  alternarPublicacion: (id: string) => void
  multimedia: AdminMedia[]
  agregarMultimedia: (dato: Omit<AdminMedia, 'id'>) => void
  alternarMultimedia: (id: string) => void
  produccion: AdminProductionConfig[]
  crearProduccion: (dato: Omit<AdminProductionConfig, 'id'>) => void
  actualizarProduccion: (
    id: string,
    dato: Omit<AdminProductionConfig, 'id'>,
  ) => void
  alternarProduccion: (id: string) => void
  tienda: StoreConfiguration
  actualizarTienda: (dato: StoreConfiguration) => void
}

const AdminMockContext = createContext<AdminMockContextValue | undefined>(
  undefined,
)

export function AdminMockProvider({ children }: { children: ReactNode }) {
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
      agregarMultimedia: (dato) =>
        setMultimedia((actual) => [...actual, { ...dato, id: crearId('med') }]),
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
