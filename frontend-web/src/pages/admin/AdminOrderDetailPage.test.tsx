import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { Link, MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterAll, beforeAll, beforeEach, expect, it, vi } from 'vitest'
import { abrirMultimediaPrivada, obtenerPagoPedidoAdmin, obtenerPedidoAdmin } from '../../services/adminService'
import type { AdminOrder } from '../../types/admin'
import { ApiError } from '../../types/api'
import AdminOrderDetailPage from './AdminOrderDetailPage'

const { cambiarEstadoPedido } = vi.hoisted(() => ({ cambiarEstadoPedido: vi.fn() }))
vi.mock('../../contexts/AdminContext', () => ({ useAdmin: () => ({ cambiarEstadoPedido }) }))
vi.mock('../../services/adminService', () => ({
  obtenerPedidoAdmin: vi.fn(), obtenerPagoPedidoAdmin: vi.fn(), abrirMultimediaPrivada: vi.fn(),
}))

// jsdom does not implement the native dialog methods.
const prototipo = HTMLDialogElement.prototype
const metodos = {
  showModal(this: HTMLDialogElement) { this.setAttribute('open', '') },
  close(this: HTMLDialogElement) { this.removeAttribute('open') },
}
const originales = Object.getOwnPropertyDescriptors(prototipo)
beforeAll(() => {
  Object.defineProperty(URL, "revokeObjectURL", { configurable: true, value: vi.fn() })
  for (const [nombre, metodo] of Object.entries(metodos)) {
    Object.defineProperty(prototipo, nombre, { configurable: true, value: metodo })
  }
})
afterAll(() => {
  Reflect.deleteProperty(URL, "revokeObjectURL")
  for (const nombre of Object.keys(metodos)) {
    if (originales[nombre]) Object.defineProperty(prototipo, nombre, originales[nombre])
    else Reflect.deleteProperty(prototipo, nombre)
  }
})

const pedido: AdminOrder = {
  id: '128', numero: 'PED-00128', estado: 'PENDIENTE', clienteNombre: 'Cliente Demo',
  clienteCorreo: 'cliente@example.test', clienteTelefono: '0990000001', telefonoContacto: '0990000002',
  fecha_entrega: '2026-11-20', horaEntrega: '15:30', tipo_entrega: 'DOMICILIO',
  direccion: 'Dirección demo', subtotal: 22, total: 22,
  detalles: [{ id: '1', productoNombre: 'Torta', cantidad: 1, precio_unitario: 22, subtotal: 22,
    nombreDiseno: 'Flores', tipoConfiguracion: 'DISENO_TORTA', costoDiseno: 2, indicaciones: 'Empacar con lazo' }],
}

function abrir() {
  render(<MemoryRouter initialEntries={['/admin/pedidos/128']}>
    <Link to="/admin/pedidos/129">Otro pedido</Link>
    <Routes><Route path="/admin/pedidos/:id" element={<AdminOrderDetailPage />} /></Routes>
  </MemoryRouter>)
}

beforeEach(() => {
  vi.resetAllMocks()
  vi.mocked(obtenerPagoPedidoAdmin).mockResolvedValue(null)
})

it.each([
  ['PENDIENTE', undefined, 'Sin pago registrado'],
  ['PENDIENTE', 'PENDIENTE', 'Pendiente de revisión'],
  ['PENDIENTE', 'RECHAZADO', 'Rechazado'],
  ['CANCELADO', 'APROBADO', 'Pedido cancelado.'],
  ['ENTREGADO', 'APROBADO', 'Pedido entregado.'],
] as const)('muestra %s con pago %s sin ofrecer una transición inválida', async (estado, pago_estado, texto) => {
  vi.mocked(obtenerPedidoAdmin).mockResolvedValue({ ...pedido, estado, pago_estado })
  abrir()
  expect(await screen.findByText(texto)).toBeTruthy()
  expect(screen.queryByRole('button', { name: /preparación|marcar|avanzar/i })).toBeNull()
})

it('muestra los datos operativos y recarga tras guardar una sola vez', async () => {
  vi.mocked(obtenerPedidoAdmin)
    .mockResolvedValueOnce({ ...pedido, pago_estado: 'APROBADO' })
    .mockResolvedValueOnce({ ...pedido, estado: 'EN_PREPARACION', pago_estado: 'APROBADO' })
  let completar!: () => void
  cambiarEstadoPedido.mockReturnValue(new Promise<void>((resolver) => { completar = resolver }))
  abrir()
  fireEvent.click(await screen.findByRole('button', { name: 'Iniciar preparación' }))
  expect(screen.getByText(/15:30/)).toBeTruthy()
  expect(screen.getByText('Teléfono de contacto: 0990000002')).toBeTruthy()
  expect(screen.getByText('Diseño: Flores')).toBeTruthy()
  expect(screen.getByText('Recargo: $2.00')).toBeTruthy()
  expect(screen.getByText('Indicaciones: Empacar con lazo')).toBeTruthy()
  fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Iniciar preparación' }))
  const guardando = screen.getByRole('button', { name: 'Guardando…' }) as HTMLButtonElement
  expect(guardando.disabled).toBe(true)
  fireEvent.click(guardando)
  expect(cambiarEstadoPedido).toHaveBeenCalledExactlyOnceWith('128', 'EN_PREPARACION')
  await act(async () => completar())
  expect(await screen.findByRole('button', { name: 'Marcar como listo' })).toBeTruthy()
})

