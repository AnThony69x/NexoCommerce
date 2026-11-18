import AdminResourceState from '../../components/admin/AdminResourceState'
import { useAdminQueryFilter } from '../../hooks/useAdminQueryFilter'
import { Link } from 'react-router-dom'
import AdminDialog from '../../components/admin/AdminDialog'
import { ComprobantePrivado } from '../../components/admin/ComprobanteDialog'
import { formatPrice } from '../../utils/formatPrice'
import { useMemo, useState, type ReactNode } from 'react'
import AdminConfirmModal from '../../components/admin/AdminConfirmModal'
import AdminEmptyState from '../../components/admin/AdminEmptyState'
import AdminFeedback from '../../components/admin/AdminFeedback'
import AdminSectionHeader from '../../components/admin/AdminSectionHeader'
import AdminStatusBadge from '../../components/admin/AdminStatusBadge'
import AdminTable from '../../components/admin/AdminTable'
import { useAdmin, useAdminResource } from '../../contexts/AdminContext'
import type { AdminFeedbackMessage, AdminPayment } from '../../types/admin'

const claseInput =
  'rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-800 outline-none focus:border-stone-500'

export default function AdminPaymentsPage() {
  const recurso = useAdminResource('pagos')
  const pagos = recurso.data ?? []
  const { cambiarEstadoPago } = useAdmin()
  const [filtroEstado, setFiltroEstado] = useAdminQueryFilter('estado', ['PENDIENTE', 'APROBADO', 'RECHAZADO'], 'todos')
  const [filtroMetodo, setFiltroMetodo] = useState('todos')
  const [confirmando, setConfirmando] = useState<
    { pago: AdminPayment; estado: 'APROBADO' | 'RECHAZADO' } | undefined
  >(undefined)
  const [pagoSeleccionadoId, setPagoSeleccionadoId] = useState<string>()
  const detalle = pagos.find((pago) => pago.id === pagoSeleccionadoId)
  const revisores = useAdminResource('usuarios', Boolean(detalle?.revisorId))
  const usuarios = revisores.data ?? []
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

  async function confirmarCambio() {
    if (!confirmando) return
    try {
      await cambiarEstadoPago(confirmando.pago.id, confirmando.estado)
      setMensaje({ tipo: 'exito', texto: `Pago ${confirmando.estado.toLowerCase()}.` })
      setConfirmando(undefined)
    } catch (error) {
      throw error instanceof Error ? error : new Error('No se pudo verificar el pago.')
    }
  }

  return (
    <AdminResourceState recurso={recurso} nombre="Pagos">
    <div className="space-y-6">
      <AdminSectionHeader
        titulo="Pagos"
        descripcion="Revisa los pagos registrados y verifica las transferencias pendientes."
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
          descripcion="No hay pagos que coincidan con los filtros actuales."
        />
      ) : (
        <AdminTable
          encabezados={[
            'Pedido',
            'Método',
            'Monto',
            'Estado',
            'Referencia',
            'Fecha de registro',
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
                {formatPrice(item.monto)}
              </td>
              <td className="px-4 py-3">
                <AdminStatusBadge estado={item.estado} />
              </td>
              <td className="px-4 py-3 text-stone-600">{item.referencia || '—'}</td>
              <td className="px-4 py-3 text-stone-600">{formatearFecha(item.fechaRegistro)}</td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2 text-sm">
                  <button type="button" onClick={(evento) => {
                    evento.currentTarget.focus()
                    setPagoSeleccionadoId(item.id)
                  }} className="font-medium text-stone-800 hover:underline">
                    Ver detalle
                  </button>
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

      {detalle && (
        <DetallePago key={detalle.id} pago={detalle}
          avisoRevisor={detalle.revisorId && <AdminResourceState recurso={revisores} nombre="Responsable de revisión" />}
          revisor={usuarios.find((usuario) => usuario.id === detalle.revisorId)?.nombre_completo}
          onCerrar={() => setPagoSeleccionadoId(undefined)} />
      )}

      <AdminConfirmModal
        abierto={confirmando !== undefined}
        titulo={`${confirmando?.estado === 'APROBADO' ? 'Aprobar' : 'Rechazar'} pago`}
        descripcion={`¿Confirmas cambiar el pago de ${confirmando?.pago.pedidoNumero} a ${confirmando?.estado}?`}
        textoConfirmar={confirmando?.estado === 'APROBADO' ? 'Aprobar' : 'Rechazar'}
        onCancelar={() => setConfirmando(undefined)}
        onConfirmar={confirmarCambio}
      />
    </div>
    </AdminResourceState>
  )
}


const formatoFecha = new Intl.DateTimeFormat('es-EC', { dateStyle: 'medium', timeStyle: 'short' })

function formatearFecha(valor?: string) {
  const fecha = valor ? new Date(valor) : null
  return fecha && !Number.isNaN(fecha.getTime()) ? formatoFecha.format(fecha) : '—'
}

function DetallePago({ pago, revisor, avisoRevisor, onCerrar }: { pago: AdminPayment; revisor?: string; avisoRevisor?: ReactNode; onCerrar: () => void }) {
  const estados = { PENDIENTE: 'Pendiente', APROBADO: 'Aprobado', RECHAZADO: 'Rechazado' }
  const estadosPedido = { PENDIENTE: 'Pendiente', EN_PREPARACION: 'En preparación', LISTO: 'Listo', ENTREGADO: 'Entregado', CANCELADO: 'Cancelado' }

  return (
    <AdminDialog titulo={`Detalle del pago #${pago.id}`} onCerrar={onCerrar}>
      <div className="space-y-5 text-sm">
        <dl className="grid gap-3 sm:grid-cols-2">
          <div><dt className="font-semibold">Método</dt><dd>{pago.metodo === 'TRANSFERENCIA' ? 'Transferencia' : 'Referencia de pago'}</dd></div>
          <div><dt className="font-semibold">Monto</dt><dd>{formatPrice(pago.monto)}</dd></div>
          <div><dt className="font-semibold">Estado del pago</dt><dd><AdminStatusBadge estado={pago.estado} etiqueta={estados[pago.estado]} /></dd></div>
          {pago.referencia && <div><dt className="font-semibold">Referencia</dt><dd className="break-all">{pago.referencia}</dd></div>}
          <div><dt className="font-semibold">Registrado</dt><dd>{formatearFecha(pago.fechaRegistro)}</dd></div>
          <div><dt className="font-semibold">Aprobado</dt><dd>{formatearFecha(pago.fecha)}</dd></div>
        </dl>

        <section className="space-y-2 border-t pt-4">
          <h3 className="font-semibold">Pedido {pago.pedidoNumero}</h3>
          {pago.pedidoEstado && <p>Estado: {estadosPedido[pago.pedidoEstado]}</p>}
          <Link className="font-medium underline" to={`/admin/pedidos/${pago.pedidoId}`}>Ver pedido</Link>
        </section>

        {pago.metodo === 'TRANSFERENCIA' && (
          <section className="space-y-2 border-t pt-4">
            <h3 className="font-semibold">Comprobante</h3>
            <ComprobantePrivado key={pago.comprobanteId} comprobanteId={pago.comprobanteId} />
            {pago.fechaRevision && <p>Revisado: {formatearFecha(pago.fechaRevision)}</p>}
            {avisoRevisor}
            {pago.revisorId && <p>Responsable: {revisor || `Usuario #${pago.revisorId}`}</p>}
            {pago.comentarioRevision && <p className="whitespace-pre-wrap break-words">Comentario: {pago.comentarioRevision}</p>}
          </section>
        )}
        <button type="button" onClick={onCerrar} className="rounded-lg border px-4 py-2">Cerrar</button>
      </div>
    </AdminDialog>
  )
}
