import type { AdminMedia } from '../../types/admin'

export const adminMediaMock: AdminMedia[] = [
  {
    id: 'med-001',
    nombre: 'torta-rosas.jpg',
    tipoMime: 'image/jpeg',
    tamanoKb: 420,
    ancho: 1200,
    alto: 800,
    url: 'product-cake-placeholder.svg',
    destino: 'productos',
    activo: true,
  },
  {
    id: 'med-002',
    nombre: 'comprobante-ped-001.pdf',
    tipoMime: 'application/pdf',
    tamanoKb: 180,
    url: 'comprobante mock, sin archivo real',
    destino: 'comprobantes',
    activo: true,
  },
  {
    id: 'med-003',
    nombre: 'taza-flores.png',
    tipoMime: 'image/png',
    tamanoKb: 310,
    ancho: 800,
    alto: 800,
    url: 'product-mug-placeholder.svg',
    destino: 'personalizaciones',
    activo: false,
  },
]
