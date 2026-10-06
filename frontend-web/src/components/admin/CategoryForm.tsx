import { useForm } from 'react-hook-form'
import type { AdminCategory } from '../../types/admin'

export type CategoryFormValues = {
  nombre: string
  descripcion: string
  categoria_padre_id: string
  activo: boolean
}

type CategoryFormProps = {
  inicial?: AdminCategory
  categorias: AdminCategory[]
  onGuardar: (dato: Omit<AdminCategory, 'id'>) => void
  onCancelar: () => void
}

const claseInput =
  'w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-800 outline-none focus:border-stone-500'
const claseLabel = 'block text-sm font-medium text-stone-700'

export default function CategoryForm({
  inicial,
  categorias,
  onGuardar,
  onCancelar,
}: CategoryFormProps) {
  const padresDisponibles = categorias.filter(
    (item) => item.id !== inicial?.id && item.categoria_padre_id === null,
  )
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    defaultValues: {
      nombre: inicial?.nombre ?? '',
      descripcion: inicial?.descripcion ?? '',
      categoria_padre_id: inicial?.categoria_padre_id ?? '',
      activo: inicial?.activo ?? true,
    },
  })

  function guardar(valores: CategoryFormValues) {
    onGuardar({
      nombre: valores.nombre.trim(),
      descripcion: valores.descripcion.trim(),
      categoria_padre_id:
        valores.categoria_padre_id === '' ? null : valores.categoria_padre_id,
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
          <label htmlFor="cat-nombre" className={claseLabel}>
            Nombre
          </label>
          <input
            id="cat-nombre"
            className={claseInput}
            {...register('nombre', { required: 'El nombre es obligatorio' })}
          />
          {errors.nombre && (
            <p className="mt-1 text-xs text-rose-700">{errors.nombre.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="cat-padre" className={claseLabel}>
            Categoría padre (vacío = principal)
          </label>
          <select id="cat-padre" className={claseInput} {...register('categoria_padre_id')}>
            <option value="">Sin padre (principal)</option>
            {padresDisponibles.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="cat-descripcion" className={claseLabel}>
          Descripción
        </label>
        <textarea
          id="cat-descripcion"
          rows={2}
          className={claseInput}
          {...register('descripcion', {
            required: 'La descripción es obligatoria',
          })}
        />
        {errors.descripcion && (
          <p className="mt-1 text-xs text-rose-700">
            {errors.descripcion.message}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <input id="cat-activo" type="checkbox" {...register('activo')} />
        <label htmlFor="cat-activo" className={claseLabel}>
          Activa
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
          Guardar categoría
        </button>
      </div>
    </form>
  )
}
