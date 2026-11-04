import type { ChangeEvent } from 'react'
import { useAdminMock } from '../../contexts/AdminMockContext'
import { MAX_IMAGENES_PRODUCTO, resolverUrlMultimedia } from '../../utils/multimedia'

type SelectorImagenesProductoProps = {
  seleccionadas: string[]
  onCambiar: (urls: string[]) => void
}

export default function SelectorImagenesProducto({
  seleccionadas,
  onCambiar,
}: SelectorImagenesProductoProps) {
  const { multimedia, agregarMultimedia } = useAdminMock()

  const biblioteca = multimedia.filter(
    (item) => item.tipoMime.startsWith('image/') && resolverUrlMultimedia(item.url) !== null,
  )
  const limiteAlcanzado = seleccionadas.length >= MAX_IMAGENES_PRODUCTO

  function alternar(url: string) {
    if (seleccionadas.includes(url)) {
      onCambiar(seleccionadas.filter((actual) => actual !== url))
      return
    }
    if (limiteAlcanzado) return
    onCambiar([...seleccionadas, url])
  }

  function hacerPrincipal(url: string) {
    onCambiar([url, ...seleccionadas.filter((actual) => actual !== url)])
  }

  function manejarSubida(evento: ChangeEvent<HTMLInputElement>) {
    const archivo = evento.target.files?.[0]
    evento.target.value = ''
    if (!archivo || !archivo.type.startsWith('image/') || limiteAlcanzado) return

    const urlLocal = URL.createObjectURL(archivo)
    agregarMultimedia({
      nombre: archivo.name,
      tipoMime: archivo.type,
      tamanoKb: Math.max(1, Math.round(archivo.size / 1024)),
      url: urlLocal,
      destino: 'productos',
      activo: true,
    })
    onCambiar([...seleccionadas, urlLocal])
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-stone-700">
          Imágenes de referencia
        </p>
        <span className="text-xs text-stone-500">
          {seleccionadas.length} de {MAX_IMAGENES_PRODUCTO} · la primera es la
          principal
        </span>
      </div>

      {seleccionadas.length === 0 ? (
        <p className="rounded-lg border border-dashed border-stone-300 p-4 text-center text-sm text-stone-500">
          Sin imágenes. Elige de la biblioteca o sube una desde tu equipo.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {seleccionadas.map((url, indice) => {
            const src = resolverUrlMultimedia(url)
            return (
              <li
                key={`${url}-${indice}`}
                className="relative overflow-hidden rounded-xl border border-stone-200 bg-stone-50"
              >
                {src ? (
                  <img
                    src={src}
                    alt={`Imagen ${indice + 1} del producto`}
                    className="aspect-square w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-square w-full items-center justify-center text-xs text-stone-400">
                    Sin vista
                  </div>
                )}
                {indice === 0 && (
                  <span className="absolute left-2 top-2 rounded-full bg-stone-800 px-2 py-0.5 text-[11px] font-semibold text-white">
                    Principal
                  </span>
                )}
                <div className="flex gap-2 p-2 text-xs">
                  {indice !== 0 && (
                    <button
                      type="button"
                      onClick={() => hacerPrincipal(url)}
                      className="font-medium text-stone-700 hover:underline"
                    >
                      Principal
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => alternar(url)}
                    className="font-medium text-rose-700 hover:underline"
                  >
                    Quitar
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-500">
          Biblioteca multimedia
        </p>
        {biblioteca.length === 0 ? (
          <p className="text-sm text-stone-500">
            No hay imágenes en la biblioteca. Sube una para empezar.
          </p>
        ) : (
          <ul className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {biblioteca.map((item) => {
              const src = resolverUrlMultimedia(item.url)
              const elegida = seleccionadas.includes(item.url)
              const deshabilitada =
                (!elegida && limiteAlcanzado) || !item.activo
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    disabled={deshabilitada}
                    onClick={() => alternar(item.url)}
                    title={`${item.nombre}${item.activo ? '' : ' (inactiva)'}`}
                    aria-pressed={elegida}
                    className={`relative block w-full overflow-hidden rounded-lg border-2 transition ${
                      elegida
                        ? 'border-stone-800'
                        : 'border-transparent hover:border-stone-300'
                    } disabled:cursor-not-allowed disabled:opacity-40`}
                  >
                    {src && (
                      <img
                        src={src}
                        alt={item.nombre}
                        className="aspect-square w-full object-cover"
                      />
                    )}
                    {elegida && (
                      <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-stone-800 text-[11px] font-bold text-white">
                        ✓
                      </span>
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <label className="inline-flex min-h-10 cursor-pointer items-center rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:border-stone-500">
        Subir imagen desde el equipo
        <input
          type="file"
          accept="image/*"
          className="hidden"
          disabled={limiteAlcanzado}
          onChange={manejarSubida}
        />
      </label>
    </div>
  )
}
