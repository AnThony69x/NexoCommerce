import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import AdminEmptyState from '../../components/admin/AdminEmptyState'
import AdminSectionHeader from '../../components/admin/AdminSectionHeader'
import AdminStatusBadge from '../../components/admin/AdminStatusBadge'
import AdminTable from '../../components/admin/AdminTable'
import { useAdminMock } from '../../contexts/AdminMockContext'

const claseInput =
  'rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-800 outline-none focus:border-stone-500'

export default function AdminOrdersPage() {
  const { pedidos } = useAdminMock()
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [busqueda, setBusqueda] = useState('')

  const filtrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()
    return pedidos.filter((item) => {
      const coincideEstado =
        filtroEstado === 'todos' || item.estado === filtroEstado
      const coincideTexto =
        texto === '' ||
        item.numero.toLowerCase().includes(texto) ||
        item.clienteNombre.toLowerCase().includes(texto)
      return coincideEstado && coincideTexto
    })
  }, [pedidos, filtroEstado, busqueda])

  return (
    <div className="space-y-6">
      <AdminSectionHeader
        titulo="Pedidos"
        descripcion="Listado mock con estados PENDIENTE → EN_PREPARACION → LISTO → ENTREGADO."
      />

      <div className="flex flex-wrap gap-2">
        <input
          type="search"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por número o cliente"
          aria-label="Buscar pedidos"
          className={claseInput}
        />
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          aria-label="Filtrar por estado"
          className={claseInput}
        >
          <option value="todos">Todos los estados</option>
          <option value="PENDIENTE">PENDIENTE</option>
          <option value="EN_PREPARACION">EN_PREPARACION</option>
          <option value="LISTO">LISTO</option>
          <option value="ENTREGADO">ENTREGADO</option>
        </select>
      </div>

      {filtrados.length === 0 ? (
        <AdminEmptyState
          titulo="Sin pedidos"
          descripcion="No hay pedidos mock con los filtros actuales."
        />
      ) : (
        <AdminTable
          encabezados={[
            'Número',
            'Cliente',
            'Entrega',
            'Subtotal',
            'Total',
            'Estado',
            'Detalle',
          ]}
        >
          {filtrados.map((item) => (
            <tr key={item.id} className="border-b border-stone-100">
              <td className="px-4 py-3 font-medium text-stone-800">{item.numero}</td>
              <td className="px-4 py-3 text-stone-600">{item.clienteNombre}</td>
              <td className="px-4 py-3 text-stone-600">{item.fecha_entrega}</td>
              <td className="px-4 py-3 text-stone-600">
                ${item.subtotal.toFixed(2)}
              </td>
              <td className="px-4 py-3 text-stone-600">${item.total.toFixed(2)}</td>
              <td className="px-4 py-3">
                <AdminStatusBadge estado={item.estado} />
              </td>
              <td className="px-4 py-3">
                <Link
                  to={`/admin/pedidos/${item.id}`}
                  className="text-sm font-medium text-stone-800 hover:underline"
                >
                  Ver
                </Link>
              </td>
            </tr>
          ))}
        </AdminTable>
      )}
    </div>
  )
}
