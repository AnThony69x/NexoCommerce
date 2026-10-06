import { useState } from 'react'
import AdminConfirmModal from '../../components/admin/AdminConfirmModal'
import AdminEmptyState from '../../components/admin/AdminEmptyState'
import AdminFeedback from '../../components/admin/AdminFeedback'
import AdminSectionHeader from '../../components/admin/AdminSectionHeader'
import AdminStatusBadge from '../../components/admin/AdminStatusBadge'
import AdminTable from '../../components/admin/AdminTable'
import PublicationForm from '../../components/admin/PublicationForm'
import { useAdminMock } from '../../contexts/AdminMockContext'
import type { AdminFeedbackMessage, AdminPublication } from '../../types/admin'

export default function AdminPublicationsPage() {
  const {
    publicaciones,
    categorias,
    productos,
    crearPublicacion,
    actualizarPublicacion,
    alternarPublicacion,
  } = useAdminMock()
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [editando, setEditando] = useState<AdminPublication | undefined>(undefined)
  const [confirmando, setConfirmando] = useState<AdminPublication | undefined>(
    undefined,
  )
  const [mensaje, setMensaje] = useState<AdminFeedbackMessage | null>(null)

  function guardar(dato: Omit<AdminPublication, 'id'>) {
    if (editando) {
      actualizarPublicacion(editando.id, dato)
      setMensaje({ tipo: 'exito', texto: 'Publicación actualizada (mock).' })
    } else {
      crearPublicacion(dato)
      setMensaje({ tipo: 'exito', texto: 'Publicación creada (mock).' })
    }
    setMostrarFormulario(false)
    setEditando(undefined)
  }

  function confirmarCambio(item: AdminPublication) {
    alternarPublicacion(item.id)
    setConfirmando(undefined)
    setMensaje({
      tipo: 'exito',
      texto: `Publicación ${item.activo ? 'desactivada' : 'activada'} (mock).`,
    })
  }

  return (
    <div className="space-y-6">
      <AdminSectionHeader
        titulo="Publicaciones"
        descripcion="Contenido editorial mock con categoría y producto opcionales."
        accion={
          <button
            type="button"
            onClick={() => {
              setEditando(undefined)
              setMostrarFormulario(true)
              setMensaje(null)
            }}
            className="inline-flex min-h-10 items-center rounded-lg bg-stone-800 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700"
          >
            Crear publicación
          </button>
        }
      />

      <AdminFeedback mensaje={mensaje} />

      {mostrarFormulario && (
        <PublicationForm
          inicial={editando}
          categorias={categorias}
          productos={productos}
          onGuardar={guardar}
          onCancelar={() => {
            setMostrarFormulario(false)
            setEditando(undefined)
          }}
        />
      )}

      {publicaciones.length === 0 ? (
        <AdminEmptyState
          titulo="Sin publicaciones"
          descripcion="Crea la primera publicación mock."
        />
      ) : (
        <AdminTable
          encabezados={[
            'Título',
            'Categoría',
            'Producto',
            'Multimedia',
            'Estado',
            'Acciones',
          ]}
        >
          {publicaciones.map((item) => (
            <tr key={item.id} className="border-b border-stone-100">
              <td className="px-4 py-3 font-medium text-stone-800">{item.titulo}</td>
              <td className="px-4 py-3 text-stone-600">
                {item.categoriaNombre ?? '—'}
              </td>
              <td className="px-4 py-3 text-stone-600">
                {item.productoNombre ?? '—'}
              </td>
              <td className="px-4 py-3 text-stone-600">
                {item.multimediaUrl ?? '—'}
              </td>
              <td className="px-4 py-3">
                <AdminStatusBadge estado={item.activo ? 'ACTIVO' : 'INACTIVO'} />
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2 text-sm">
                  <button
                    type="button"
                    onClick={() => {
                      setEditando(item)
                      setMostrarFormulario(true)
                      setMensaje(null)
                    }}
                    className="font-medium text-stone-800 hover:underline"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmando(item)}
                    className="font-medium text-stone-600 hover:underline"
                  >
                    {item.activo ? 'Desactivar' : 'Activar'}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </AdminTable>
      )}

      <AdminConfirmModal
        abierto={confirmando !== undefined}
        titulo={`${confirmando?.activo ? 'Desactivar' : 'Activar'} publicación`}
        descripcion={`¿Confirmas cambiar el estado de "${confirmando?.titulo}"? Acción mock reversible.`}
        textoConfirmar={confirmando?.activo ? 'Desactivar' : 'Activar'}
        onCancelar={() => setConfirmando(undefined)}
        onConfirmar={() => {
          if (confirmando) confirmarCambio(confirmando)
        }}
      />
    </div>
  )
}
