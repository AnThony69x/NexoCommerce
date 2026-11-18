import { useState, type ChangeEvent } from 'react'
import type { CartItemConfiguration } from '../../contexts/CartContext'
import type { ProductDetalle } from '../../types/product'
import { crearDisenoPersonalizado } from '../../services/personalizationService'
import { formatPrice } from '../../utils/formatPrice'

type ProductCustomizationProps = {
  product: ProductDetalle
  value: CartItemConfiguration
  autenticado: boolean
  modoMock: boolean
  onChange: (value: CartItemConfiguration) => void
}

const MAXIMO_ARCHIVO = 5 * 1024 * 1024
const TIPOS_IMAGEN = ['image/jpeg', 'image/png', 'image/webp']

export default function ProductCustomization({
  product,
  value,
  autenticado,
  modoMock,
  onChange,
}: ProductCustomizationProps) {
  const [subiendo, setSubiendo] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function seleccionarDiseno(id: number | undefined) {
    onChange({
      ...value,
      diseno_torta_id: product.tipo === 'TORTA' ? id : undefined,
      plantilla_diseno_id: product.tipo === 'SUBLIMACION' ? id : undefined,
      diseno_personalizado_id: undefined,
    })
  }

  async function subirDiseno(event: ChangeEvent<HTMLInputElement>) {
    const archivo = event.currentTarget.files?.[0]
    event.currentTarget.value = ''
    setError(null)
    if (!archivo) return
    if (!TIPOS_IMAGEN.includes(archivo.type)) {
      setError('El diseño debe ser una imagen JPG, PNG o WebP.')
      return
    }
    if (archivo.size > MAXIMO_ARCHIVO) {
      setError('La imagen no puede superar los 5 MB.')
      return
    }
    if (!autenticado) {
      setError('Inicia sesión como cliente para guardar tu diseño personalizado.')
      return
    }

    setSubiendo(true)
    try {
      const id = await crearDisenoPersonalizado(product.id, archivo, value.comentario ?? '')
      onChange({
        ...value,
        plantilla_diseno_id: undefined,
        diseno_personalizado_id: id,
      })
    } catch (fallo) {
      setError(fallo instanceof Error ? fallo.message : 'No se pudo guardar el diseño.')
    } finally {
      setSubiendo(false)
    }
  }

  const disenosTorta = product.torta?.disenos.filter((diseno) => diseno.activo) ?? []
  const plantillas = product.sublimacion?.plantillas.filter((plantilla) => plantilla.activo) ?? []
  const costoExtra = product.tipo === 'TORTA'
    ? disenosTorta.find((diseno) => diseno.id === value.diseno_torta_id)?.costo_adicional ?? 0
    : plantillas.find((plantilla) => plantilla.id === value.plantilla_diseno_id)?.costo_adicional ?? 0

  return (
    <section className="rounded-xl border border-stone-200 bg-white p-5 sm:p-6">
      <h2 className="text-lg font-semibold text-stone-800 sm:text-xl">
        Personaliza tu producto
      </h2>
      <p className="mt-3 text-sm leading-6 text-stone-600">
        Las opciones disponibles corresponden a las configuraciones registradas para este producto.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {product.torta && (
          <>
            <p className="text-sm text-stone-600">Sabor: <span className="font-medium text-stone-800">{product.torta.sabor}</span></p>
            <p className="text-sm text-stone-600">Tamaño: <span className="font-medium text-stone-800">{product.torta.tamano}</span> · {product.torta.porciones} porciones</p>
            <label className="flex flex-col gap-2 text-sm text-stone-600 sm:col-span-2">
              <span>Diseño de torta</span>
              <select
                value={value.diseno_torta_id ?? ''}
                onChange={(event) => seleccionarDiseno(event.target.value ? Number(event.target.value) : undefined)}
                className="min-h-11 rounded-lg border border-stone-300 bg-white px-3 text-stone-700"
              >
                <option value="">Sin diseño adicional</option>
                {disenosTorta.map((diseno) => (
                  <option key={diseno.id} value={diseno.id}>
                    {diseno.nombre}{diseno.costo_adicional > 0 ? ` (+${formatPrice(diseno.costo_adicional)})` : ''}
                  </option>
                ))}
              </select>
              {disenosTorta.length === 0 && <span className="text-xs text-stone-500">No hay diseños adicionales activos para esta torta.</span>}
            </label>
          </>
        )}

        {product.sublimacion && (
          <>
            <p className="text-sm text-stone-600 sm:col-span-2">Material: <span className="font-medium text-stone-800">{product.sublimacion.tipo_material}</span></p>
            <label className="flex flex-col gap-2 text-sm text-stone-600 sm:col-span-2">
              <span>Plantilla</span>
              <select
                value={value.plantilla_diseno_id ?? ''}
                onChange={(event) => seleccionarDiseno(event.target.value ? Number(event.target.value) : undefined)}
                className="min-h-11 rounded-lg border border-stone-300 bg-white px-3 text-stone-700"
              >
                <option value="">Sin plantilla</option>
                {plantillas.map((plantilla) => (
                  <option key={plantilla.id} value={plantilla.id}>
                    {plantilla.nombre}{plantilla.costo_adicional > 0 ? ` (+${formatPrice(plantilla.costo_adicional)})` : ''}
                  </option>
                ))}
              </select>
            </label>
            {!modoMock && (
              <label className="flex flex-col gap-2 text-sm text-stone-600 sm:col-span-2">
                <span>O sube tu propio diseño (JPG, PNG o WebP; máximo 5 MB)</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={subiendo || !autenticado}
                  onChange={subirDiseno}
                  className="block w-full text-sm text-stone-600 file:mr-3 file:min-h-10 file:rounded-lg file:border-0 file:bg-stone-100 file:px-4 file:font-medium file:text-stone-700 hover:file:bg-stone-200 disabled:opacity-60"
                />
                {value.diseno_personalizado_id && <span className="text-xs text-emerald-700">Diseño personalizado guardado y listo para agregar al carrito.</span>}
                {!autenticado && <span className="text-xs text-stone-500">Inicia sesión como cliente para usar esta opción.</span>}
              </label>
            )}
          </>
        )}

        <label className="flex flex-col gap-2 text-sm text-stone-600 sm:col-span-2">
          <span>Indicaciones adicionales</span>
          <textarea
            rows={3}
            value={value.comentario ?? ''}
            onChange={(event) => onChange({ ...value, comentario: event.target.value })}
            maxLength={2000}
            placeholder="Escribe detalles para preparar este producto."
            className="rounded-lg border border-stone-300 px-3 py-3 text-sm text-stone-700 outline-none placeholder:text-stone-400 focus:border-stone-500"
          />
        </label>
      </div>
      {costoExtra > 0 && <p className="mt-4 text-sm text-stone-600">Costo adicional del diseño seleccionado: <span className="font-semibold text-stone-800">{formatPrice(costoExtra)}</span>. El carrito mostrará el precio calculado por el servidor.</p>}
      {subiendo && <p role="status" className="mt-3 text-sm text-stone-600">Subiendo y registrando tu diseño…</p>}
      {error && <p role="alert" className="mt-3 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
    </section>
  )
}
