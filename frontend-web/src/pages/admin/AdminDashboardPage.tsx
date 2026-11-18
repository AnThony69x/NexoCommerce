import { Link } from 'react-router-dom'
import AdminSectionHeader from '../../components/admin/AdminSectionHeader'
import AdminStatCard from '../../components/admin/AdminStatCard'
import AdminTable from '../../components/admin/AdminTable'
import { useAdminMock } from '../../contexts/AdminMockContext'
import { adminQuickAccessMock } from '../../data/adminDashboard.mock'

export default function AdminDashboardPage() {
  const { dashboard, recargar, cargando } = useAdminMock()

  return (
    <div className="space-y-6">
      <AdminSectionHeader
        titulo="Panel de administración"
        descripcion="Resumen operativo de pedidos, pagos, usuarios y catálogo."
        accion={<button type="button" disabled={cargando} onClick={() => void recargar()} className="min-h-10 rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 disabled:opacity-50">Actualizar</button>}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard
          etiqueta="Total de productos"
          valor={String(dashboard.productos_activos)}
          detalle="Productos activos visibles en el catálogo"
        />
        <AdminStatCard
          etiqueta="Pedidos pendientes"
          valor={String(dashboard.pedidos_pendientes)}
          detalle="Estado PENDIENTE"
        />
        <AdminStatCard
          etiqueta="Pagos pendientes"
          valor={String(dashboard.pagos_pendientes)}
          detalle="Por verificar"
        />
        <AdminStatCard
          etiqueta="Usuarios registrados"
          valor={String(dashboard.usuarios_registrados)}
          detalle="Requieren seguimiento"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <h2 className="text-base font-semibold text-stone-800">
            Productos con poco stock
          </h2>
          {dashboard.productos_stock_bajo.length === 0 ? (
            <p className="mt-2 text-sm text-stone-600">
              Sin alertas de stock por ahora.
            </p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm text-stone-700">
              {dashboard.productos_stock_bajo.map((item) => (
                <li key={item.id} className="flex justify-between gap-2">
                  <span>{item.nombre}</span>
                  <span className="font-semibold">Stock: {item.stock}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <h2 className="text-base font-semibold text-stone-800">
            Pedidos recientes
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-stone-700">
            {dashboard.pedidos_recientes.map((item) => (
              <li key={item.id} className="flex justify-between gap-2">
                <Link
                  to={`/admin/pedidos/${item.id}`}
                  className="font-medium text-stone-800 hover:underline"
                >
                  PED-{item.id.padStart(5, '0')}
                </Link>
                <span>{item.estado}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <AdminTable
        encabezados={['Módulo', 'Descripción', 'Acción']}
      >
        {adminQuickAccessMock.map((acceso) => (
          <tr key={acceso.titulo} className="border-b border-stone-100">
            <td className="px-4 py-3 font-medium text-stone-800">
              {acceso.titulo}
            </td>
            <td className="px-4 py-3 text-stone-600">{acceso.descripcion}</td>
            <td className="px-4 py-3">
              <Link
                to={acceso.href}
                className="text-sm font-medium text-stone-800 hover:underline"
              >
                Abrir
              </Link>
            </td>
          </tr>
        ))}
      </AdminTable>
    </div>
  )
}
