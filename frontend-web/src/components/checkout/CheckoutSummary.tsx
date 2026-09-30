export default function CheckoutSummary() {
  return (
    <section className="rounded-xl border border-stone-200 bg-white p-5 sm:p-6">
      <h2 className="text-lg font-semibold text-stone-800">
        Resumen del pedido
      </h2>

      <div className="mt-5 space-y-4 border-b border-stone-200 pb-5 text-sm text-stone-600">
        <div className="flex justify-between gap-4">
          <div>
            <p className="font-medium text-stone-800">Torta Jardín de Rosas</p>
            <p className="mt-1">Cantidad: 1</p>
          </div>
          <span>$45.00</span>
        </div>
        <div className="flex justify-between gap-4">
          <div>
            <p className="font-medium text-stone-800">
              Caja Dulce Celebración
            </p>
            <p className="mt-1">Cantidad: 1</p>
          </div>
          <span>$32.00</span>
        </div>
        <div className="flex justify-between gap-4">
          <span>Subtotal</span>
          <span>$77.00</span>
        </div>
        <div className="flex justify-between gap-4">
          <span>Costo de envío</span>
          <span>$5.00</span>
        </div>
      </div>

      <div className="flex justify-between gap-4 pt-5 text-base font-semibold text-stone-800">
        <span>Total final</span>
        <span>$82.00</span>
      </div>
    </section>
  )
}
