import AdminResourceState from '../../components/admin/AdminResourceState'
import { useState } from 'react'
import AdminFeedback from '../../components/admin/AdminFeedback'
import AdminSectionHeader from '../../components/admin/AdminSectionHeader'
import StoreConfigForm from '../../components/admin/StoreConfigForm'
import { useAdmin, useAdminResource } from '../../contexts/AdminContext'
import type { AdminFeedbackMessage, StoreConfiguration } from '../../types/admin'

export default function AdminStoreConfigPage() {
  const { actualizarTienda } = useAdmin()
  const recurso = useAdminResource('tienda')
  const tienda = recurso.data
  const [mensaje, setMensaje] = useState<AdminFeedbackMessage | null>(null)

  async function guardar(dato: StoreConfiguration) {
    try {
      await actualizarTienda(dato)
      setMensaje({ tipo: 'exito', texto: 'Configuración de tienda guardada.' })
    } catch (error) {
      setMensaje({ tipo: 'error', texto: error instanceof Error ? error.message : 'No se pudo guardar la configuración.' })
    }
  }

  return (
    <div className="space-y-6">
      <AdminSectionHeader
        titulo="Configuración de tienda"
        descripcion="Actualiza los datos y la identidad visual de la tienda."
      />

      <AdminFeedback mensaje={mensaje} />

      <AdminResourceState recurso={recurso} nombre="Configuración de tienda">
      {tienda && <StoreConfigForm inicial={tienda} onGuardar={guardar} />}
      </AdminResourceState>
    </div>
  )
}
