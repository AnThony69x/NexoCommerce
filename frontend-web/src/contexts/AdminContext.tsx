/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useState, useSyncExternalStore } from 'react'
import type { ReactNode } from 'react'
import type { AdminCategory, AdminProduct, AdminProductionConfig, AdminPublication, PedidoEstado, StoreConfiguration } from '../types/admin'
import * as api from '../services/adminService'
import { useAuth } from '../hooks/useAuth'
import { crearRecursosAdmin, type RecursoAdmin } from './adminResources'

function crearAdmin(idSesion?: number | string) {
  const recursos = crearRecursosAdmin()

  async function guardar(accion: () => Promise<unknown>, principal: RecursoAdmin, relacionadas: RecursoAdmin[] = []) {
    await accion()
    const afectados = [recursos.invalidar(principal, true), ...relacionadas.map((clave) => recursos.invalidar(clave))]
    if (principal === 'productos' || principal === 'pagos') afectados.push(recursos.invalidar('dashboard'))
    await Promise.all(afectados)
  }

  return {
    recursos,
    crearProducto: (dato: Omit<AdminProduct, 'id'>) => guardar(() => api.guardarProducto(undefined, dato), 'productos'),
    actualizarProducto: (id: string, dato: Omit<AdminProduct, 'id'>) => guardar(() => api.guardarProducto(id, dato), 'productos'),
    alternarProducto: (id: string) => {
      const producto = recursos.leer('productos').data?.find((item) => item.id === id)
      return producto ? guardar(() => api.alternarProducto(id, producto.activo), 'productos') : Promise.resolve()
    },
    crearCategoria: (dato: Omit<AdminCategory, 'id'>) => guardar(() => api.guardarCategoria(undefined, dato), 'categorias', ['productos']),
    actualizarCategoria: (id: string, dato: Omit<AdminCategory, 'id'>) => guardar(() => api.guardarCategoria(id, dato), 'categorias', ['productos']),
    alternarCategoria: (id: string) => {
      const categoria = recursos.leer('categorias').data?.find((item) => item.id === id)
      return categoria ? guardar(() => api.alternarCategoria(categoria), 'categorias', ['productos']) : Promise.resolve()
    },
    cambiarEstadoPedido: async (id: string, estado: PedidoEstado) => {
      const confirmado = await api.cambiarEstadoPedido(id, estado)
      recursos.actualizar('pedidos', (actuales) => actuales.map((pedido) => pedido.id === id ? { ...pedido, estado: confirmado } : pedido))
      await Promise.all([recursos.invalidar('pedidos'), recursos.invalidar('pagos'), recursos.invalidar('produccion'), recursos.invalidar('dashboard')])
    },
    cambiarEstadoPago: (id: string, estado: 'APROBADO' | 'RECHAZADO') => guardar(() => api.verificarPago(id, estado), 'pagos'),
    alternarUsuario: async (id: string) => {
      const usuario = recursos.leer('usuarios').data?.find((item) => item.id === id)
      if (!usuario || id === String(idSesion)) return false
      await guardar(() => api.alternarEstadoUsuario(id, usuario.activo), 'usuarios')
      return true
    },
    crearPublicacion: (dato: Omit<AdminPublication, 'id'>) => guardar(() => api.guardarPublicacion(undefined, dato), 'publicaciones'),
    actualizarPublicacion: (id: string, dato: Omit<AdminPublication, 'id'>) => guardar(() => api.guardarPublicacion(id, dato), 'publicaciones'),
    alternarPublicacion: (id: string) => {
      const publicacion = recursos.leer('publicaciones').data?.find((item) => item.id === id)
      return publicacion ? guardar(() => api.alternarPublicacion(id, publicacion.activo), 'publicaciones') : Promise.resolve()
    },
    subirMultimedia: async (archivo: File, destino: string) => {
      const item = await api.subirMultimedia(archivo, destino)
      recursos.actualizar('multimedia', (actual) => [item, ...actual.filter((medio) => medio.id !== item.id)])
      await recursos.invalidar('multimedia', true)
      return item
    },
    alternarMultimedia: (id: string) => {
      const item = recursos.leer('multimedia').data?.find((medio) => medio.id === id)
      return item ? guardar(() => api.alternarEstadoMultimedia(id, !item.activo), 'multimedia') : Promise.resolve()
    },
    crearProduccion: (dato: Omit<AdminProductionConfig, 'id'>) => guardar(() => api.guardarProduccion(undefined, dato), 'produccion'),
    actualizarProduccion: (id: string, dato: Omit<AdminProductionConfig, 'id'>) => guardar(() => api.guardarProduccion(id, dato), 'produccion'),
    alternarProduccion: (id: string) => {
      const configuracion = recursos.leer('produccion').data?.find((item) => item.id === id)
      return configuracion ? guardar(() => api.alternarProduccion(id, configuracion.activo), 'produccion') : Promise.resolve()
    },
    actualizarTienda: (dato: StoreConfiguration) => guardar(() => api.actualizarConfiguracionTienda(dato), 'tienda'),
  }
}

type AdminContextValue = ReturnType<typeof crearAdmin>
const AdminContext = createContext<AdminContextValue | undefined>(undefined)

export function useAdmin() {
  const contexto = useContext(AdminContext)
  if (!contexto) throw new Error('useAdmin debe usarse dentro de AdminProvider')
  return contexto
}

export function useAdminResource<K extends RecursoAdmin>(clave: K, habilitado = true) {
  const { recursos } = useAdmin()
  const observar = useCallback((avisar: () => void) =>
    habilitado ? recursos.observar(clave, avisar) : () => {}, [recursos, clave, habilitado])
  const leer = useCallback(() => recursos.leer(clave), [recursos, clave])
  const estado = useSyncExternalStore(observar, leer)
  useEffect(() => {
    if (habilitado) void recursos.cargar(clave)
  }, [recursos, clave, habilitado])

  return { ...estado, recargar: () => recursos.cargar(clave, true) }
}

function SesionAdmin({ children, id }: { children: ReactNode; id?: number | string }) {
  const [contexto] = useState(() => crearAdmin(id))
  return <AdminContext.Provider value={contexto}>{children}</AdminContext.Provider>
}

export function AdminProvider({ children }: { children: ReactNode }) {
  const { user, token } = useAuth()
  return <SesionAdmin key={`${user?.id ?? ''}:${token ?? ''}`} id={user?.id}>{children}</SesionAdmin>
}
