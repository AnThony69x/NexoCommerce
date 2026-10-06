import { useForm } from 'react-hook-form'
import type {
  AdminCategory,
  AdminProduct,
  AdminPublication,
} from '../../types/admin'

export type PublicationFormValues = {
  titulo: string
  descripcion: string
  categoriaId: string
  productoId: string
  multimediaUrl: string
  activo: boolean
}

type PublicationFormProps = {
  inicial?: AdminPublication
  categorias: AdminCategory[]
  productos: AdminProduct[]
  onGuardar: (dato: Omit<AdminPublication, 'id'>) => void
  onCancelar: () => void
}

const claseInput =
  'w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-800 outline-none focus:border-stone-500'
const claseLabel = 'block text-sm font-medium text-stone-700'

export default function PublicationForm({
  inicial,
  categorias,
  productos,
  onGuardar,
  onCancelar,
}: PublicationFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PublicationFormValues>({
    defaultValues: {
      titulo: inicial?.titulo ?? '',
      descripcion: inicial?.descripcion ?? '',
      categoriaId: inicial?.categoriaId ?? '',
      productoId: inicial?.productoId ?? '',
      multimediaUrl: inicial?.multimediaUrl ?? '',
      activo: inicial?.activo ?? true,
    },
  })

  function guardar(valores: PublicationFormValues) {
    const categoria = categorias.find((item) => item.id === valores.categoriaId)
    const producto = productos.find((item) => item.id === valores.productoId)
    onGuardar({
      titulo: valores.titulo.trim(),
      descripcion: valores.descripcion.trim(),
      categoriaId: valores.categoriaId === '' ? undefined : valores.categoriaId,
      categoriaNombre: categoria?.nombre,
      productoId: valores.productoId === '' ? undefined : valores.productoId,
      productoNombre: producto?.nombre,
      multimediaUrl:
        valores.multimediaUrl.trim() === ''
          ? undefined
          : valores.multimediaUrl.trim(),
      activo: valores.activo,
    })
  }

  return (
    <form
      onSubmit={handleSubmit(guardar)}
      className="space-y-4 rounded-2xl border border-stone-200 bg-white p-5"
    >
      <div>
        <label htmlFor="pub-titulo" className={claseLabel}>
          Título
        </label>
        <input
          id="pub-titulo"
          className={claseInput}
          {...register('titulo', { required: 'El título es obligatorio' })}
        />
        {errors.titulo && (
          <p className="mt-1 text-xs text-rose-700">{errors.titulo.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="pub-descripcion" className={claseLabel}>
          Descripción
        </label>
        <textarea
          id="pub-descripcion"
          rows={3}
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

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="pub-categoria" className={claseLabel}>
            Categoría (opcional)
          </label>
          <select id="pub-categoria" className={claseInput} {...register('categoriaId')}>
            <option value="">Sin categoría</option>
            {categorias.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nombre}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="pub-producto" className={claseLabel}>
            Producto (opcional)
          </label>
          <select id="pub-producto" className={claseInput} {...register('productoId')}>
            <option value="">Sin producto</option>
            {productos.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="pub-media" className={claseLabel}>
          Multimedia mock (URL o nombre)
        </label>
        <input
          id="pub-media"
          className={claseInput}
          placeholder="hero-placeholder.svg (mock)"
          {...register('multimediaUrl')}
        />
      </div>

      <div className="flex items-center gap-2">
        <input id="pub-activo" type="checkbox" {...register('activo')} />
        <label htmlFor="pub-activo" className={claseLabel}>
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
          Guardar publicación
        </button>
      </div>
    </form>
  )
}
