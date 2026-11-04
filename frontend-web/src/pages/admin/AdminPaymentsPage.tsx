import { useMemo, useState } from 'react'
import AdminConfirmModal from '../../components/admin/AdminConfirmModal'
import AdminEmptyState from '../../components/admin/AdminEmptyState'
import AdminFeedback from '../../components/admin/AdminFeedback'
import AdminSectionHeader from '../../components/admin/AdminSectionHeader'
import AdminStatusBadge from '../../components/admin/AdminStatusBadge'
import AdminTable from '../../components/admin/AdminTable'
import { useAdminMock } from '../../contexts/AdminMockContext'
import type { AdminFeedbackMessage, AdminPayment } from '../../types/admin'

const claseInput =
  'rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-800 outline-none focus:border-stone-500'

export default function AdminPaymentsPage() {
  const { pagos, cambiarEstadoPago } = useAdminMock()
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [filtroMetodo, setFiltroMetodo] = useState('todos')
  const [confirmando, setConfirmando] = useState<
    { pago: AdminPayment; estado: 'APROBADO' | 'RECHAZADO' } | undefined
  >(undefined)
  const [comprobante, setComprobante] = useState<AdminPayment | undefined>(undefined)
  const [mensaje, setMensaje] = useState<AdminFeedbackMessage | null>(null)

  const filtrados = useMemo(
    () =>
      pagos.filter((item) => {
        const coincideEstado =
          filtroEstado === 'todos' || item.estado === filtroEstado
        const coincideMetodo =
          filtroMetodo === 'todos' || item.metodo === filtroMetodo
        return coincideEstado && coincideMetodo
      }),
    [pagos, filtroEstado, filtroMetodo],
  )

  function confirmarCambio() {
    if (!confirmando) return
    cambiarEstadoPago(confirmando.pago.id, confirmando.estado)
    setMensaje({
      tipo: 'exito',
      texto: `Pago ${confirmando.estado.toLowerCase()} (mock).`,
    })
    setConfirmando(undefined)
  }

  return (
    <div className="space-y-6">
      <AdminSectionHeader
        titulo="Pagos"
        descripcion="Verificación mock de PASARELA y TRANSFERENCIA."
      />

      <AdminFeedback mensaje={mensaje} />

      <div className="flex flex-wrap gap-2">
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          aria-label="Filtrar por estado"
          className={claseInput}
        >
          <option value="todos">Todos los estados</option>
          <option value="PENDIENTE">PENDIENTE</option>
          <option value="APROBADO">APROBADO</option>
          <option value="RECHAZADO">RECHAZADO</option>
        </select>
        <select
          value={filtroMetodo}
          onChange={(e) => setFiltroMetodo(e.target.value)}
          aria-label="Filtrar por método"
          className={claseInput}
        >
          <option value="todos">Todos los métodos</option>
          <option value="PASARELA">PASARELA</option>
          <option value="TRANSFERENCIA">TRANSFERENCIA</option>
        </select>
      </div>

      {filtrados.length === 0 ? (
        <AdminEmptyState
          titulo="Sin pagos"
          descripcion="No hay pagos mock con los filtros actuales."
        />
      ) : (
        <AdminTable
          encabezados={[
            'Pedido',
            'Método',
            'Monto',
            'Estado',
            'Referencia',
            'Fecha',
            'Acciones',
          ]}
        >
          {filtrados.map((item) => (
            <tr key={item.id} className="border-b border-stone-100">
              <td className="px-4 py-3 font-medium text-stone-800">
                {item.pedidoNumero}
              </td>
              <td className="px-4 py-3 text-stone-600">{item.metodo}</td>
              <td className="px-4 py-3 text-stone-600">
                ${item.monto.toFixed(2)}
              </td>
              <td className="px-4 py-3">
                <AdminStatusBadge estado={item.estado} />
              </td>
              <td className="px-4 py-3 text-stone-600">{item.referencia}</td>
              <td className="px-4 py-3 text-stone-600">{item.fecha}</td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2 text-sm">
                  {item.metodo === 'TRANSFERENCIA' && (
                    <button
                      type="button"
                      onClick={() => setComprobante(item)}
                      className="font-medium text-stone-800 hover:underline"
                    >
                      Comprobante
                    </button>
                  )}
                  {item.estado === 'PENDIENTE' && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          setConfirmando({ pago: item, estado: 'APROBADO' })
                        }
                        className="font-medium text-emerald-700 hover:underline"
                      >
                        Aprobar
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setConfirmando({ pago: item, estado: 'RECHAZADO' })
                        }
                        className="font-medium text-rose-700 hover:underline"
                      >
                        Rechazar
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </AdminTable>
      )}

      {comprobante && (
        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <h2 className="text-base font-semibold text-stone-800">
            Comprobante mock de {comprobante.pedidoNumero}
          </h2>
          <p className="mt-2 text-sm text-stone-600">
            {comprobante.comprobanteMock ?? 'Sin comprobante mock.'}
          </p>
          <button
            type="button"
            onClick={() => setComprobante(undefined)}
            className="mt-3 inline-flex min-h-10 items-center rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:border-stone-500"
          >
            Cerrar
          </button>
        </div>
      )}

      <AdminConfirmModal
        abierto={confirmando !== undefined}
        titulo={`${confirmando?.estado === 'APROBADO' ? 'Aprobar' : 'Rechazar'} pago`}
        descripcion={`¿Confirmas cambiar el pago de ${confirmando?.pago.pedidoNumero} a ${confirmando?.estado}? Acción mock.`}
        textoConfirmar={confirmando?.estado === 'APROBADO' ? 'Aprobar' : 'Rechazar'}
        onCancelar={() => setConfirmando(undefined)}
        onConfirmar={confirmarCambio}
      />
    </div>
  )
}
