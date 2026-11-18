import AdminDialog from '../../components/admin/AdminDialog'
import { useRef, useState } from 'react'
import AdminConfirmModal from '../../components/admin/AdminConfirmModal'
import AdminEmptyState from '../../components/admin/AdminEmptyState'
import AdminFeedback from '../../components/admin/AdminFeedback'
import AdminSectionHeader from '../../components/admin/AdminSectionHeader'
import AdminStatusBadge from '../../components/admin/AdminStatusBadge'
import AdminTable from '../../components/admin/AdminTable'
import ProductionForm from '../../components/admin/ProductionForm'
import { useAdminMock } from '../../contexts/AdminMockContext'
import type {
  AdminFeedbackMessage,
  AdminProductionConfig,
} from '../../types/admin'

function capacidadDisponible(item: AdminProductionConfig): number {
  return item.capacidad_maxima - item.capacidad_ocupada
}

export default function AdminProductionPage() {
  const {
    produccion,
    categorias,
    crearProduccion,
    actualizarProduccion,
    alternarProduccion,
  } = useAdminMock()
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [editando, setEditando] = useState<AdminProductionConfig | undefined>(undefined)
  const [confirmando, setConfirmando] = useState<AdminProductionConfig | undefined>(
    undefined,
  )
  const [mensaje, setMensaje] = useState<AdminFeedbackMessage | null>(null)

  const guardandoRef = useRef(false)
  const [guardando, setGuardando] = useState(false)

  function cerrarFormulario() {
    setMostrarFormulario(false)
    setEditando(undefined)
    setMensaje(null)
  }

  async function guardar(dato: Omit<AdminProductionConfig, 'id'>) {
    if (dato.capacidad_ocupada > dato.capacidad_maxima) {
      setMensaje({
        tipo: 'error',
        texto: 'La capacidad ocupada no puede superar la máxima.',
      })
      return
    }
    if (guardandoRef.current) return
    guardandoRef.current = true
    setGuardando(true)
    setMensaje(null)
    try {
      if (editando) {
        await actualizarProduccion(editando.id, dato)
        setMensaje({ tipo: 'exito', texto: 'Configuración actualizada.' })
      } else {
        await crearProduccion(dato)
        setMensaje({ tipo: 'exito', texto: 'Configuración creada.' })
      }
      setMostrarFormulario(false)
      setEditando(undefined)
    } catch (error) {
      setMensaje({ tipo: 'error', texto: error instanceof Error ? error.message : 'No se pudo guardar la configuración.' })
    } finally {
      guardandoRef.current = false
      setGuardando(false)
    }
  }

  async function confirmarCambio(item: AdminProductionConfig) {
    try {
      await alternarProduccion(item.id)
      setConfirmando(undefined)
      setMensaje({ tipo: 'exito', texto: `Configuración ${item.activo ? 'desactivada' : 'activada'}.` })
    } catch (error) {
      throw error instanceof Error ? error : new Error('No se pudo cambiar el estado de la configuración.')
    }
  }

  return (
    <div className="space-y-6">
      <AdminSectionHeader
        titulo="Producción"
        descripcion="Capacidad de producción por fecha y categoría."
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
            Crear configuración
          </button>
        }
      />

      <AdminFeedback mensaje={mostrarFormulario ? null : mensaje} />

      {mostrarFormulario && (
        <AdminDialog titulo={editando ? 'Editar configuración de capacidad' : 'Crear configuración de capacidad'} onCerrar={cerrarFormulario} ocupado={guardando}>
          <AdminFeedback mensaje={mensaje} />
          <fieldset disabled={guardando} className="min-w-0">
            <ProductionForm
              inicial={editando}
              categorias={categorias}
              onGuardar={guardar}
              onCancelar={cerrarFormulario}
            />
          </fieldset>
        </AdminDialog>
      )}

      {produccion.length === 0 ? (
        <AdminEmptyState
          titulo="Sin configuraciones"
          descripcion="Crea la primera configuración de capacidad."
        />
      ) : (
        <AdminTable
          encabezados={[
            'Fecha',
            'Categoría',
            'Máxima',
            'Disponible',
            'Estado',
            'Acciones',
          ]}
        >
          {produccion.map((item) => {
            const disponible = capacidadDisponible(item)
            const baja = disponible <= 2 || disponible / item.capacidad_maxima < 0.2
            return (
              <tr key={item.id} className="border-b border-stone-100">
                <td className="px-4 py-3 font-medium text-stone-800">{item.fecha}</td>
        <td className="px-4 py-3 text-stone-600">{item.categoriaNombre}</td>
                <td className="px-4 py-3 text-stone-600">{item.capacidad_maxima}</td>
                <td className="px-4 py-3 text-stone-600">
                  {disponible}
                  {baja && item.activo && (
                    <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                      Capacidad baja
                    </span>
                  )}
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
          })}
        </AdminTable>
      )}

      <AdminConfirmModal
        abierto={confirmando !== undefined}
        titulo={`${confirmando?.activo ? 'Desactivar' : 'Activar'} configuración`}
        descripcion={`¿Confirmas cambiar la configuración del ${confirmando?.fecha}?`}
        textoConfirmar={confirmando?.activo ? 'Desactivar' : 'Activar'}
        onCancelar={() => setConfirmando(undefined)}
        onConfirmar={() => {
          if (confirmando) return confirmarCambio(confirmando)
        }}
      />
    </div>
  )
}
