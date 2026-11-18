import { formatPrice } from '../../utils/formatPrice'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import AdminConfirmModal from '../../components/admin/AdminConfirmModal'
import AdminEmptyState from '../../components/admin/AdminEmptyState'
import AdminFeedback from '../../components/admin/AdminFeedback'
import AdminSectionHeader from '../../components/admin/AdminSectionHeader'
import AdminStatusBadge from '../../components/admin/AdminStatusBadge'
import AdminTable from '../../components/admin/AdminTable'
import { useAdmin } from '../../contexts/AdminContext'
import { PEDIDO_FLUJO } from '../../types/admin'
import type { AdminFeedbackMessage } from '../../types/admin'
import { obtenerPedidoAdmin } from '../../services/adminService'

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { obtenerPedido, avanzarPedido, cargando } = useAdmin()
  const [confirmando, setConfirmando] = useState(false)
  const [mensaje, setMensaje] = useState<AdminFeedbackMessage | null>(null)
  const [pedidoDetalle, setPedidoDetalle] = useState<ReturnType<typeof obtenerPedido>>()
  const [cargandoDetalle, setCargandoDetalle] = useState(true)

  useEffect(() => {
    if (!id) return
    let cancelado = false
    setPedidoDetalle(undefined)
    setCargandoDetalle(true)
    obtenerPedidoAdmin(id)
      .then((detalle) => {
        if (cancelado) return
        setPedidoDetalle(detalle)
      })
      .catch((error: unknown) => {
        if (!cancelado) setMensaje({ tipo: 'error', texto: error instanceof Error ? error.message : 'No se pudo cargar el pedido.' })
      })
      .finally(() => { if (!cancelado) setCargandoDetalle(false) })
    return () => { cancelado = true }
  }, [id])

  const pedido = pedidoDetalle ?? (id ? obtenerPedido(id) : undefined)

  if (!pedido) {
    if (cargando || cargandoDetalle) {
      return <p role="status" className="rounded-xl border border-stone-200 bg-white p-4 text-sm text-stone-600">Cargando pedido…</p>
    }
    return (
      <div className="space-y-6">
        <AdminSectionHeader titulo="Detalle del pedido" />
        <AdminFeedback mensaje={mensaje} />
        <AdminEmptyState
          titulo="Registro no encontrado"
          descripcion="El pedido solicitado no existe o ya no está disponible."
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

  async function confirmarAvance() {
    try {
      const avanzo = await avanzarPedido(pedidoId)
      if (!avanzo) throw new Error('No se puede avanzar desde este estado.')
      setConfirmando(false)
      if (avanzo && siguiente) {
        setPedidoDetalle((actual) => actual ? { ...actual, estado: siguiente } : actual)
      }
      setMensaje({ tipo: 'exito', texto: 'Estado actualizado.' })
    } catch (error) {
      throw error instanceof Error ? error : new Error('No se pudo actualizar el estado.')
    }
  }

  return (
    <div className="space-y-6">
      <AdminSectionHeader
        titulo={`Pedido ${pedido.numero}`}
        descripcion="Detalle, entrega y estado actual del pedido."
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
          <p className="text-sm text-stone-600">{pedido.clienteCorreo || 'Correo no registrado.'}</p>
          <p className="text-sm text-stone-600">{pedido.clienteTelefono || 'Teléfono no registrado.'}</p>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-stone-800">Entrega y total</h2>
          <p className="mt-2 text-sm text-stone-700">
            Fecha: {pedido.fecha_entrega}
          </p>
          {pedido.tipo_entrega && <p className="text-sm text-stone-700">Entrega: {pedido.tipo_entrega}</p>}
          {pedido.direccion && <p className="text-sm text-stone-700">Dirección: {pedido.direccion}</p>}
          <p className="text-sm text-stone-700">
            Total: {formatPrice(pedido.total)}
          </p>
          <div className="mt-2">
            <AdminStatusBadge estado={pedido.estado} />
          </div>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-stone-800">Cambiar estado</h2>
          <p className="mt-2 text-sm text-stone-600">
            Flujo: PENDIENTE → EN_PREPARACION → LISTO → ENTREGADO.
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
              {pedido.estado === 'CANCELADO' ? 'Pedido cancelado.' : 'Pedido finalizado.'}
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
              {formatPrice(detalle.precio_unitario)}
            </td>
            <td className="px-4 py-3 text-stone-600">
              {detalle.personalizacion ?? '—'}
            </td>
            <td className="px-4 py-3 text-stone-600">
              {formatPrice(detalle.subtotal)}
            </td>
          </tr>
        ))}
      </AdminTable>

      <AdminConfirmModal
        abierto={confirmando}
        titulo="Cambiar estado del pedido"
        descripcion={
          siguiente
            ? `¿Avanzar de ${pedido.estado} a ${siguiente}?`
            : 'Este pedido ya está finalizado.'
        }
        textoConfirmar="Avanzar estado"
        onCancelar={() => setConfirmando(false)}
        onConfirmar={confirmarAvance}
      />
    </div>
  )
}
