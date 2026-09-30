import { Link } from 'react-router-dom'

export default function CartSummary() {
  return (
    <section className="rounded-xl border border-stone-200 bg-white p-5 sm:p-6">
      <h2 className="text-lg font-semibold text-stone-800">
        Resumen del pedido
      </h2>
      <div className="mt-5 space-y-3 border-b border-stone-200 pb-5 text-sm text-stone-600">
        <div className="flex justify-between gap-4">
          <span>Subtotal</span>
          <span>$77.00</span>
        </div>
        <div className="flex justify-between gap-4">
          <span>Envío</span>
          <span>$5.00</span>
        </div>
      </div>
      <div className="flex justify-between gap-4 pt-5 text-base font-semibold text-stone-800">
        <span>Total</span>
        <span>$82.00</span>
      </div>

      <Link
        to="/checkout"
        className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-stone-800 px-5 py-3 text-sm font-medium text-white hover:bg-stone-700"
      >
        Ir al checkout
      </Link>
    </section>
  )
}
