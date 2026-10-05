import { useState } from 'react'
import BackButton from '../../components/common/BackButton'
import DeliveryForm from '../../components/checkout/DeliveryForm'
import CheckoutSummary from '../../components/checkout/CheckoutSummary'
import OrderConfirmation from '../../components/checkout/OrderConfirmation'
import PaymentMethodSelector, {
  type PaymentMethod,
} from '../../components/checkout/PaymentMethodSelector'

export default function CheckoutPage() {
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('PASARELA')

  if (isConfirmed) {
    return <OrderConfirmation metodoPago={paymentMethod} />
  }

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <BackButton fallback="/carrito" />
        <section>
          <h1 className="text-3xl font-semibold text-stone-800">Checkout</h1>
        </section>

        <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
          <div className="space-y-6">
            <DeliveryForm />
            <PaymentMethodSelector
              paymentMethod={paymentMethod}
              onPaymentMethodChange={setPaymentMethod}
            />
          </div>

          <aside className="space-y-4">
            <CheckoutSummary />
            <button
              type="button"
              onClick={() => setIsConfirmed(true)}
              className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-stone-800 px-5 py-3 text-sm font-medium text-white hover:bg-stone-700"
            >
              Confirmar pedido
            </button>
          </aside>
        </div>
      </div>
    </main>
  )
}
