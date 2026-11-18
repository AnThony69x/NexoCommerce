import { Link } from 'react-router-dom'
import AdminSectionHeader from '../../components/admin/AdminSectionHeader'
import AdminStatCard from '../../components/admin/AdminStatCard'
import AdminStatusBadge from '../../components/admin/AdminStatusBadge'
import AdminTable from '../../components/admin/AdminTable'
import AdminResourceState from '../../components/admin/AdminResourceState'
import { adminQuickAccess } from '../../data/adminQuickAccess'
import { useAdminResource } from '../../contexts/AdminContext'
import { formatPrice } from '../../utils/formatPrice'

const inventario = '/admin/productos?stock=bajo'
const tarjeta = 'rounded-2xl border border-stone-200 bg-white p-5'
const vinculo = 'font-medium text-stone-800 underline underline-offset-4 hover:text-rose-800'
const estados = {
  PENDIENTE: 'Pendiente', EN_PREPARACION: 'En preparación', LISTO: 'Listo',
  ENTREGADO: 'Entregado', CANCELADO: 'Cancelado',
}
const fecha = new Intl.DateTimeFormat('es-EC', { dateStyle: 'medium', timeZone: 'UTC' })

export default function AdminDashboardPage() {
  const recurso = useAdminResource('dashboard')
  const { data: dashboard, loading, recargar } = recurso

  return (
    <div className="space-y-6">
      <AdminSectionHeader
        titulo="Panel de administración"
        accion={<button type="button" disabled={loading} onClick={recargar} className="min-h-10 rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 disabled:opacity-50">Actualizar</button>}
      />

      <AdminResourceState recurso={recurso} nombre="Resumen operativo">
      {dashboard && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {([
              ['Pedidos pendientes', dashboard.pedidos_pendientes, '/admin/pedidos?estado=PENDIENTE'],
              ['Listos para entregar', dashboard.pedidos_listos, '/admin/pedidos?estado=LISTO'],
              ['Pagos por verificar', dashboard.pagos_pendientes, '/admin/pagos?estado=PENDIENTE'],
              ['Productos con stock bajo', dashboard.total_productos_stock_bajo, inventario],
            ] as const).map(([etiqueta, valor, href]) => (
              <Link key={href} to={href} className="rounded-2xl transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-rose-700">
                <AdminStatCard etiqueta={etiqueta} valor={String(valor)} />
              </Link>
            ))}
          </div>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <section className="min-w-0 space-y-3">
              <h2 className="text-base font-semibold text-stone-800">Pedidos recientes</h2>
              {dashboard.pedidos_recientes.length === 0 ? (
                <p className={tarjeta}>Aún no hay pedidos registrados.</p>
              ) : (
                <AdminTable encabezados={['Pedido', 'Cliente', 'Entrega', 'Total', 'Estado']}>
                  {dashboard.pedidos_recientes.map((item) => (
                    <tr key={item.id} className="border-b border-stone-100">
                      <td className="whitespace-nowrap px-4 py-3"><Link className={vinculo} to={`/admin/pedidos/${item.id}`}>PED-{item.id.padStart(5, '0')}</Link></td>
                      <td className="px-4 py-3">{item.cliente}</td>
                      <td className="whitespace-nowrap px-4 py-3">{item.fechaEntrega ? fecha.format(new Date(`${item.fechaEntrega}T00:00:00Z`)) : '—'}</td>
                      <td className="whitespace-nowrap px-4 py-3">{formatPrice(item.total)}</td>
                      <td className="whitespace-nowrap px-4 py-3"><AdminStatusBadge estado={item.estado} etiqueta={estados[item.estado]} /></td>
                    </tr>
                  ))}
                </AdminTable>
              )}
            </section>

            <section className={tarjeta}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-base font-semibold text-stone-800">Alertas de inventario</h2>
                <Link className={`${vinculo} text-sm`} to={inventario}>Ver inventario</Link>
              </div>
              {dashboard.productos_stock_bajo.length === 0 ? (
                <p className="mt-3 text-sm text-stone-600">Sin alertas de stock.</p>
              ) : (
                <ul className="mt-2 divide-y divide-stone-100 text-sm">
                  {dashboard.productos_stock_bajo.map((item) => (
                    <li key={item.id} className="flex items-center justify-between gap-2 py-2">
                      <span>{item.nombre}</span>
                      <AdminStatusBadge estado={item.stock === 0 ? 'RECHAZADO' : 'PENDIENTE'}
                        etiqueta={item.stock === 0 ? 'Agotado' : `Stock bajo · ${item.stock}`} />
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <p className="text-sm text-stone-600">
            {dashboard.productos_activos} productos activos · {dashboard.usuarios_registrados} usuarios registrados
          </p>
        </>
      )}

      </AdminResourceState>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-stone-800">Accesos rápidos</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {adminQuickAccess.map((acceso) => (
            <Link key={acceso.href} to={acceso.href} className={`${tarjeta} block py-3 hover:border-rose-300`}>
              <span className="block text-sm font-semibold text-stone-800">{acceso.titulo}</span>
              <span className="text-xs text-stone-600">{acceso.descripcion}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
