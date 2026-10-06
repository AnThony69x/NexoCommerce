import { useState } from 'react'
import type { ChangeEvent } from 'react'
import AdminEmptyState from '../../components/admin/AdminEmptyState'
import AdminFeedback from '../../components/admin/AdminFeedback'
import AdminSectionHeader from '../../components/admin/AdminSectionHeader'
import AdminStatusBadge from '../../components/admin/AdminStatusBadge'
import { useAdminMock } from '../../contexts/AdminMockContext'
import type { AdminFeedbackMessage } from '../../types/admin'

export default function AdminMediaPage() {
  const { multimedia, agregarMultimedia, alternarMultimedia } = useAdminMock()
  const [mensaje, setMensaje] = useState<AdminFeedbackMessage | null>(null)
  const [vistaPrevia, setVistaPrevia] = useState<string | null>(null)

  function manejarSeleccion(evento: ChangeEvent<HTMLInputElement>) {
    const archivo = evento.target.files?.[0]
    setVistaPrevia(null)
    if (!archivo) return

    const esImagen = archivo.type.startsWith('image/')
    if (esImagen) {
      setVistaPrevia(URL.createObjectURL(archivo))
    }
    agregarMultimedia({
      nombre: archivo.name,
      tipoMime: archivo.type === '' ? 'desconocido' : archivo.type,
      tamanoKb: Math.max(1, Math.round(archivo.size / 1024)),
      url: esImagen ? 'vista previa local (mock)' : 'archivo mock, sin subida real',
      destino: 'selección local',
      activo: true,
    })
    setMensaje({
      tipo: 'exito',
      texto: `Archivo "${archivo.name}" agregado solo en memoria (mock, sin subida real).`,
    })
    evento.target.value = ''
  }

  return (
    <div className="space-y-6">
      <AdminSectionHeader
        titulo="Multimedia"
        descripcion="Interfaz visual mock. Sin carga real al servidor."
        accion={
          <label className="inline-flex min-h-10 cursor-pointer items-center rounded-lg bg-stone-800 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700">
            Seleccionar archivo
            <input
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={manejarSeleccion}
            />
          </label>
        }
      />

      <AdminFeedback mensaje={mensaje} />

      {vistaPrevia && (
        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <h2 className="text-base font-semibold text-stone-800">
            Previsualización local
          </h2>
          <img
            src={vistaPrevia}
            alt="Vista previa local del archivo seleccionado"
            className="mt-3 max-h-64 rounded-xl border border-stone-200 object-contain"
          />
        </div>
      )}

      {multimedia.length === 0 ? (
        <AdminEmptyState
          titulo="Sin archivos"
          descripcion="Selecciona un archivo para simular el registro mock."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {multimedia.map((item) => (
            <article
              key={item.id}
              className="rounded-2xl border border-stone-200 bg-white p-5"
            >
              <h2 className="text-sm font-semibold text-stone-800">
                {item.nombre}
              </h2>
              <dl className="mt-3 space-y-1 text-sm text-stone-600">
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
              </dl>
              <div className="mt-3 flex items-center justify-between">
                <AdminStatusBadge estado={item.activo ? 'ACTIVO' : 'INACTIVO'} />
                <button
                  type="button"
                  onClick={() => {
                    alternarMultimedia(item.id)
                    setMensaje({
                      tipo: 'exito',
                      texto: `Archivo ${item.activo ? 'desactivado' : 'activado'} (mock).`,
                    })
                  }}
                  className="text-sm font-medium text-stone-800 hover:underline"
                >
                  {item.activo ? 'Desactivar' : 'Activar'}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
