export type PaymentMethod = 'PASARELA' | 'TRANSFERENCIA'

type PaymentMethodSelectorProps = {
  paymentMethod: PaymentMethod
  onPaymentMethodChange: (paymentMethod: PaymentMethod) => void
}

export default function PaymentMethodSelector({
  paymentMethod,
  onPaymentMethodChange,
}: PaymentMethodSelectorProps) {

  return (
    <section className="rounded-xl border border-stone-200 bg-white p-5 sm:p-6">
      <h2 className="text-lg font-semibold text-stone-800">Método de pago</h2>

      <fieldset className="mt-5 space-y-3 text-sm text-stone-600">
        <legend className="sr-only">Selecciona un método de pago</legend>
        <label className="flex items-center gap-3 rounded-lg border border-stone-200 p-3">
          <input
            type="radio"
            name="paymentMethod"
            value="PASARELA"
            checked={paymentMethod === 'PASARELA'}
            onChange={() => onPaymentMethodChange('PASARELA')}
          />
          <span>Pasarela</span>
        </label>
        <label className="flex items-center gap-3 rounded-lg border border-stone-200 p-3">
          <input
            type="radio"
            name="paymentMethod"
            value="TRANSFERENCIA"
            checked={paymentMethod === 'TRANSFERENCIA'}
            onChange={() => onPaymentMethodChange('TRANSFERENCIA')}
          />
          <span>Transferencia</span>
        </label>
      </fieldset>

      {paymentMethod === 'TRANSFERENCIA' ? (
        <div className="mt-5 rounded-lg border border-dashed border-stone-300 p-4">
          <label className="flex flex-col gap-2 text-sm text-stone-600">
            <span>Comprobante de transferencia</span>
            <input
              type="file"
              accept="image/*,.pdf"
              className="block w-full text-sm text-stone-600 file:mr-4 file:rounded-lg file:border-0 file:bg-stone-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-stone-700"
            />
          </label>
          <p className="mt-2 text-xs text-stone-500">
            Carga temporal. El archivo todavía no será procesado.
          </p>
        </div>
      ) : (
        <p className="mt-5 rounded-lg bg-stone-50 p-4 text-sm leading-6 text-stone-600">
          Serás redirigido a la pasarela de pago para completar la operación.
        </p>
      )}
    </section>
  )
}
