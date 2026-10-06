import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import AdminConfirmModal from '../../components/admin/AdminConfirmModal'
import AdminEmptyState from '../../components/admin/AdminEmptyState'
import AdminFeedback from '../../components/admin/AdminFeedback'
import AdminSectionHeader from '../../components/admin/AdminSectionHeader'
import AdminStatusBadge from '../../components/admin/AdminStatusBadge'
import AdminTable from '../../components/admin/AdminTable'
import { useAdminMock } from '../../contexts/AdminMockContext'
import { PEDIDO_FLUJO } from '../../types/admin'
import type { AdminFeedbackMessage } from '../../types/admin'

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { obtenerPedido, avanzarPedido } = useAdminMock()
  const [confirmando, setConfirmando] = useState(false)
  const [mensaje, setMensaje] = useState<AdminFeedbackMessage | null>(null)

  const pedido = id ? obtenerPedido(id) : undefined

  if (!pedido) {
    return (
      <div className="space-y-6">
        <AdminSectionHeader titulo="Detalle del pedido" />
        <AdminEmptyState
          titulo="Registro no encontrado"
          descripcion="El pedido mock solicitado no existe."
          accion={
            <Link
              to="/admin/pedidos"
              className="inline-flex min-h-10 items-center rounded-lg bg-stone-800 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700"
            >
              Volver a pedidos
            </Link>
          }
        />
      </div>
    )
  }

  const indice = PEDIDO_FLUJO.indexOf(pedido.estado)
  const siguiente = PEDIDO_FLUJO[indice + 1]
  const pedidoId = pedido.id

  function confirmarAvance() {
    const avanzo = avanzarPedido(pedidoId)
    setConfirmando(false)
    setMensaje(
      avanzo
        ? { tipo: 'exito', texto: 'Estado actualizado (mock).' }
        : { tipo: 'error', texto: 'No se puede avanzar desde este estado.' },
    )
  }

  return (
    <div className="space-y-6">
      <AdminSectionHeader
        titulo={`Pedido ${pedido.numero}`}
        descripcion="Detalle mock con cliente, productos y flujo de estados."
        accion={
          <Link
            to="/admin/pedidos"
            className="inline-flex min-h-10 items-center rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:border-stone-500"
          >
            Volver
          </Link>
        }
      />

      <AdminFeedback mensaje={mensaje} />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-stone-800">Cliente</h2>
          <p className="mt-2 text-sm text-stone-700">{pedido.clienteNombre}</p>
          <p className="text-sm text-stone-600">{pedido.clienteCorreo}</p>
          <p className="text-sm text-stone-600">{pedido.clienteTelefono}</p>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-stone-800">Entrega y total</h2>
          <p className="mt-2 text-sm text-stone-700">
            Fecha: {pedido.fecha_entrega}
          </p>
          <p className="text-sm text-stone-700">
            Total: ${pedido.total.toFixed(2)}
          </p>
          <div className="mt-2">
            <AdminStatusBadge estado={pedido.estado} />
          </div>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-stone-800">Cambiar estado</h2>
          <p className="mt-2 text-sm text-stone-600">
            Flujo: PENDIENTE → EN_PREPARACION → LISTO → ENTREGADO. No se permite
            retroceder.
          </p>
          {siguiente ? (
            <button
              type="button"
              onClick={() => setConfirmando(true)}
              className="mt-3 inline-flex min-h-10 items-center rounded-lg bg-stone-800 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700"
            >
              Avanzar a {siguiente}
            </button>
          ) : (
            <p className="mt-3 text-sm font-medium text-stone-700">
              Pedido finalizado.
            </p>
          )}
        </div>
      </div>

      <AdminTable
        encabezados={['Producto', 'Cantidad', 'Precio', 'Personalización', 'Subtotal']}
      >
        {pedido.detalles.map((detalle) => (
          <tr key={detalle.id} className="border-b border-stone-100">
            <td className="px-4 py-3 font-medium text-stone-800">
              {detalle.productoNombre}
            </td>
            <td className="px-4 py-3 text-stone-600">{detalle.cantidad}</td>
            <td className="px-4 py-3 text-stone-600">
              ${detalle.precio_unitario.toFixed(2)}
            </td>
            <td className="px-4 py-3 text-stone-600">
              {detalle.personalizacion ?? '—'}
            </td>
            <td className="px-4 py-3 text-stone-600">
              ${detalle.subtotal.toFixed(2)}
            </td>
          </tr>
        ))}
      </AdminTable>

      <AdminConfirmModal
        abierto={confirmando}
        titulo="Cambiar estado del pedido"
        descripcion={
          siguiente
            ? `¿Avanzar de ${pedido.estado} a ${siguiente}? Acción mock sin retroceso.`
            : 'Este pedido ya está finalizado.'
        }
        textoConfirmar="Avanzar estado"
        onCancelar={() => setConfirmando(false)}
        onConfirmar={confirmarAvance}
      />
    </div>
  )
}
