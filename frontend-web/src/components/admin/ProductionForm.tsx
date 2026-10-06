import { useForm } from 'react-hook-form'
import type {
  AdminCategory,
  AdminProductionConfig,
} from '../../types/admin'

export type ProductionFormValues = {
  fecha: string
  categoriaId: string
  capacidad_maxima: number
  capacidad_ocupada: number
  activo: boolean
}

type ProductionFormProps = {
  inicial?: AdminProductionConfig
  categorias: AdminCategory[]
  onGuardar: (dato: Omit<AdminProductionConfig, 'id'>) => void
  onCancelar: () => void
}

const claseInput =
  'w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-800 outline-none focus:border-stone-500'
const claseLabel = 'block text-sm font-medium text-stone-700'

export default function ProductionForm({
  inicial,
  categorias,
  onGuardar,
  onCancelar,
}: ProductionFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductionFormValues>({
    defaultValues: {
      fecha: inicial?.fecha ?? '2026-10-15',
      categoriaId: inicial?.categoriaId ?? categorias[0]?.id ?? '',
      capacidad_maxima: inicial?.capacidad_maxima ?? 10,
      capacidad_ocupada: inicial?.capacidad_ocupada ?? 0,
      activo: inicial?.activo ?? true,
    },
  })

  function guardar(valores: ProductionFormValues) {
    const categoria = categorias.find((item) => item.id === valores.categoriaId)
    onGuardar({
      fecha: valores.fecha,
      categoriaId: valores.categoriaId,
      categoriaNombre: categoria?.nombre ?? 'Sin categoría',
      capacidad_maxima: Number(valores.capacidad_maxima),
      capacidad_ocupada: Number(valores.capacidad_ocupada),
      activo: valores.activo,
    })
  }

  return (
    <form
      onSubmit={handleSubmit(guardar)}
      className="space-y-4 rounded-2xl border border-stone-200 bg-white p-5"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="cap-fecha" className={claseLabel}>
            Fecha
          </label>
          <input
            id="cap-fecha"
            type="date"
            className={claseInput}
            {...register('fecha', { required: 'La fecha es obligatoria' })}
          />
          {errors.fecha && (
            <p className="mt-1 text-xs text-rose-700">{errors.fecha.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="cap-categoria" className={claseLabel}>
            Categoría
          </label>
          <select
            id="cap-categoria"
            className={claseInput}
            {...register('categoriaId', { required: true })}
          >
            {categorias.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="cap-max" className={claseLabel}>
            Capacidad máxima
          </label>
          <input
            id="cap-max"
            type="number"
            min="1"
            className={claseInput}
            {...register('capacidad_maxima', {
              required: 'Obligatorio',
              min: { value: 1, message: 'Mínimo 1' },
            })}
          />
          {errors.capacidad_maxima && (
            <p className="mt-1 text-xs text-rose-700">
              {errors.capacidad_maxima.message}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="cap-ocupada" className={claseLabel}>
            Capacidad ocupada (mock)
          </label>
          <input
            id="cap-ocupada"
            type="number"
            min="0"
            className={claseInput}
            {...register('capacidad_ocupada', {
              required: 'Obligatorio',
              min: { value: 0, message: 'Mínimo 0' },
            })}
          />
          {errors.capacidad_ocupada && (
            <p className="mt-1 text-xs text-rose-700">
              {errors.capacidad_ocupada.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input id="cap-activo" type="checkbox" {...register('activo')} />
        <label htmlFor="cap-activo" className={claseLabel}>
          Activo
        </label>
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancelar}
          className="inline-flex min-h-10 items-center rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:border-stone-500"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="inline-flex min-h-10 items-center rounded-lg bg-stone-800 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700"
        >
          Guardar configuración
        </button>
      </div>
    </form>
  )
}
