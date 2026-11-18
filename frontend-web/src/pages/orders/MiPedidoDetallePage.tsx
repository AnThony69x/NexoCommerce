import { Link, useParams } from 'react-router-dom'
import { useState } from 'react'
import AccountNav from '../../components/account/AccountNav'
import AccountStatusBadge from '../../components/account/AccountStatusBadge'
import BackButton from '../../components/common/BackButton'
import AdminEmptyState from '../../components/admin/AdminEmptyState'
import { ApiErrorState, LoadingState } from '../../components/common/RequestState'
import { useAsync } from '../../hooks/useAsync'
import { obtenerMiPedido } from '../../services/ordersService'
import { registrarPago } from '../../services/paymentsService'
import PaymentMethodSelector from '../../components/checkout/PaymentMethodSelector'
import type { PaymentMethod } from '../../types/checkout'
import { formatPrice } from '../../utils/formatPrice'

const ETIQUETA_PAGO: Record<string, string> = {
  PASARELA: 'Referencia de pago',
  TRANSFERENCIA: 'Transferencia bancaria',
}

export default function MiPedidoDetallePage() {
  const { id } = useParams<{ id: string }>()
  const [metodoNuevoPago, setMetodoNuevoPago] = useState<PaymentMethod>('PASARELA')
  const [referenciaNuevoPago, setReferenciaNuevoPago] = useState('')
  const [comprobanteNuevoPago, setComprobanteNuevoPago] = useState<File | null>(null)
  const [enviandoPago, setEnviandoPago] = useState(false)
  const [errorPago, setErrorPago] = useState<string | undefined>(undefined)
  const [mensajePago, setMensajePago] = useState<string | undefined>(undefined)
  const {
    data: pedido,
    loading,
    error,
    recargar,
  } = useAsync(() => obtenerMiPedido(id ?? ''), [id])

  async function registrarPagoDeNuevo() {
    if (!id || !pedido || enviandoPago) return
    if (metodoNuevoPago === 'TRANSFERENCIA' && !comprobanteNuevoPago) {
      setErrorPago('Selecciona el comprobante de transferencia.')
      return
    }
    if (metodoNuevoPago === 'PASARELA' && !referenciaNuevoPago.trim()) {
      setErrorPago('Ingresa la referencia de pago.')
      return
    }
    setEnviandoPago(true)
    setErrorPago(undefined)
    setMensajePago(undefined)
    try {
      await registrarPago({
        pedidoId: id,
        monto: pedido.total,
        metodo: metodoNuevoPago,
        referencia: referenciaNuevoPago,
        comprobante: comprobanteNuevoPago,
      })
      setMensajePago('Nuevo pago registrado y pendiente de revisión.')
      await recargar()
    } catch (error) {
      setErrorPago(error instanceof Error ? error.message : 'No se pudo registrar el pago.')
    } finally {
      setEnviandoPago(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-stone-50 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-6">
          <BackButton fallback="/pedidos" />
          <LoadingState mensaje="Cargando pedido…" />
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-stone-50 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-6">
          <BackButton fallback="/pedidos" />
          <ApiErrorState mensaje={error} onReintentar={recargar} />
        </div>
      </main>
    )
  }

  if (!pedido) {
    return (
      <main className="min-h-screen bg-stone-50 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-6">
          <BackButton fallback="/pedidos" />
          <AdminEmptyState
            titulo="Pedido no encontrado"
            descripcion="El pedido solicitado no existe entre tus compras."
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
    <main className="min-h-screen bg-stone-50 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <BackButton fallback="/pedidos" />

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold text-stone-800">
              Pedido {pedido.numero}
            </h1>
            <p className="mt-2 text-sm text-stone-600">
              Entrega programada para el {pedido.fecha_entrega}
            </p>
          </div>
          <AccountStatusBadge estado={pedido.estado} />
        </div>

        <AccountNav />

        <section className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-stone-200 bg-white p-5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-stone-500">
              Entrega
            </h2>
            <p className="mt-3 text-sm text-stone-800">{pedido.direccion}</p>
            {pedido.referencia && (
              <p className="mt-1 text-sm text-stone-600">
                Referencia: {pedido.referencia}
              </p>
            )}
            <p className="mt-1 text-sm text-stone-600">
              Contacto: {pedido.clienteTelefono || pedido.clienteCorreo}
            </p>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white p-5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-stone-500">
              Pago
            </h2>
            <p className="mt-3 text-sm text-stone-800">
              {pedido.metodo_pago
                ? (ETIQUETA_PAGO[pedido.metodo_pago] ?? pedido.metodo_pago)
                : 'Sin especificar'}
            </p>
            <p className="mt-1 text-sm text-stone-600">
              Estado del pago: {pedido.pago_estado ?? 'PENDIENTE'}.
              {pedido.pago_estado === 'RECHAZADO' && ' Puedes registrar un nuevo pago.'}
            </p>
          </div>
        </section>

        {pedido.pago_estado === 'RECHAZADO' && (
          <section className="space-y-4 rounded-2xl border border-amber-200 bg-amber-50/60 p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-stone-800">Registrar otro pago</h2>
            <PaymentMethodSelector
              paymentMethod={metodoNuevoPago}
              onPaymentMethodChange={setMetodoNuevoPago}
              referenciaPasarela={referenciaNuevoPago}
              onReferenciaChange={setReferenciaNuevoPago}
              comprobante={comprobanteNuevoPago}
              onComprobanteChange={setComprobanteNuevoPago}
              error={errorPago}
            />
            {mensajePago && <p role="status" className="text-sm text-emerald-800">{mensajePago}</p>}
            <button type="button" onClick={() => void registrarPagoDeNuevo()} disabled={enviandoPago} className="inline-flex min-h-11 items-center justify-center rounded-lg bg-stone-800 px-5 py-3 text-sm font-medium text-white hover:bg-stone-700 disabled:opacity-60">
              {enviandoPago ? 'Registrando…' : 'Registrar pago'}
            </button>
          </section>
        )}

        <section className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-stone-800">Artículos</h2>

          {/* Tabla en pantallas medianas y grandes */}
          <div className="mt-4 hidden overflow-x-auto sm:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-stone-200 text-xs uppercase tracking-[0.12em] text-stone-500">
                  <th scope="col" className="py-2 pr-4 font-semibold">
                    Producto
                  </th>
                  <th scope="col" className="px-4 py-2 font-semibold">
                    Cantidad
                  </th>
                  <th scope="col" className="px-4 py-2 font-semibold">
                    Precio
                  </th>
                  <th scope="col" className="py-2 pl-4 text-right font-semibold">
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody>
                {pedido.detalles.map((detalle) => (
                  <tr key={detalle.id} className="border-b border-stone-100">
                    <td className="py-3 pr-4 font-medium text-stone-800">
                      {detalle.productoNombre}
                      {detalle.personalizacion && (
                        <span className="mt-1 block text-xs font-normal text-stone-500">
                          {detalle.personalizacion}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-stone-600">
                      {detalle.cantidad}
                    </td>
                    <td className="px-4 py-3 text-stone-600">
                      {formatPrice(detalle.precio_unitario)}
                    </td>
                    <td className="py-3 pl-4 text-right text-stone-800">
                      {formatPrice(detalle.subtotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Tarjetas en móvil */}
          <ul className="mt-4 space-y-3 sm:hidden">
            {pedido.detalles.map((detalle) => (
              <li
                key={detalle.id}
                className="rounded-xl border border-stone-200 p-4 text-sm"
              >
                <p className="font-medium text-stone-800">
                  {detalle.productoNombre}
                </p>
                {detalle.personalizacion && (
                  <p className="mt-1 text-xs text-stone-500">
                    {detalle.personalizacion}
                  </p>
                )}
                <div className="mt-2 flex items-center justify-between text-stone-600">
                  <span>
                    {detalle.cantidad} × {formatPrice(detalle.precio_unitario)}
                  </span>
                  <span className="font-semibold text-stone-800">
                    {formatPrice(detalle.subtotal)}
                  </span>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-5 space-y-2 border-t border-stone-100 pt-4 text-sm">
            <div className="flex justify-between gap-4 text-stone-600">
              <span>Subtotal</span>
              <span>{formatPrice(pedido.subtotal)}</span>
            </div>
            <div className="flex justify-between gap-4 text-stone-600">
              <span>Envío</span>
              <span>{formatPrice(Math.max(pedido.total - pedido.subtotal, 0))}</span>
            </div>
            <div className="flex justify-between gap-4 pt-1 text-base font-semibold text-stone-800">
              <span>Total</span>
              <span>{formatPrice(pedido.total)}</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