it('distingue el fallo de carga del 404 tras reintentar', async () => {
  vi.mocked(obtenerPedidoAdmin).mockRejectedValueOnce(new Error('Sin conexión')).mockRejectedValueOnce(new ApiError(404, 'No existe'))
  abrir()
  await screen.findByText('Sin conexión')
  fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }))
  expect(await screen.findByText('Pedido no encontrado')).toBeTruthy()
})

it('recarga después de un conflicto de pago y bloquea la preparación', async () => {
  vi.mocked(obtenerPedidoAdmin)
    .mockResolvedValueOnce({ ...pedido, pago_estado: 'APROBADO' })
    .mockResolvedValueOnce({ ...pedido, pago_estado: 'PENDIENTE' })
  cambiarEstadoPedido.mockRejectedValue(new ApiError(400, 'El pago cambió.', undefined, 'PED_PAGO_NO_APROBADO'))
  abrir()
  fireEvent.click(await screen.findByRole('button', { name: 'Iniciar preparación' }))
  fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Iniciar preparación' }))
  expect(await screen.findByText('Pendiente de revisión')).toBeTruthy()
  expect(screen.getByText('El pago cambió.')).toBeTruthy()
  expect(screen.queryByRole('button', { name: 'Iniciar preparación' })).toBeNull()
})

it('descarta la respuesta anterior al cambiar de pedido', async () => {
  let completar!: (resultado: AdminOrder) => void
  vi.mocked(obtenerPedidoAdmin)
    .mockReturnValueOnce(new Promise((resolver) => { completar = resolver }))
    .mockResolvedValueOnce({ ...pedido, id: '129', numero: 'PED-00129', tipo_entrega: 'RETIRO' })
  abrir()
  fireEvent.click(screen.getByRole('link', { name: 'Otro pedido' }))
  expect(await screen.findByText('Retiro en tienda')).toBeTruthy()
  await act(async () => completar(pedido))
  expect(screen.getByText('Pedido PED-00129')).toBeTruthy()
  expect(screen.queryByText('Pedido PED-00128')).toBeNull()
})

it('mantiene el pedido visible si la consulta del comprobante falla y permite reintentar', async () => {
  vi.mocked(obtenerPedidoAdmin).mockResolvedValue({ ...pedido, pagoId: '50', pago_estado: 'PENDIENTE', metodo_pago: 'TRANSFERENCIA' })
  vi.mocked(obtenerPagoPedidoAdmin).mockRejectedValueOnce(new Error('No se pudo consultar el pago')).mockResolvedValueOnce({
    id: '50', pedidoId: '128', pedidoNumero: 'PED-00128', monto: 22,
    metodo: 'TRANSFERENCIA', estado: 'PENDIENTE', referencia: '', fecha: '', comprobanteId: '20',
  })
  vi.mocked(abrirMultimediaPrivada).mockResolvedValue('blob:comprobante')
  abrir()
  await screen.findByText('No se pudo consultar el pago')
  expect(screen.getByText('Torta')).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }))
  fireEvent.click(await screen.findByRole('button', { name: 'Ver comprobante' }))
  expect((await screen.findByRole('link', { name: 'Abrir comprobante a tamaño completo' })).getAttribute('href')).toBe('blob:comprobante')
  expect(abrirMultimediaPrivada).toHaveBeenCalledWith('20')
})

it('distingue un cambio guardado de una recarga fallida', async () => {
  cambiarEstadoPedido.mockResolvedValue(undefined)
  vi.mocked(obtenerPedidoAdmin)
    .mockResolvedValueOnce({ ...pedido, estado: 'LISTO', pago_estado: 'APROBADO' })
    .mockRejectedValueOnce(new Error('Sin conexión'))
    .mockResolvedValueOnce({ ...pedido, estado: 'ENTREGADO', pago_estado: 'APROBADO' })
  abrir()
  fireEvent.click(await screen.findByRole('button', { name: 'Marcar como entregado' }))
  fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Marcar como entregado' }))
  expect(await screen.findByText(/No se pudo actualizar la vista/)).toBeTruthy()
  expect(screen.getByText('Estado actualizado.')).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Actualizar pedido' }))
  expect(await screen.findByText('Pedido entregado.')).toBeTruthy()
})
