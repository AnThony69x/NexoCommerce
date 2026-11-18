import { useState } from 'react'
import AdminFeedback from '../../components/admin/AdminFeedback'
import AdminSectionHeader from '../../components/admin/AdminSectionHeader'
import StoreConfigForm from '../../components/admin/StoreConfigForm'
import { useAdmin } from '../../contexts/AdminContext'
import type { AdminFeedbackMessage, StoreConfiguration } from '../../types/admin'

export default function AdminStoreConfigPage() {
  const { tienda, actualizarTienda, cargando, error, recargar } = useAdmin()
  const [mensaje, setMensaje] = useState<AdminFeedbackMessage | null>(null)

  async function guardar(dato: StoreConfiguration) {
    try {
      await actualizarTienda(dato)
      setMensaje({ tipo: 'exito', texto: 'Configuración de tienda guardada.' })
    } catch (error) {
      setMensaje({ tipo: 'error', texto: error instanceof Error ? error.message : 'No se pudo guardar la configuración.' })
    }
  }

  if (cargando) {
    return (
      <div className="space-y-6">
        <AdminSectionHeader titulo="Configuración de tienda" />
        <p role="status" className="rounded-xl border border-stone-200 bg-white p-4 text-sm text-stone-600">Cargando la configuración vigente…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <AdminSectionHeader titulo="Configuración de tienda" />
        <AdminFeedback mensaje={{ tipo: 'error', texto: error }} />
        <button type="button" onClick={() => void recargar()} className="text-sm font-semibold underline">Reintentar carga</button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <AdminSectionHeader
        titulo="Configuración de tienda"
        descripcion="Actualiza los datos y la identidad visual de la tienda."
      />

      <AdminFeedback mensaje={mensaje} />

      <StoreConfigForm inicial={tienda} onGuardar={guardar} />
    </div>
  )
}
