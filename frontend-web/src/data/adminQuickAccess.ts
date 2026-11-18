import type { AdminQuickAccessItem } from '../types/admin'

export const adminQuickAccess: AdminQuickAccessItem[] = [
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
