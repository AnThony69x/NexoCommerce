import { useCart } from '../../hooks/useCart'
import { formatPrice } from '../../utils/formatPrice'

export default function CheckoutSummary() {
  const { items, subtotal, total } = useCart()

  const shippingCost = items.length > 0 ? total - subtotal : 0

  return (
    <section className="rounded-xl border border-stone-200 bg-white p-5 sm:p-6">
      <h2 className="text-lg font-semibold text-stone-800">
        Resumen del pedido
      </h2>

      <div className="mt-5 space-y-4 border-b border-stone-200 pb-5 text-sm text-stone-600">
        {items.map((item) => (
          <div key={item.id} className="flex justify-between gap-4">
            <div>
              <p className="font-medium text-stone-800">{item.nombre}</p>
              <p className="mt-1">Cantidad: {item.cantidad}</p>
            </div>
            <span>{formatPrice(item.precioUnitario * item.cantidad)}</span>
          </div>
        ))}
        <div className="flex justify-between gap-4">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span>Costo de envío</span>
          <span>{formatPrice(shippingCost)}</span>
        </div>
      </div>

      <div className="flex justify-between gap-4 pt-5 text-base font-semibold text-stone-800">
        <span>Total final</span>
        <span>{formatPrice(total)}</span>
      </div>
    </section>
  )
}
