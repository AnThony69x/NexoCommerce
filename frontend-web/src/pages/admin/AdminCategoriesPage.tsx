import AdminDialog from '../../components/admin/AdminDialog'
import { useRef, useMemo, useState } from 'react'
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

  const guardandoRef = useRef(false)
  const [guardando, setGuardando] = useState(false)

  function cerrarFormulario() {
    setMostrarFormulario(false)
    setEditando(undefined)
    setMensaje(null)
  }

  async function guardar(dato: Omit<AdminCategory, 'id'>) {
    if (guardandoRef.current) return
    guardandoRef.current = true
    setGuardando(true)
    setMensaje(null)
    try {
      if (editando) {
        await actualizarCategoria(editando.id, dato)
        setMensaje({ tipo: 'exito', texto: 'Categoría actualizada.' })
      } else {
        await crearCategoria(dato)
        setMensaje({ tipo: 'exito', texto: 'Categoría creada.' })
      }
      setMostrarFormulario(false)
      setEditando(undefined)
    } catch (error) {
      setMensaje({ tipo: 'error', texto: error instanceof Error ? error.message : 'No se pudo guardar la categoría.' })
    } finally {
      guardandoRef.current = false
      setGuardando(false)
    }
  }

  async function confirmarCambio(item: AdminCategory) {
    try {
      await alternarCategoria(item.id)
      setConfirmando(undefined)
      setMensaje({ tipo: 'exito', texto: `Categoría ${item.activo ? 'desactivada' : 'activada'}.` })
    } catch (error) {
      throw error instanceof Error ? error : new Error('No se pudo cambiar el estado de la categoría.')
    }
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
        descripcion="Categorías principales y subcategorías organizadas por categoría padre."
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

      <AdminFeedback mensaje={mostrarFormulario ? null : mensaje} />

      {mostrarFormulario && (
        <AdminDialog titulo={editando ? 'Editar categoría' : 'Crear categoría'} onCerrar={cerrarFormulario} ocupado={guardando}>
          <AdminFeedback mensaje={mensaje} />
          <fieldset disabled={guardando} className="min-w-0">
            <CategoryForm
              inicial={editando}
              categorias={categorias}
              onGuardar={guardar}
              onCancelar={cerrarFormulario}
            />
          </fieldset>
        </AdminDialog>
      )}

      {categorias.length === 0 ? (
        <AdminEmptyState titulo="Sin categorías" descripcion="Crea la primera categoría." />
      ) : (
        <AdminTable encabezados={['Nombre', 'Categoría padre', 'Estado', 'Acciones']}>
          {principales.map((item) => filaCategoria(item, false))}
          {subcategorias.map((item) => filaCategoria(item, true))}
        </AdminTable>
      )}

      <AdminConfirmModal
        abierto={confirmando !== undefined}
        titulo={`${confirmando?.activo ? 'Desactivar' : 'Activar'} categoría`}
        descripcion={`¿Confirmas cambiar el estado de "${confirmando?.nombre}"?`}
        textoConfirmar={confirmando?.activo ? 'Desactivar' : 'Activar'}
        onCancelar={() => setConfirmando(undefined)}
        onConfirmar={() => {
          if (confirmando) return confirmarCambio(confirmando)
        }}
      />
    </div>
  )
}
