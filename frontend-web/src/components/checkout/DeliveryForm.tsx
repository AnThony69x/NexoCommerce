import { useForm } from 'react-hook-form'

type DeliveryFormData = {
  nombreCompleto: string
  telefono: string
  direccion: string
  referencia: string
  fechaEntrega: string
}

export default function DeliveryForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DeliveryFormData>({
    defaultValues: {
      nombreCompleto: '',
      telefono: '',
      direccion: '',
      referencia: '',
      fechaEntrega: '',
    },
  })

  return (
    <form
      onSubmit={handleSubmit(() => undefined)}
      className="space-y-6"
      noValidate
    >
      <section className="rounded-xl border border-stone-200 bg-white p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-stone-800">
          Datos del cliente
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm text-stone-600 sm:col-span-2">
            <span>Nombre completo</span>
            <input
              type="text"
              placeholder="Nombre del cliente"
              {...register('nombreCompleto', {
                required: 'El nombre completo es obligatorio.',
              })}
              className="min-h-11 rounded-lg border border-stone-300 px-3 text-stone-700 placeholder:text-stone-400"
            />
            {errors.nombreCompleto && (
              <span className="text-xs text-rose-700">
                {errors.nombreCompleto.message}
              </span>
            )}
          </label>

          <label className="flex flex-col gap-2 text-sm text-stone-600 sm:col-span-2">
            <span>Teléfono</span>
            <input
              type="tel"
              placeholder="Número de contacto"
              {...register('telefono', {
                required: 'El teléfono es obligatorio.',
              })}
              className="min-h-11 rounded-lg border border-stone-300 px-3 text-stone-700 placeholder:text-stone-400"
            />
            {errors.telefono && (
              <span className="text-xs text-rose-700">
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
            <span>Dirección</span>
            <input
              type="text"
              placeholder="Dirección de entrega"
              {...register('direccion', {
                required: 'La dirección es obligatoria.',
              })}
              className="min-h-11 rounded-lg border border-stone-300 px-3 text-stone-700 placeholder:text-stone-400"
            />
            {errors.direccion && (
              <span className="text-xs text-rose-700">
                {errors.direccion.message}
              </span>
            )}
          </label>

          <label className="flex flex-col gap-2 text-sm text-stone-600 sm:col-span-2">
            <span>Referencia de entrega</span>
            <input
              type="text"
              placeholder="Referencia de entrega"
              {...register('referencia', {
                required: 'La referencia de entrega es obligatoria.',
              })}
              className="min-h-11 rounded-lg border border-stone-300 px-3 text-stone-700 placeholder:text-stone-400"
            />
            {errors.referencia && (
              <span className="text-xs text-rose-700">
                {errors.referencia.message}
              </span>
            )}
          </label>
        </div>
      </section>

      <section className="rounded-xl border border-stone-200 bg-white p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-stone-800">
          Fecha de entrega
        </h2>
        <label className="mt-5 flex max-w-xs flex-col gap-2 text-sm text-stone-600">
          <span>Selecciona una fecha</span>
          <input
            type="date"
            {...register('fechaEntrega', {
              required: 'La fecha de entrega es obligatoria.',
            })}
            className="min-h-11 rounded-lg border border-stone-300 px-3 text-stone-700"
          />
          {errors.fechaEntrega && (
            <span className="text-xs text-rose-700">
              {errors.fechaEntrega.message}
            </span>
          )}
        </label>
      </section>
    </form>
  )
}
