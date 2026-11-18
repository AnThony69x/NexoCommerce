import { useState } from 'react'
import type { ChangeEvent } from 'react'
import AdminEmptyState from '../../components/admin/AdminEmptyState'
import AdminFeedback from '../../components/admin/AdminFeedback'
import AdminSectionHeader from '../../components/admin/AdminSectionHeader'
import AdminStatusBadge from '../../components/admin/AdminStatusBadge'
import { useAdminMock } from '../../contexts/AdminMockContext'
import type { AdminFeedbackMessage } from '../../types/admin'
import { resolverUrlMultimedia } from '../../utils/multimedia'

export default function AdminMediaPage() {
  const { multimedia, subirMultimedia, alternarMultimedia } = useAdminMock()
  const [mensaje, setMensaje] = useState<AdminFeedbackMessage | null>(null)
  const [vistaPrevia, setVistaPrevia] = useState<string | null>(null)
  const [destino, setDestino] = useState('productos')

  async function manejarSeleccion(evento: ChangeEvent<HTMLInputElement>) {
    const archivo = evento.target.files?.[0]
    setVistaPrevia(null)
    if (!archivo) return

    try {
      const destinoSubida = archivo.type === 'application/pdf' ? 'comprobantes' : destino
      const subido = await subirMultimedia(archivo, destinoSubida)
      if (archivo.type.startsWith('image/')) setVistaPrevia(subido.url)
      setMensaje({ tipo: 'exito', texto: `Archivo "${archivo.name}" subido.` })
    } catch (error) {
      setMensaje({ tipo: 'error', texto: error instanceof Error ? error.message : 'No se pudo subir el archivo.' })
    } finally {
      evento.target.value = ''
    }
  }

  return (
    <div className="space-y-6">
      <AdminSectionHeader
        titulo="Multimedia"
        descripcion="Sube imágenes para catálogo y publicaciones, o PDF para comprobantes. El backend no ofrece un endpoint para listar toda la biblioteca."
        accion={
          <div className="flex flex-wrap items-center gap-2">
            <select value={destino} onChange={(event) => setDestino(event.target.value)} aria-label="Destino del archivo" className="min-h-10 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-700">
              <option value="productos">Productos</option>
              <option value="publicaciones">Publicaciones</option>
              <option value="categorias">Categorías</option>
              <option value="tienda">Tienda</option>
              <option value="disenos">Diseños</option>
              <option value="comprobantes">Comprobantes</option>
            </select>
            <label className="inline-flex min-h-10 cursor-pointer items-center rounded-lg bg-stone-800 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700">
              Seleccionar archivo
              <input type="file" accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf" className="hidden" onChange={manejarSeleccion} />
            </label>
          </div>
        }
      />

      <AdminFeedback mensaje={mensaje} />

      {vistaPrevia && (
        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <h2 className="text-base font-semibold text-stone-800">
            Previsualización
          </h2>
          <img
            loading="lazy"
            src={vistaPrevia}
            alt="Vista previa local del archivo seleccionado"
            className="mt-3 max-h-64 rounded-xl border border-stone-200 object-contain"
          />
        </div>
      )}

      {multimedia.length === 0 ? (
        <AdminEmptyState
          titulo="Sin archivos"
          descripcion="Sube un archivo para verlo en esta sesión."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {multimedia.map((item) => (
            <article
              key={item.id}
              className="overflow-hidden rounded-2xl border border-stone-200 bg-white"
            >
              {(() => {
                const src = resolverUrlMultimedia(item.url)
                return src ? (
                  <img
                    loading="lazy"
                    src={src}
                    alt={item.nombre}
                    className="aspect-video w-full border-b border-stone-100 object-cover"
                  />
                ) : (
                  <div className="flex aspect-video w-full items-center justify-center border-b border-stone-100 bg-stone-50 text-xs text-stone-400">
                    {item.tipoMime === 'application/pdf' ? 'PDF' : 'Sin vista previa'}
                  </div>
                )
              })()}
              <div className="p-5">
              <h2 className="text-sm font-semibold text-stone-800">
                {item.nombre}
              </h2>
              <dl className="mt-3 space-y-1 text-sm text-stone-600">
                <div className="flex justify-between gap-2"><dt>ID</dt><dd>#{item.id}</dd></div>
                <div className="flex justify-between gap-2">
                  <dt>MIME</dt>
                  <dd>{item.tipoMime}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt>Tamaño</dt>
                  <dd>{item.tamanoKb} KB</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt>Dimensiones</dt>
                  <dd>
                    {item.ancho && item.alto
                      ? `${item.ancho}x${item.alto}`
                      : '—'}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt>Destino</dt>
                  <dd>{item.destino}</dd>
                </div>
                {item.rutaArchivo && <div className="flex justify-between gap-2"><dt>Ruta</dt><dd className="max-w-40 truncate" title={item.rutaArchivo}>{item.rutaArchivo}</dd></div>}
              </dl>
              <div className="mt-3 flex items-center justify-between">
                <AdminStatusBadge estado={item.activo ? 'ACTIVO' : 'INACTIVO'} />
                <button
                  type="button"
                  onClick={() => {
                    void Promise.resolve(alternarMultimedia(item.id)).then(() => setMensaje({ tipo: 'exito', texto: 'Archivo desactivado.' })).catch((error: unknown) => setMensaje({ tipo: 'error', texto: error instanceof Error ? error.message : 'No se pudo desactivar el archivo.' }))
                  }}
                  className="text-sm font-medium text-stone-800 hover:underline"
                  disabled={!item.activo}
                >
                  {item.activo ? 'Desactivar' : 'Desactivado'}
                </button>
              </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
