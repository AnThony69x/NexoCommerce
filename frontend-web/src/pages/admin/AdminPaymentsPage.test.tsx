import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterAll, beforeAll, expect, it, vi } from 'vitest'
import { abrirMultimediaPrivada } from '../../services/adminService'
import type { AdminPayment } from '../../types/admin'
import AdminPaymentsPage from './AdminPaymentsPage'

const { contexto } = vi.hoisted(() => ({ contexto: { pagos: [] as AdminPayment[], usuarios: [], cambiarEstadoPago: vi.fn() } }))
vi.mock('../../contexts/AdminContext', () => ({ useAdmin: () => contexto,
  useAdminResource: (clave: 'pagos' | 'usuarios') => ({ data: contexto[clave], loading: false, error: null, recargar: vi.fn() }) }))
vi.mock('../../services/adminService', () => ({ abrirMultimediaPrivada: vi.fn() }))

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

const base: AdminPayment = {
  id: '10', pedidoId: '128', pedidoNumero: 'PED-00128', monto: 25, metodo: 'TRANSFERENCIA',
  estado: 'RECHAZADO', referencia: '', fecha: '', fechaRegistro: '2026-11-18T10:30:00Z', pedidoEstado: 'PENDIENTE',
}

it('abre el intento correcto, reintenta el comprobante y conserva filtro y foco', async () => {
  contexto.pagos = [
    { ...base, comprobanteId: '90', revisorId: '7', comentarioRevision: 'Monto incorrecto' },
    { ...base, id: '11', estado: 'PENDIENTE' },
    { ...base, id: '12', metodo: 'PASARELA', referencia: 'REF-12' },
  ]
  vi.mocked(abrirMultimediaPrivada)
    .mockRejectedValueOnce(new Error('Archivo no disponible'))
    .mockResolvedValueOnce('blob:comprobante')
  render(<MemoryRouter><AdminPaymentsPage /></MemoryRouter>)
  const filtro = screen.getByLabelText('Filtrar por método') as HTMLSelectElement
  fireEvent.change(filtro, { target: { value: 'TRANSFERENCIA' } })
  const botones = screen.getAllByRole('button', { name: 'Ver detalle' })
  expect(botones).toHaveLength(2)
  fireEvent.click(botones[0])
  let panel = within(screen.getByRole('dialog', { name: 'Detalle del pago #10' }))
  expect(panel.getByText('Comentario: Monto incorrecto')).toBeTruthy()
  expect(panel.getByText('Responsable: Usuario #7')).toBeTruthy()
  expect(panel.getByRole('link', { name: 'Ver pedido' }).getAttribute('href')).toBe('/admin/pedidos/128')
  await panel.findByText('Archivo no disponible')
  fireEvent.click(panel.getByRole('button', { name: 'Reintentar' }))
  expect(await panel.findByRole('link', { name: /abrir comprobante/i })).toBeTruthy()
  fireEvent.click(panel.getByRole('button', { name: 'Cerrar' }))
  expect(document.activeElement).toBe(botones[0])
  expect(filtro.value).toBe('TRANSFERENCIA')

  fireEvent.click(botones[1])
  panel = within(screen.getByRole('dialog', { name: 'Detalle del pago #11' }))
  expect(panel.getByText('Sin comprobante adjunto')).toBeTruthy()
  expect(panel.queryByText('Comentario: Monto incorrecto')).toBeNull()
  fireEvent.click(panel.getByRole('button', { name: 'Cerrar' }))
  fireEvent.change(filtro, { target: { value: 'PASARELA' } })
  fireEvent.click(screen.getByRole('button', { name: 'Ver detalle' }))
  panel = within(screen.getByRole('dialog', { name: 'Detalle del pago #12' }))
  expect(panel.getByText('REF-12')).toBeTruthy()
  expect(panel.queryByText('Comprobante')).toBeNull()
})
