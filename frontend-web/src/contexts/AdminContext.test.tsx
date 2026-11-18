import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, expect, it, vi } from 'vitest'
import * as api from '../services/adminService'
import type { AdminOrder } from '../types/admin'
import { AdminProvider, useAdmin, useAdminResource } from './AdminContext'

const { sesion } = vi.hoisted(() => ({ sesion: { token: 'sesion-1', user: { id: 1 } } }))
vi.mock('../hooks/useAuth', () => ({ useAuth: () => sesion }))
vi.mock('../services/adminService', () => ({
  obtenerDashboardAdmin: vi.fn(), listarPedidosAdmin: vi.fn(), listarPagosAdmin: vi.fn(), listarMultimediaAdmin: vi.fn(),
  listarProductosAdmin: vi.fn(), listarCategoriasAdmin: vi.fn(),
  listarUsuariosAdmin: vi.fn(), listarPublicacionesAdmin: vi.fn(), listarProduccionAdmin: vi.fn(),
  obtenerConfiguracionTienda: vi.fn(), verificarPago: vi.fn(), guardarProducto: vi.fn(), subirMultimedia: vi.fn(),
}))

beforeEach(() => {
  vi.resetAllMocks()
  sesion.token = 'sesion-1'
})

const pedido: AdminOrder = {
  id: '1', numero: 'PED-00001', clienteNombre: 'Cliente', clienteCorreo: '',
  clienteTelefono: '', fecha_entrega: '', subtotal: 5, total: 5, estado: 'PENDIENTE', detalles: [],
}

function Pedidos() {
  const recurso = useAdminResource('pedidos')
  return <section>
    {recurso.error ?? (recurso.data === undefined ? 'Cargando pedidos' : recurso.data.length ? recurso.data[0].numero : 'Sin pedidos')}
    <button onClick={recurso.recargar}>Reintentar pedidos</button>
  </section>
}

function Operaciones() {
  const admin = useAdmin()
  const pagos = useAdminResource('pagos')
  const multimedia = useAdminResource('multimedia')
  useAdminResource('productos')
  return <>
    <p>{pagos.error && pagos.guardado ? 'Pago guardado, recarga fallida' : ''}</p>
    <p>{multimedia.error ?? multimedia.data?.map((item) => item.nombre)}</p>
    <button onClick={() => void admin.subirMultimedia(new File(['demo'], 'demo.png'), 'productos')}>Subir demo</button>
    <button onClick={() => void admin.cambiarEstadoPago('4', 'APROBADO')}>Aprobar demo</button>
    <button onClick={() => void admin.crearProducto({ nombre: 'Demo', descripcion: '', categoriaId: '1',
      categoriaNombre: 'Demo', tipo: 'DETALLE', precio_base: 10, activo: true, imagenes: [] })}>Crear demo</button>
  </>
}

it('deduplica pedidos y solo reintenta el recurso que falló', async () => {
  vi.mocked(api.listarPedidosAdmin).mockRejectedValueOnce(new Error('Pedidos no disponibles')).mockResolvedValueOnce([pedido])
  render(<AdminProvider><Pedidos /><Pedidos /></AdminProvider>)
  expect(screen.getAllByText('Cargando pedidos')).toHaveLength(2)
  expect(await screen.findAllByText('Pedidos no disponibles')).toHaveLength(2)
  expect(screen.queryByText('Sin pedidos')).toBeNull()
  expect(api.listarPedidosAdmin).toHaveBeenCalledTimes(1)
  expect(api.listarMultimediaAdmin).not.toHaveBeenCalled()
  fireEvent.click(screen.getAllByRole('button', { name: 'Reintentar pedidos' })[0])
  expect(await screen.findAllByText('PED-00001')).toHaveLength(2)
  expect(api.listarPedidosAdmin).toHaveBeenCalledTimes(2)
  expect(api.listarPagosAdmin).not.toHaveBeenCalled()
})

it('aísla fallos de otros módulos y solo recarga el recurso guardado', async () => {
  vi.mocked(api.listarPedidosAdmin).mockResolvedValue([pedido])
  vi.mocked(api.listarMultimediaAdmin).mockRejectedValue(new Error('Multimedia no disponible'))
  vi.mocked(api.listarProductosAdmin).mockResolvedValue([])
  vi.mocked(api.listarPagosAdmin).mockResolvedValueOnce([]).mockRejectedValueOnce(new Error('No se pudieron recargar pagos'))
  render(<AdminProvider><Pedidos /><Operaciones /></AdminProvider>)
  expect(await screen.findByText('Multimedia no disponible')).toBeTruthy()
  expect(await screen.findByText('PED-00001')).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Aprobar demo' }))
  expect(await screen.findByText('Pago guardado, recarga fallida')).toBeTruthy()
  expect(api.verificarPago).toHaveBeenCalledWith('4', 'APROBADO')
  expect(api.listarPagosAdmin).toHaveBeenCalledTimes(2)
  fireEvent.click(screen.getByRole('button', { name: 'Crear demo' }))
  await waitFor(() => expect(api.listarProductosAdmin).toHaveBeenCalledTimes(2))
  expect(api.listarMultimediaAdmin).toHaveBeenCalledTimes(1)
  expect(api.listarPedidosAdmin).toHaveBeenCalledTimes(1)
  expect(api.obtenerDashboardAdmin).not.toHaveBeenCalled()
  expect(api.listarPagosAdmin).toHaveBeenCalledTimes(2)
})

it('descarta una respuesta pendiente de la sesión anterior', async () => {
  let resolver!: (datos: AdminOrder[]) => void
  vi.mocked(api.listarPedidosAdmin)
    .mockImplementationOnce(() => new Promise((completar) => { resolver = completar }))
    .mockResolvedValueOnce([])
  const vista = render(<AdminProvider><Pedidos /></AdminProvider>)
  await waitFor(() => expect(api.listarPedidosAdmin).toHaveBeenCalledTimes(1))
  sesion.token = 'sesion-2'
  vista.rerender(<AdminProvider><Pedidos /></AdminProvider>)
  expect(await screen.findByText('Sin pedidos')).toBeTruthy()
  await act(async () => resolver([pedido]))
  expect(screen.queryByText('PED-00001')).toBeNull()
})

it('incorpora la imagen subida sin recargar recursos ajenos', async () => {
  const imagen = { id: '8', nombre: 'Imagen nueva', tipoMime: 'image/png', tamanoKb: 1, url: '/demo.png', destino: 'productos', activo: true }
  vi.mocked(api.listarMultimediaAdmin).mockResolvedValueOnce([]).mockResolvedValueOnce([imagen])
  vi.mocked(api.listarProductosAdmin).mockResolvedValue([])
  vi.mocked(api.listarPagosAdmin).mockResolvedValue([])
  vi.mocked(api.subirMultimedia).mockResolvedValue(imagen)
  render(<AdminProvider><Operaciones /></AdminProvider>)
  await waitFor(() => expect(api.listarMultimediaAdmin).toHaveBeenCalledTimes(1))
  fireEvent.click(screen.getByRole('button', { name: 'Subir demo' }))
  expect(await screen.findByText('Imagen nueva')).toBeTruthy()
  await waitFor(() => expect(api.listarMultimediaAdmin).toHaveBeenCalledTimes(2))
  expect(api.listarProductosAdmin).toHaveBeenCalledTimes(1)
  expect(api.listarPagosAdmin).toHaveBeenCalledTimes(1)
  expect(api.listarPedidosAdmin).not.toHaveBeenCalled()
})
