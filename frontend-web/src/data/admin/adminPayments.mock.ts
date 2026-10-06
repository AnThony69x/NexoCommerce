import type { AdminPayment } from '../../types/admin'

export const adminPaymentsMock: AdminPayment[] = [
  {
    id: 'pago-001',
    pedidoId: 'ped-001',
    pedidoNumero: 'PED-001',
    metodo: 'TRANSFERENCIA',
    monto: 77,
    estado: 'PENDIENTE',
    referencia: 'TRF-1001-mock',
    fecha: '2026-10-06',
    comprobanteMock: 'comprobante-ped-001.pdf (mock)',
  },
  {
    id: 'pago-002',
    pedidoId: 'ped-002',
    pedidoNumero: 'PED-002',
    metodo: 'PASARELA',
    monto: 56,
    estado: 'APROBADO',
    referencia: 'PAY-2002-mock',
    fecha: '2026-10-06',
  },
  {
    id: 'pago-003',
    pedidoId: 'ped-003',
    pedidoNumero: 'PED-003',
    metodo: 'TRANSFERENCIA',
    monto: 18,
    estado: 'RECHAZADO',
    referencia: 'TRF-1003-mock',
    fecha: '2026-10-05',
    comprobanteMock: 'comprobante-ped-003.pdf (mock)',
  },
]
