import { useForm } from 'react-hook-form'
import type { AdminCategory, AdminProduct, ProductoTipo } from '../../types/admin'

export type ProductFormValues = {
  nombre: string
  descripcion: string
  categoriaId: string
  tipo: ProductoTipo
  precio_base: number
  activo: boolean
  tamano: string
  porciones: number
  sabor: string
  stock: number
  tipo_material: string
}

type ProductFormProps = {
  inicial?: AdminProduct
  categorias: AdminCategory[]
  onGuardar: (dato: Omit<AdminProduct, 'id'>) => void
  onCancelar: () => void
}

const claseInput =
  'w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-800 outline-none focus:border-stone-500'
const claseLabel = 'block text-sm font-medium text-stone-700'

export default function ProductForm({
  inicial,
  categorias,
  onGuardar,
  onCancelar,
}: ProductFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ProductFormValues>({
    defaultValues: {
      nombre: inicial?.nombre ?? '',
      descripcion: inicial?.descripcion ?? '',
      categoriaId: inicial?.categoriaId ?? categorias[0]?.id ?? '',
      tipo: inicial?.tipo ?? 'TORTA',
      precio_base: inicial?.precio_base ?? 0,
      activo: inicial?.activo ?? true,
      tamano: inicial?.tamano ?? '',
      porciones: inicial?.porciones ?? 0,
      sabor: inicial?.sabor ?? '',
      stock: inicial?.stock ?? 0,
      tipo_material: inicial?.tipo_material ?? '',
    },
  })

  const tipoSeleccionado = watch('tipo')

  function guardar(valores: ProductFormValues) {
    const categoria = categorias.find((item) => item.id === valores.categoriaId)
    onGuardar({
      nombre: valores.nombre.trim(),
      descripcion: valores.descripcion.trim(),
      categoriaId: valores.categoriaId,
      categoriaNombre: categoria?.nombre ?? 'Sin categoría',
      tipo: valores.tipo,
      precio_base: Number(valores.precio_base),
      activo: valores.activo,
      tamano: valores.tipo === 'TORTA' ? valores.tamano.trim() : undefined,
      porciones:
        valores.tipo === 'TORTA' ? Number(valores.porciones) : undefined,
      sabor: valores.tipo === 'TORTA' ? valores.sabor.trim() : undefined,
      stock: valores.tipo === 'DETALLE' ? Number(valores.stock) : undefined,
      tipo_material:
        valores.tipo === 'SUBLIMACION'
          ? valores.tipo_material.trim()
          : undefined,
    })
  }

  return (
    <form
      onSubmit={handleSubmit(guardar)}
      className="space-y-4 rounded-2xl border border-stone-200 bg-white p-5"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="prod-nombre" className={claseLabel}>
            Nombre
          </label>
          <input
            id="prod-nombre"
            className={claseInput}
            {...register('nombre', { required: 'El nombre es obligatorio' })}
          />
          {errors.nombre && (
            <p className="mt-1 text-xs text-rose-700">{errors.nombre.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="prod-categoria" className={claseLabel}>
            Categoría
          </label>
          <select
            id="prod-categoria"
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

      <div>
        <label htmlFor="prod-descripcion" className={claseLabel}>
          Descripción
        </label>
        <textarea
          id="prod-descripcion"
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

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="prod-tipo" className={claseLabel}>
            Tipo
          </label>
          <select id="prod-tipo" className={claseInput} {...register('tipo')}>
            <option value="TORTA">TORTA</option>
            <option value="DETALLE">DETALLE</option>
            <option value="SUBLIMACION">SUBLIMACIÓN</option>
          </select>
        </div>
        <div>
          <label htmlFor="prod-precio" className={claseLabel}>
            Precio base
          </label>
          <input
            id="prod-precio"
            type="number"
            step="0.01"
            min="0"
            className={claseInput}
            {...register('precio_base', {
              required: 'El precio es obligatorio',
              min: { value: 0, message: 'Debe ser mayor o igual a 0' },
            })}
          />
          {errors.precio_base && (
            <p className="mt-1 text-xs text-rose-700">
              {errors.precio_base.message}
            </p>
          )}
        </div>
        <div className="flex items-end gap-2 pb-2">
          <input id="prod-activo" type="checkbox" {...register('activo')} />
          <label htmlFor="prod-activo" className={claseLabel}>
            Activo
          </label>
        </div>
      </div>

      {tipoSeleccionado === 'TORTA' && (
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="prod-tamano" className={claseLabel}>
              Tamaño
            </label>
            <input
              id="prod-tamano"
              className={claseInput}
              {...register('tamano', {
                required: 'El tamaño es obligatorio para TORTA',
              })}
            />
            {errors.tamano && (
              <p className="mt-1 text-xs text-rose-700">
                {errors.tamano.message}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="prod-porciones" className={claseLabel}>
              Porciones
            </label>
            <input
              id="prod-porciones"
              type="number"
              min="1"
              className={claseInput}
              {...register('porciones', {
                required: 'Las porciones son obligatorias',
                min: { value: 1, message: 'Mínimo 1' },
              })}
            />
            {errors.porciones && (
              <p className="mt-1 text-xs text-rose-700">
                {errors.porciones.message}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="prod-sabor" className={claseLabel}>
              Sabor
            </label>
            <input
              id="prod-sabor"
              className={claseInput}
              {...register('sabor', {
                required: 'El sabor es obligatorio para TORTA',
              })}
            />
            {errors.sabor && (
              <p className="mt-1 text-xs text-rose-700">{errors.sabor.message}</p>
            )}
          </div>
        </div>
      )}

      {tipoSeleccionado === 'DETALLE' && (
        <div>
          <label htmlFor="prod-stock" className={claseLabel}>
            Stock
          </label>
          <input
            id="prod-stock"
            type="number"
            min="0"
            className={`${claseInput} max-w-xs`}
            {...register('stock', {
              required: 'El stock es obligatorio para DETALLE',
              min: { value: 0, message: 'Mínimo 0' },
            })}
          />
          {errors.stock && (
            <p className="mt-1 text-xs text-rose-700">{errors.stock.message}</p>
          )}
        </div>
      )}

      {tipoSeleccionado === 'SUBLIMACION' && (
        <div>
          <label htmlFor="prod-material" className={claseLabel}>
            Tipo de material
          </label>
          <input
            id="prod-material"
            className={`${claseInput} max-w-xs`}
            {...register('tipo_material', {
              required: 'El material es obligatorio para SUBLIMACIÓN',
            })}
          />
          {errors.tipo_material && (
            <p className="mt-1 text-xs text-rose-700">
              {errors.tipo_material.message}
            </p>
          )}
        </div>
      )}

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
          Guardar producto
        </button>
      </div>
    </form>
  )
}
