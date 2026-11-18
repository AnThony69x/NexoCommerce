import { useFormContext } from 'react-hook-form'
import type { DeliveryFormData } from '../../types/checkout'
import { useAuth } from '../../hooks/useAuth'
import {
  getMinimumDeliveryDate,
  reglaTelefono,
  validarFechaEntrega,
} from '../../utils/validation'

export default function DeliveryForm() {
  const { user } = useAuth()
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<DeliveryFormData>()
  const tipoEntrega = watch('tipoEntrega')

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-stone-200 bg-white p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-stone-800">Datos de la cuenta</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm text-stone-600 sm:col-span-2">
            <span>Nombre completo</span>
            <span className="min-h-11 rounded-lg border border-stone-200 bg-stone-50 px-3 py-3 text-stone-700">{user?.nombre_completo}</span>
            <span className="text-xs text-stone-500">Tomado de tu cuenta.</span>
          </label>

          <label className="flex flex-col gap-2 text-sm text-stone-600 sm:col-span-2">
            <span>Teléfono</span>
            <input
              id="checkout-telefono"
              type="tel"
              placeholder="Número de contacto"
              aria-invalid={!!errors.telefono}
              aria-describedby={
                errors.telefono ? 'checkout-error-telefono' : undefined
              }
              {...register('telefono', reglaTelefono())}
              className="min-h-11 rounded-lg border border-stone-300 px-3 text-stone-700 placeholder:text-stone-400 aria-invalid:border-rose-700"
            />
            {errors.telefono && (
              <span
                id="checkout-error-telefono"
                role="alert"
                className="text-xs text-rose-700"
              >
                {errors.telefono.message}
              </span>
            )}
          </label>
        </div>
      </section>

      <section className="rounded-xl border border-stone-200 bg-white p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-stone-800">
          Información de entrega
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm text-stone-600 sm:col-span-2">
            <span>Tipo de entrega</span>
            <select {...register('tipoEntrega')} className="min-h-11 rounded-lg border border-stone-300 px-3">
              <option value="RETIRO">Retiro en tienda</option>
              <option value="DOMICILIO">Entrega a domicilio</option>
            </select>
          </label>
          {tipoEntrega === 'DOMICILIO' && (
          <label className="flex flex-col gap-2 text-sm text-stone-600 sm:col-span-2">
            <span>Dirección</span>
            <input
              id="checkout-direccion"
              type="text"
              placeholder="Dirección de entrega"
              aria-invalid={!!errors.direccion}
              aria-describedby={
                errors.direccion ? 'checkout-error-direccion' : undefined
              }
              {...register('direccion', {
                required: tipoEntrega === 'DOMICILIO' ? 'La dirección es obligatoria.' : false,
                maxLength: { value: 255, message: 'La dirección no puede superar 255 caracteres.' },
              })}
              className="min-h-11 rounded-lg border border-stone-300 px-3 text-stone-700 placeholder:text-stone-400 aria-invalid:border-rose-700"
            />
            {errors.direccion && (
              <span
                id="checkout-error-direccion"
                role="alert"
                className="text-xs text-rose-700"
              >
                {errors.direccion.message}
              </span>
            )}
          </label>
          )}

        </div>
      </section>

      <section className="rounded-xl border border-stone-200 bg-white p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-stone-800">
          Fecha de entrega
        </h2>
        <label className="mt-5 flex max-w-xs flex-col gap-2 text-sm text-stone-600">
          <span>Selecciona una fecha</span>
          <input
            id="checkout-fecha"
            type="date"
            min={getMinimumDeliveryDate()}
            aria-invalid={!!errors.fechaEntrega}
            aria-describedby={
              errors.fechaEntrega ? 'checkout-error-fecha' : undefined
            }
            {...register('fechaEntrega', {
              validate: validarFechaEntrega,
            })}
            className="min-h-11 rounded-lg border border-stone-300 px-3 text-stone-700 aria-invalid:border-rose-700"
          />
          {errors.fechaEntrega && (
            <span
              id="checkout-error-fecha"
              role="alert"
              className="text-xs text-rose-700"
            >
              {errors.fechaEntrega.message}
            </span>
          )}
          <span className="text-xs text-stone-400">
            Los pedidos deben realizarse con mínimo 3 días de anticipación.
          </span>
        </label>
      </section>
    </div>
  )
}
