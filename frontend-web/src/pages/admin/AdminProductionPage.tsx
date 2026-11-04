import { useState } from 'react'
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

  function guardar(dato: Omit<AdminProductionConfig, 'id'>) {
    if (dato.capacidad_ocupada > dato.capacidad_maxima) {
      setMensaje({
        tipo: 'error',
        texto: 'La capacidad ocupada no puede superar la máxima.',
      })
      return
    }
    if (editando) {
      actualizarProduccion(editando.id, dato)
      setMensaje({ tipo: 'exito', texto: 'Configuración actualizada (mock).' })
    } else {
      crearProduccion(dato)
      setMensaje({ tipo: 'exito', texto: 'Configuración creada (mock).' })
    }
    setMostrarFormulario(false)
    setEditando(undefined)
  }

  function confirmarCambio(item: AdminProductionConfig) {
    alternarProduccion(item.id)
    setConfirmando(undefined)
    setMensaje({
      tipo: 'exito',
      texto: `Configuración ${item.activo ? 'desactivada' : 'activada'} (mock).`,
    })
  }

  return (
    <div className="space-y-6">
      <AdminSectionHeader
        titulo="Producción"
        descripcion="Capacidad mock por fecha y categoría."
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

      <AdminFeedback mensaje={mensaje} />

      {mostrarFormulario && (
        <ProductionForm
          inicial={editando}
          categorias={categorias}
          onGuardar={guardar}
          onCancelar={() => {
            setMostrarFormulario(false)
            setEditando(undefined)
          }}
        />
      )}

      {produccion.length === 0 ? (
        <AdminEmptyState
          titulo="Sin configuraciones"
          descripcion="Crea la primera configuración mock de capacidad."
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
        descripcion={`¿Confirmas cambiar la configuración del ${confirmando?.fecha}? Acción mock reversible.`}
        textoConfirmar={confirmando?.activo ? 'Desactivar' : 'Activar'}
        onCancelar={() => setConfirmando(undefined)}
        onConfirmar={() => {
          if (confirmando) confirmarCambio(confirmando)
        }}
      />
    </div>
  )
}
