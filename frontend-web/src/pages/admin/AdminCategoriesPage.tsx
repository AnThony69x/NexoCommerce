import { useMemo, useState } from 'react'
import AdminConfirmModal from '../../components/admin/AdminConfirmModal'
import AdminEmptyState from '../../components/admin/AdminEmptyState'
import AdminFeedback from '../../components/admin/AdminFeedback'
import AdminSectionHeader from '../../components/admin/AdminSectionHeader'
import AdminStatusBadge from '../../components/admin/AdminStatusBadge'
import AdminTable from '../../components/admin/AdminTable'
import CategoryForm from '../../components/admin/CategoryForm'
import { useAdminMock } from '../../contexts/AdminMockContext'
import type { AdminCategory, AdminFeedbackMessage } from '../../types/admin'

export default function AdminCategoriesPage() {
  const { categorias, crearCategoria, actualizarCategoria, alternarCategoria } =
    useAdminMock()
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [editando, setEditando] = useState<AdminCategory | undefined>(undefined)
  const [confirmando, setConfirmando] = useState<AdminCategory | undefined>(undefined)
  const [mensaje, setMensaje] = useState<AdminFeedbackMessage | null>(null)

  const nombrePorId = useMemo(() => {
    const mapa = new Map<string, string>()
    categorias.forEach((item) => mapa.set(item.id, item.nombre))
    return mapa
  }, [categorias])

  const principales = categorias.filter((c) => c.categoria_padre_id === null)
  const subcategorias = categorias.filter((c) => c.categoria_padre_id !== null)

  function guardar(dato: Omit<AdminCategory, 'id'>) {
    if (editando) {
      actualizarCategoria(editando.id, dato)
      setMensaje({ tipo: 'exito', texto: 'Categoría actualizada (mock).' })
    } else {
      crearCategoria(dato)
      setMensaje({ tipo: 'exito', texto: 'Categoría creada (mock).' })
    }
    setMostrarFormulario(false)
    setEditando(undefined)
  }

  function confirmarCambio(item: AdminCategory) {
    alternarCategoria(item.id)
    setConfirmando(undefined)
    setMensaje({
      tipo: 'exito',
      texto: `Categoría ${item.activo ? 'desactivada' : 'activada'} (mock).`,
    })
  }

  function filaCategoria(item: AdminCategory, esSub: boolean) {
    return (
      <tr key={item.id} className="border-b border-stone-100">
        <td className="px-4 py-3 font-medium text-stone-800">
          <span className={esSub ? 'ml-4' : ''}>
            {esSub ? `↳ ${item.nombre}` : item.nombre}
          </span>
          <span className="ml-2 rounded-full bg-stone-100 px-2 py-0.5 text-[11px] font-semibold text-stone-600">
            {esSub ? 'Subcategoría' : 'Principal'}
          </span>
        </td>
        <td className="px-4 py-3 text-stone-600">
          {item.categoria_padre_id
            ? (nombrePorId.get(item.categoria_padre_id) ?? '—')
            : '—'}
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
    )
  }

  return (
    <div className="space-y-6">
      <AdminSectionHeader
        titulo="Categorías"
        descripcion="Categorías principales y subcategorías con categoria_padre_id (mock)."
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
            Crear categoría
          </button>
        }
      />

      <AdminFeedback mensaje={mensaje} />

      {mostrarFormulario && (
        <CategoryForm
          inicial={editando}
          categorias={categorias}
          onGuardar={guardar}
          onCancelar={() => {
            setMostrarFormulario(false)
            setEditando(undefined)
          }}
        />
      )}

      {categorias.length === 0 ? (
        <AdminEmptyState titulo="Sin categorías" descripcion="Crea la primera categoría mock." />
      ) : (
        <AdminTable encabezados={['Nombre', 'Categoría padre', 'Estado', 'Acciones']}>
          {principales.map((item) => filaCategoria(item, false))}
          {subcategorias.map((item) => filaCategoria(item, true))}
        </AdminTable>
      )}

      <AdminConfirmModal
        abierto={confirmando !== undefined}
        titulo={`${confirmando?.activo ? 'Desactivar' : 'Activar'} categoría`}
        descripcion={`¿Confirmas cambiar el estado de "${confirmando?.nombre}"? Acción mock reversible.`}
        textoConfirmar={confirmando?.activo ? 'Desactivar' : 'Activar'}
        onCancelar={() => setConfirmando(undefined)}
        onConfirmar={() => {
          if (confirmando) confirmarCambio(confirmando)
        }}
      />
    </div>
  )
}
