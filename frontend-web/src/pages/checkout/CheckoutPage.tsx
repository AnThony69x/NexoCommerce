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
import { ApiError } from '../../types/api'
import {
  deliveryFormDefaultValues,
  type DeliveryFormData,
} from '../../types/checkout'

export default function CheckoutPage() {
  const { user } = useAuth()
  const { items, subtotal, total, clearCart } = useCart()
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('PASARELA')
  const [pedidoConfirmado, setPedidoConfirmado] =
    useState<PedidoConfirmado | null>(null)
  const [creando, setCreando] = useState(false)
  const [errorPedido, setErrorPedido] = useState<string | null>(null)
  const methods = useForm<DeliveryFormData>({
    defaultValues: deliveryFormDefaultValues,
  })

  async function confirmarPedido(datos: DeliveryFormData) {
    if (!user || pedidoConfirmado || creando) return
    setCreando(true)
    setErrorPedido(null)
    try {
      const envio = items.length > 0 ? total - subtotal : 0
      const pedido = await crearPedido({
        clienteNombre: datos.nombreCompleto,
        clienteCorreo: user.correo,
        clienteTelefono: datos.telefono,
        direccion: datos.direccion,
        referencia: datos.referencia,
        fechaEntrega: datos.fechaEntrega,
        metodoPago: paymentMethod,
        items: items.map((item) => ({
          productoNombre: item.nombre,
          cantidad: item.cantidad,
          precioUnitario: item.precioUnitario,
        })),
        subtotal,
        envio,
        total,
      })
      clearCart()
      setPedidoConfirmado({
        numero: pedido.numero,
        datos,
        metodoPago: paymentMethod,
        subtotal,
        envio,
        total,
      })
    } catch (falla) {
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

  if (pedidoConfirmado) {
    return <OrderConfirmation pedido={pedidoConfirmado} />
  }

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto space-y-8">
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
