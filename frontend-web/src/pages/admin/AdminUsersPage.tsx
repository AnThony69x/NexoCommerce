import { useMemo, useState } from 'react'
import AdminConfirmModal from '../../components/admin/AdminConfirmModal'
import AdminEmptyState from '../../components/admin/AdminEmptyState'
import AdminFeedback from '../../components/admin/AdminFeedback'
import AdminSectionHeader from '../../components/admin/AdminSectionHeader'
import AdminStatusBadge from '../../components/admin/AdminStatusBadge'
import AdminTable from '../../components/admin/AdminTable'
import { useAdminMock } from '../../contexts/AdminMockContext'
import { ADMIN_PRINCIPAL_ID } from '../../data/admin/adminUsers.mock'
import type { AdminFeedbackMessage, AdminUser } from '../../types/admin'

const claseInput =
  'rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-800 outline-none focus:border-stone-500'

export default function AdminUsersPage() {
  const { usuarios, alternarUsuario } = useAdminMock()
  const [busqueda, setBusqueda] = useState('')
  const [filtroRol, setFiltroRol] = useState('todos')
  const [detalle, setDetalle] = useState<AdminUser | undefined>(undefined)
  const [confirmando, setConfirmando] = useState<AdminUser | undefined>(undefined)
  const [mensaje, setMensaje] = useState<AdminFeedbackMessage | null>(null)

  const filtrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()
    return usuarios.filter((item) => {
      const coincideTexto =
        texto === '' ||
        item.nombre_completo.toLowerCase().includes(texto) ||
        item.correo.toLowerCase().includes(texto)
      const coincideRol = filtroRol === 'todos' || item.rol === filtroRol
      return coincideTexto && coincideRol
    })
  }, [usuarios, busqueda, filtroRol])

  function confirmarCambio(item: AdminUser) {
    const ok = alternarUsuario(item.id)
    setConfirmando(undefined)
    setMensaje(
      ok
        ? {
            tipo: 'exito',
            texto: `Usuario ${item.activo ? 'desactivado' : 'activado'} (mock).`,
          }
        : {
            tipo: 'error',
            texto: 'No se puede desactivar al administrador mock principal.',
          },
    )
  }

  return (
    <div className="space-y-6">
      <AdminSectionHeader
        titulo="Usuarios"
        descripcion="Administración mock de roles ADMIN y CLIENTE."
      />

      <AdminFeedback mensaje={mensaje} />

      <div className="flex flex-wrap gap-2">
        <input
          type="search"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre o correo"
          aria-label="Buscar usuarios"
          className={claseInput}
        />
        <select
          value={filtroRol}
          onChange={(e) => setFiltroRol(e.target.value)}
          aria-label="Filtrar por rol"
          className={claseInput}
        >
          <option value="todos">Todos los roles</option>
          <option value="ADMIN">ADMIN</option>
          <option value="CLIENTE">CLIENTE</option>
        </select>
      </div>

      {filtrados.length === 0 ? (
        <AdminEmptyState
          titulo="Sin usuarios"
          descripcion="No hay usuarios mock con los filtros actuales."
        />
      ) : (
        <AdminTable
          encabezados={[
            'Nombre',
            'Correo',
            'Teléfono',
            'Rol',
            'Verificado',
            'Estado',
            'Acciones',
          ]}
        >
          {filtrados.map((item) => (
            <tr key={item.id} className="border-b border-stone-100">
              <td className="px-4 py-3 font-medium text-stone-800">
                {item.nombre_completo}
              </td>
              <td className="px-4 py-3 text-stone-600">{item.correo}</td>
              <td className="px-4 py-3 text-stone-600">{item.telefono}</td>
              <td className="px-4 py-3">
                <AdminStatusBadge estado={item.rol} />
              </td>
              <td className="px-4 py-3 text-stone-600">
                {item.correo_verificado ? 'Sí' : 'No'}
              </td>
              <td className="px-4 py-3">
                <AdminStatusBadge estado={item.activo ? 'ACTIVO' : 'INACTIVO'} />
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2 text-sm">
                  <button
                    type="button"
                    onClick={() => setDetalle(item)}
                    className="font-medium text-stone-800 hover:underline"
                  >
                    Ver
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmando(item)}
                    disabled={item.id === ADMIN_PRINCIPAL_ID}
                    className="font-medium text-stone-600 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {item.activo ? 'Desactivar' : 'Activar'}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </AdminTable>
      )}

      {detalle && (
        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <h2 className="text-base font-semibold text-stone-800">
            Detalle de {detalle.nombre_completo}
          </h2>
          <dl className="mt-3 grid gap-2 text-sm text-stone-700 sm:grid-cols-2">
            <div>
              <dt className="font-medium">Correo</dt>
              <dd>{detalle.correo}</dd>
            </div>
            <div>
              <dt className="font-medium">Teléfono</dt>
              <dd>{detalle.telefono}</dd>
            </div>
            <div>
              <dt className="font-medium">Rol</dt>
              <dd>{detalle.rol}</dd>
            </div>
            <div>
              <dt className="font-medium">Estado</dt>
              <dd>{detalle.activo ? 'Activo' : 'Inactivo'}</dd>
            </div>
          </dl>
          <button
            type="button"
            onClick={() => setDetalle(undefined)}
            className="mt-4 inline-flex min-h-10 items-center rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:border-stone-500"
          >
            Cerrar detalle
          </button>
        </div>
      )}

      <AdminConfirmModal
        abierto={confirmando !== undefined}
        titulo={`${confirmando?.activo ? 'Desactivar' : 'Activar'} usuario`}
        descripcion={`¿Confirmas cambiar el estado de "${confirmando?.nombre_completo}"? No se permite desactivar al administrador principal.`}
        textoConfirmar={confirmando?.activo ? 'Desactivar' : 'Activar'}
        onCancelar={() => setConfirmando(undefined)}
        onConfirmar={() => {
          if (confirmando) confirmarCambio(confirmando)
        }}
      />
    </div>
  )
}
