import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import BackButton from '../../components/common/BackButton'
import DeliveryForm from '../../components/checkout/DeliveryForm'
import CheckoutSummary from '../../components/checkout/CheckoutSummary'
import OrderConfirmation, {
  type PedidoConfirmado,
} from '../../components/checkout/OrderConfirmation'
import PaymentMethodSelector from '../../components/checkout/PaymentMethodSelector'
import type { PaymentMethod } from '../../types/checkout'
import { useAuth } from '../../hooks/useAuth'
import { useCart } from '../../hooks/useCart'
import { crearPedido } from '../../services/ordersService'
import { registrarPago } from '../../services/paymentsService'
import { ApiError } from '../../types/api'
import {
  deliveryFormDefaultValues,
  type DeliveryFormData,
} from '../../types/checkout'

export default function CheckoutPage() {
  const { user } = useAuth()
  const { items, subtotal, total, clearCart, recargar } = useCart()
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('PASARELA')
  const [referenciaPasarela, setReferenciaPasarela] = useState('')
  const [comprobante, setComprobante] = useState<File | null>(null)
  const [pedidoConfirmado, setPedidoConfirmado] =
    useState<PedidoConfirmado | null>(null)
  const [creando, setCreando] = useState(false)
  const [reintentandoPago, setReintentandoPago] = useState(false)
  const [errorPedido, setErrorPedido] = useState<string | null>(null)
  const methods = useForm<DeliveryFormData>({
    defaultValues: {
      ...deliveryFormDefaultValues,
      telefono: user?.telefono ?? '',
    },
  })

  async function confirmarPedido(datos: DeliveryFormData) {
    if (!user || pedidoConfirmado || creando) return
    if (paymentMethod === 'TRANSFERENCIA' && !comprobante) {
      setErrorPedido('Selecciona el comprobante de transferencia.')
      return
    }
    if (paymentMethod === 'PASARELA' && !referenciaPasarela.trim()) {
      setErrorPedido('Ingresa la referencia de pago para revisión manual.')
      return
    }

    setCreando(true)
    setErrorPedido(null)
    try {
      const pedido = await crearPedido({
        clienteNombre: user.nombre_completo,
        clienteCorreo: user.correo,
        clienteTelefono: datos.telefono,
        direccion: datos.tipoEntrega === 'DOMICILIO' ? datos.direccion : '',
        fechaEntrega: datos.fechaEntrega,
        metodoPago: paymentMethod,
        items: items.map((item) => ({
          productoNombre: item.nombre,
          cantidad: item.cantidad,
          precioUnitario: item.precioUnitario,
        })),
        subtotal,
        envio: 0,
        total,
      })
      await clearCart()
      let errorPago: string | undefined
      try {
        await registrarPago({
          pedidoId: pedido.id,
          monto: pedido.total,
          metodo: paymentMethod,
          referencia: referenciaPasarela,
          comprobante,
        })
      } catch (falloPago) {
        errorPago = falloPago instanceof Error ? falloPago.message : 'No se pudo registrar el pago.'
      }
      setPedidoConfirmado({
        pedidoId: pedido.id,
        numero: pedido.numero,
        clienteNombre: user.nombre_completo,
        datos,
        metodoPago: paymentMethod,
        subtotal: pedido.subtotal,
        envio: Math.max(pedido.total - pedido.subtotal, 0),
        total: pedido.total,
        errorPago,
      })
    } catch (falla) {
      if (falla instanceof ApiError && falla.codigoError === 'PED_PRECIO_CAMBIADO') {
        await recargar()
        setErrorPedido('El precio cambió. Revisa el total actualizado y confirma de nuevo.')
        return
      }
      // Sin este catch el fallo quedaba como promesa rechazada invisible:
      // el usuario veía "Confirmando…" y nunca sabía qué pasó.
      setErrorPedido(
        falla instanceof ApiError
          ? falla.message
          : 'No se pudo confirmar el pedido. Intenta nuevamente.',
      )
    } finally {
      setCreando(false)
    }
  }

  async function reintentarPago() {
    if (!pedidoConfirmado || reintentandoPago) return
    setReintentandoPago(true)
    try {
      await registrarPago({
        pedidoId: pedidoConfirmado.pedidoId,
        monto: pedidoConfirmado.total,
        metodo: paymentMethod,
        referencia: referenciaPasarela,
        comprobante,
      })
      setPedidoConfirmado({ ...pedidoConfirmado, errorPago: undefined })
    } catch (error) {
      setPedidoConfirmado({
        ...pedidoConfirmado,
        errorPago: error instanceof Error ? error.message : 'No se pudo registrar el pago.',
      })
    } finally {
      setReintentandoPago(false)
    }
  }

  if (pedidoConfirmado) {
    return <OrderConfirmation pedido={pedidoConfirmado} onReintentarPago={reintentarPago} reintentando={reintentandoPago} />
  }

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <BackButton fallback="/carrito" />
        <section>
          <h1 className="text-3xl font-semibold text-stone-800">Checkout</h1>
        </section>

        <FormProvider {...methods}>
          <form
            onSubmit={methods.handleSubmit(confirmarPedido)}
            noValidate
            className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-start"
          >
            <div className="space-y-6">
              <DeliveryForm />
              <PaymentMethodSelector
                paymentMethod={paymentMethod}
                onPaymentMethodChange={setPaymentMethod}
                referenciaPasarela={referenciaPasarela}
                onReferenciaChange={setReferenciaPasarela}
                comprobante={comprobante}
                onComprobanteChange={setComprobante}
                error={errorPedido ?? undefined}
              />
            </div>

            <aside className="space-y-4">
              <CheckoutSummary />
              {errorPedido && (
                <p
                  role="alert"
                  className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700"
                >
                  {errorPedido}
                </p>
              )}
              <button
                type="submit"
                disabled={creando || items.length === 0}
                className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-stone-800 px-5 py-3 text-sm font-medium text-white hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {creando ? 'Confirmando…' : 'Confirmar pedido'}
              </button>
            </aside>
          </form>
        </FormProvider>
      </div>
    </main>
  )
}
