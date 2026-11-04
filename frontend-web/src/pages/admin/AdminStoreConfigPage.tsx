import { useState } from 'react'
import AdminFeedback from '../../components/admin/AdminFeedback'
import AdminSectionHeader from '../../components/admin/AdminSectionHeader'
import StoreConfigForm from '../../components/admin/StoreConfigForm'
import { useAdminMock } from '../../contexts/AdminMockContext'
import type { AdminFeedbackMessage, StoreConfiguration } from '../../types/admin'

export default function AdminStoreConfigPage() {
  const { tienda, actualizarTienda } = useAdminMock()
  const [mensaje, setMensaje] = useState<AdminFeedbackMessage | null>(null)

  function guardar(dato: StoreConfiguration) {
    actualizarTienda(dato)
    setMensaje({
      tipo: 'exito',
      texto: 'Configuración guardada solo en memoria (mock). No afecta la tienda pública todavía.',
    })
  }

  return (
    <div className="space-y-6">
      <AdminSectionHeader
        titulo="Configuración de tienda"
        descripcion="Formulario mock con React Hook Form. Los cambios no modifican la configuración global real todavía."
      />

      <AdminFeedback mensaje={mensaje} />

      <StoreConfigForm inicial={tienda} onGuardar={guardar} />
    </div>
  )
}
