import { Link, useParams } from 'react-router-dom'
import AdminStatusBadge from '../../components/admin/AdminStatusBadge'
import AdminTable from '../../components/admin/AdminTable'
import BackButton from '../../components/common/BackButton'
import AdminEmptyState from '../../components/admin/AdminEmptyState'
import { ApiErrorState, LoadingState } from '../../components/common/RequestState'
import { useAsync } from '../../hooks/useAsync'
import { obtenerMiPedido } from '../../services/ordersService'
import { formatPrice } from '../../utils/formatPrice'

export default function MiPedidoDetallePage() {
  const { id } = useParams<{ id: string }>()
  const {
    data: pedido,
    loading,
    error,
    recargar,
  } = useAsync(() => obtenerMiPedido(id ?? ''), [id])

  if (loading) {
    return (
      <main className="min-h-screen bg-stone-50 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl space-y-6">
          <BackButton fallback="/pedidos" />
          <LoadingState mensaje="Cargando pedido…" />
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-stone-50 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl space-y-6">
          <BackButton fallback="/pedidos" />
          <ApiErrorState mensaje={error} onReintentar={recargar} />
        </div>
      </main>
    )
  }

  if (!pedido) {
    return (
      <main className="min-h-screen bg-stone-50 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl space-y-6">
          <BackButton fallback="/pedidos" />
          <AdminEmptyState
            titulo="Pedido no encontrado"
            descripcion="El pedido solicitado no existe en tus datos mock."
            accion={
              <Link
                to="/pedidos"
                className="inline-flex min-h-10 items-center rounded-lg bg-stone-800 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700"
              >
                Volver a mis pedidos
              </Link>
            }
          />
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <BackButton fallback="/pedidos" />

        <section className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold text-stone-800">
              Pedido {pedido.numero}
            </h1>
            <p className="mt-2 text-sm text-stone-600">
              Entrega: {pedido.fecha_entrega}
            </p>
          </div>
          <AdminStatusBadge estado={pedido.estado} />
        </section>

        <AdminTable encabezados={['Producto', 'Cantidad', 'Precio', 'Subtotal']}>
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
                {formatPrice(detalle.subtotal)}
              </td>
            </tr>
          ))}
        </AdminTable>

        <div className="rounded-2xl border border-stone-200 bg-white p-5 text-sm">
          <div className="flex justify-between gap-4 text-stone-600">
            <span>Subtotal</span>
            <span>{formatPrice(pedido.subtotal)}</span>
          </div>
          <div className="mt-2 flex justify-between gap-4 pt-3 text-base font-semibold text-stone-800">
            <span>Total</span>
            <span>{formatPrice(pedido.total)}</span>
          </div>
        </div>
      </div>
    </main>
  )
}
