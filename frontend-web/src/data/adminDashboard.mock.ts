import type {
  AdminQuickAccessItem,
  AdminSummaryItem,
} from '../types/admin'

export const adminSummaryMock: AdminSummaryItem[] = [
  {
    etiqueta: 'Productos activos',
    valor: '24',
    detalle: 'Dato mock temporal',
  },
  {
    etiqueta: 'Pedidos pendientes',
    valor: '6',
    detalle: 'Dato mock temporal',
  },
  {
    etiqueta: 'Pagos por verificar',
    valor: '3',
    detalle: 'Dato mock temporal',
  },
]

export const adminQuickAccessMock: AdminQuickAccessItem[] = [
  {
    titulo: 'Productos',
    descripcion: 'Catálogo y personalización',
    href: '/admin/productos',
  },
  {
    titulo: 'Categorías',
    descripcion: 'Árbol y organización',
    href: '/admin/categorias',
  },
  {
    titulo: 'Pedidos',
    descripcion: 'Seguimiento y estados',
    href: '/admin/pedidos',
  },
  {
    titulo: 'Pagos',
    descripcion: 'Verificación y comprobantes',
    href: '/admin/pagos',
  },
  {
    titulo: 'Usuarios',
    descripcion: 'Clientes y roles',
    href: '/admin/usuarios',
  },
  {
    titulo: 'Publicaciones',
    descripcion: 'Contenido editorial',
    href: '/admin/publicaciones',
  },
  {
    titulo: 'Multimedia',
    descripcion: 'Imágenes y archivos',
    href: '/admin/multimedia',
  },
  {
    titulo: 'Producción',
    descripcion: 'Capacidad y cupos',
    href: '/admin/produccion',
  },
  {
    titulo: 'Configuración',
    descripcion: 'Datos de la tienda',
    href: '/admin/configuracion',
  },
]
