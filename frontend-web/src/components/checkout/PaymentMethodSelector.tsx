import type { PaymentMethod } from '../../types/checkout'

export type { PaymentMethod }

type PaymentMethodSelectorProps = {
  paymentMethod: PaymentMethod
  onPaymentMethodChange: (paymentMethod: PaymentMethod) => void
  referenciaPasarela: string
  onReferenciaChange: (referencia: string) => void
  comprobante: File | null
  onComprobanteChange: (comprobante: File | null) => void
  error?: string | undefined
}

export default function PaymentMethodSelector({
  paymentMethod,
  onPaymentMethodChange,
  referenciaPasarela,
  onReferenciaChange,
  comprobante,
  onComprobanteChange,
  error,
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
          <span>Referencia de pago para revisión manual</span>
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
              accept="image/jpeg,image/png,image/webp,.pdf"
              required={paymentMethod === 'TRANSFERENCIA'}
              onChange={(event) => onComprobanteChange(event.target.files?.[0] ?? null)}
              className="block w-full text-sm text-stone-600 file:mr-4 file:rounded-lg file:border-0 file:bg-stone-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-stone-700"
            />
          </label>
          {comprobante && <p className="mt-2 text-xs text-stone-600">{comprobante.name}</p>}
          <p className="mt-2 text-xs text-stone-500">JPG, PNG, WebP o PDF; máximo 5 MB.</p>
        </div>
      ) : (
        <label className="mt-5 flex flex-col gap-2 text-sm text-stone-600">
          <span>Referencia de pago</span>
          <input
            value={referenciaPasarela}
            onChange={(event) => onReferenciaChange(event.target.value)}
            maxLength={255}
            required
            className="min-h-11 rounded-lg border border-stone-300 px-3"
          />
          <span className="text-xs text-stone-500">El pago quedará pendiente de revisión manual.</span>
        </label>
      )}
      {error && <p role="alert" className="mt-3 text-sm text-rose-700">{error}</p>}
    </section>
  )
}
