import { formatPrice } from '../../utils/formatPrice'
import { useMemo, useState } from 'react'
import AdminConfirmModal from '../../components/admin/AdminConfirmModal'
import AdminEmptyState from '../../components/admin/AdminEmptyState'
import AdminFeedback from '../../components/admin/AdminFeedback'
import AdminSectionHeader from '../../components/admin/AdminSectionHeader'
import AdminStatusBadge from '../../components/admin/AdminStatusBadge'
import AdminTable from '../../components/admin/AdminTable'
import ProductForm from '../../components/admin/ProductForm'
import { useAdminMock } from '../../contexts/AdminMockContext'
import type { AdminFeedbackMessage, AdminProduct } from '../../types/admin'
import { resolverUrlMultimedia } from '../../utils/multimedia'
import { config } from '../../config/app'
import { obtenerProductoAdmin } from '../../services/adminService'

const claseInput =
  'rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-800 outline-none focus:border-stone-500'

export default function AdminProductsPage() {
  const { productos, categorias, crearProducto, actualizarProducto, alternarProducto } =
    useAdminMock()
  const [busqueda, setBusqueda] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('todas')
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [filtroTipo, setFiltroTipo] = useState('todos')
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [editando, setEditando] = useState<AdminProduct | undefined>(undefined)
  const [confirmando, setConfirmando] = useState<AdminProduct | undefined>(undefined)
  const [mensaje, setMensaje] = useState<AdminFeedbackMessage | null>(null)

  const filtrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()
    return productos.filter((item) => {
      const coincideTexto =
        texto === '' || item.nombre.toLowerCase().includes(texto)
      const coincideCategoria =
        filtroCategoria === 'todas' || item.categoriaId === filtroCategoria
      const coincideEstado =
        filtroEstado === 'todos' ||
        (filtroEstado === 'activos' ? item.activo : !item.activo)
      const coincideTipo = filtroTipo === 'todos' || item.tipo === filtroTipo
      return coincideTexto && coincideCategoria && coincideEstado && coincideTipo
    })
  }, [productos, busqueda, filtroCategoria, filtroEstado, filtroTipo])

  function abrirCrear() {
    setEditando(undefined)
    setMostrarFormulario(true)
    setMensaje(null)
  }

  async function abrirEditar(item: AdminProduct) {
    setMensaje(null)
    try {
      const producto = config.mockMode ? item : await obtenerProductoAdmin(item.id, categorias)
      setEditando(producto)
      setMostrarFormulario(true)
    } catch (error) {
      setMensaje({ tipo: 'error', texto: error instanceof Error ? error.message : 'No se pudo cargar el producto.' })
    }
  }

  async function guardar(dato: Omit<AdminProduct, 'id'>) {
    try {
      if (editando) {
        await actualizarProducto(editando.id, dato)
        setMensaje({ tipo: 'exito', texto: 'Producto actualizado.' })
      } else {
        await crearProducto(dato)
        setMensaje({ tipo: 'exito', texto: 'Producto creado.' })
      }
      setMostrarFormulario(false)
      setEditando(undefined)
    } catch (error) {
      setMensaje({ tipo: 'error', texto: error instanceof Error ? error.message : 'No se pudo guardar el producto.' })
    }
  }

  async function confirmarCambio(item: AdminProduct) {
    try {
      await alternarProducto(item.id)
      setConfirmando(undefined)
      setMensaje({ tipo: 'exito', texto: `Producto ${item.activo ? 'desactivado' : 'activado'}.` })
    } catch (error) {
      setMensaje({ tipo: 'error', texto: error instanceof Error ? error.message : 'No se pudo cambiar el estado del producto.' })
    }
  }

  return (
    <div className="space-y-6">
      <AdminSectionHeader
        titulo="Productos"
        descripcion="Gestiona los productos disponibles en el catálogo."
        accion={
          <button
            type="button"
            onClick={abrirCrear}
            className="inline-flex min-h-10 items-center rounded-lg bg-stone-800 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700"
          >
            Crear producto
          </button>
        }
      />

      <AdminFeedback mensaje={mensaje} />

      <div className="flex flex-wrap gap-2">
        <input
          type="search"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre"
          aria-label="Buscar productos"
          className={claseInput}
        />
        <select
          value={filtroCategoria}
          onChange={(e) => setFiltroCategoria(e.target.value)}
          aria-label="Filtrar por categoría"
          className={claseInput}
        >
          <option value="todas">Todas las categorías</option>
          {categorias.map((item) => (
            <option key={item.id} value={item.id}>
              {item.nombre}
            </option>
          ))}
        </select>
        <select
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value)}
          aria-label="Filtrar por tipo"
          className={claseInput}
        >
          <option value="todos">Todos los tipos</option>
          <option value="TORTA">TORTA</option>
          <option value="DETALLE">DETALLE</option>
          <option value="SUBLIMACION">SUBLIMACIÓN</option>
        </select>
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          aria-label="Filtrar por estado"
          className={claseInput}
        >
          <option value="todos">Todos los estados</option>
          <option value="activos">Activos</option>
          <option value="inactivos" disabled={!config.mockMode}>Inactivos</option>
        </select>
        {!config.mockMode && <p className="basis-full text-xs text-stone-500">El endpoint actual del catálogo solo devuelve productos activos. Para reactivar productos desactivados hace falta un listado administrativo.</p>}
      </div>

      {mostrarFormulario && (
        <ProductForm
          inicial={editando}
          categorias={categorias}
          onGuardar={guardar}
          onCancelar={() => {
            setMostrarFormulario(false)
            setEditando(undefined)
          }}
        />
      )}

      {filtrados.length === 0 ? (
        <AdminEmptyState
          titulo="Sin productos"
          descripcion="No hay productos disponibles que coincidan con los filtros actuales."
        />
      ) : (
        <AdminTable
          encabezados={['Imagen', 'Nombre', 'Tipo', 'Categoría', 'Precio', 'Estado', 'Acciones']}
        >
          {filtrados.map((item) => (
            <tr key={item.id} className="border-b border-stone-100">
              <td className="px-4 py-3">
                {(() => {
                  const src =
                    item.imagenes.length > 0
                      ? resolverUrlMultimedia(item.imagenes[0])
                      : null
                  return src ? (
                    <img
                      loading="lazy"
                      src={src}
                      alt={`Imagen de ${item.nombre}`}
                      className="h-12 w-12 rounded-lg border border-stone-200 object-cover"
                    />
                  ) : (
                    <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-stone-100 text-[10px] text-stone-400">
                      Sin imagen
                    </span>
                  )
                })()}
              </td>
              <td className="px-4 py-3 font-medium text-stone-800">{item.nombre}</td>
              <td className="px-4 py-3 text-stone-600">{item.tipo}</td>
              <td className="px-4 py-3 text-stone-600">{item.categoriaNombre}</td>
              <td className="px-4 py-3 text-stone-600">
                {formatPrice(item.precio_base)}
              </td>
              <td className="px-4 py-3">
                <AdminStatusBadge estado={item.activo ? 'ACTIVO' : 'INACTIVO'} />
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2 text-sm">
                  <button
                    type="button"
                    onClick={() => void abrirEditar(item)}
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
        titulo={`${confirmando?.activo ? 'Desactivar' : 'Activar'} producto`}
        descripcion={`¿Confirmas cambiar el estado de "${confirmando?.nombre}"?`}
        textoConfirmar={confirmando?.activo ? 'Desactivar' : 'Activar'}
        onCancelar={() => setConfirmando(undefined)}
        onConfirmar={() => {
          if (confirmando) void confirmarCambio(confirmando)
        }}
      />
    </div>
  )
}
