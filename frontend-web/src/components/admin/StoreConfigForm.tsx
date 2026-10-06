import { useForm } from 'react-hook-form'
import type { StoreConfiguration } from '../../types/admin'

type StoreConfigFormProps = {
  inicial: StoreConfiguration
  onGuardar: (dato: StoreConfiguration) => void
}

const claseInput =
  'w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-800 outline-none focus:border-stone-500'
const claseLabel = 'block text-sm font-medium text-stone-700'

export default function StoreConfigForm({
  inicial,
  onGuardar,
}: StoreConfigFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StoreConfiguration>({ defaultValues: inicial })

  return (
    <form
      onSubmit={handleSubmit(onGuardar)}
      className="space-y-4 rounded-2xl border border-stone-200 bg-white p-5"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="tienda-nombre" className={claseLabel}>
            Nombre de tienda
          </label>
          <input
            id="tienda-nombre"
            className={claseInput}
            {...register('nombre_tienda', { required: 'Obligatorio' })}
          />
          {errors.nombre_tienda && (
            <p className="mt-1 text-xs text-rose-700">Obligatorio</p>
          )}
        </div>
        <div>
          <label htmlFor="tienda-telefono" className={claseLabel}>
            Teléfono
          </label>
          <input
            id="tienda-telefono"
            className={claseInput}
            {...register('telefono', { required: 'Obligatorio' })}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="tienda-correo" className={claseLabel}>
            Correo
          </label>
          <input
            id="tienda-correo"
            type="email"
            className={claseInput}
            {...register('correo', { required: 'Obligatorio' })}
          />
        </div>
        <div>
          <label htmlFor="tienda-direccion" className={claseLabel}>
            Dirección
          </label>
          <input
            id="tienda-direccion"
            className={claseInput}
            {...register('direccion', { required: 'Obligatorio' })}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="tienda-logo" className={claseLabel}>
            Logo mock
          </label>
          <input id="tienda-logo" className={claseInput} {...register('logoUrl')} />
        </div>
        <div>
          <label htmlFor="tienda-favicon" className={claseLabel}>
            Favicon mock
          </label>
          <input
            id="tienda-favicon"
            className={claseInput}
            {...register('faviconUrl')}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="tienda-primario" className={claseLabel}>
            Color primario
          </label>
          <input
            id="tienda-primario"
            type="color"
            className="h-10 w-full rounded-lg border border-stone-300"
            {...register('color_primario')}
          />
        </div>
        <div>
          <label htmlFor="tienda-secundario" className={claseLabel}>
            Color secundario
          </label>
          <input
            id="tienda-secundario"
            type="color"
            className="h-10 w-full rounded-lg border border-stone-300"
            {...register('color_secundario')}
          />
        </div>
        <div>
          <label htmlFor="tienda-acento" className={claseLabel}>
            Color de acento
          </label>
          <input
            id="tienda-acento"
            type="color"
            className="h-10 w-full rounded-lg border border-stone-300"
            {...register('color_acento')}
          />
        </div>
        <div>
          <label htmlFor="tienda-fondo" className={claseLabel}>
            Color de fondo
          </label>
          <input
            id="tienda-fondo"
            type="color"
            className="h-10 w-full rounded-lg border border-stone-300"
            {...register('color_fondo')}
          />
        </div>
        <div>
          <label htmlFor="tienda-texto" className={claseLabel}>
            Color de texto
          </label>
          <input
            id="tienda-texto"
            type="color"
            className="h-10 w-full rounded-lg border border-stone-300"
            {...register('color_texto')}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="inline-flex min-h-10 items-center rounded-lg bg-stone-800 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700"
        >
          Guardar cambios (mock)
        </button>
      </div>
    </form>
  )
}
