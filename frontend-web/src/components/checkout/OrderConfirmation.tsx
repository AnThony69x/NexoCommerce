import { Link } from 'react-router-dom'
import type { PaymentMethod } from './PaymentMethodSelector'

type OrderConfirmationProps = {
  metodoPago: PaymentMethod
}

export default function OrderConfirmation({
  metodoPago,
}: OrderConfirmationProps) {
  return (
    <main className="min-h-screen bg-stone-50 px-4 py-10 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-2xl rounded-xl border border-stone-200 bg-white p-6 text-center sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-wide text-stone-500">
          Pedido confirmado
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-stone-800">
          Gracias por tu compra
        </h1>
        <p className="mt-4 text-sm leading-6 text-stone-600">
          Tu pedido mock fue registrado correctamente.
        </p>

        <dl className="mx-auto mt-8 max-w-sm space-y-4 text-left text-sm text-stone-600">
          <div className="flex justify-between gap-4 border-b border-stone-200 pb-3">
            <dt>Número de pedido</dt>
            <dd className="font-semibold text-stone-800">#NEX-2026-0001</dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-stone-200 pb-3">
            <dt>Fecha de entrega</dt>
            <dd className="font-medium text-stone-800">15 de octubre de 2026</dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-stone-200 pb-3">
            <dt>Método de pago</dt>
            <dd className="font-medium text-stone-800">{metodoPago}</dd>
          </div>
          <div className="flex justify-between gap-4 text-base">
            <dt>Total</dt>
            <dd className="font-semibold text-stone-800">$82.00</dd>
          </div>
        </dl>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            to="/pedidos"
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-stone-800 px-5 py-3 text-sm font-medium text-white hover:bg-stone-700"
          >
            Ver mis pedidos
          </Link>
          <Link
            to="/"
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-stone-300 px-5 py-3 text-sm font-medium text-stone-700 hover:border-stone-500"
          >
            Volver al inicio
          </Link>
        </div>
      </section>
    </main>
  )
}
