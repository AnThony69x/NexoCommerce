import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import AdminConfirmModal from '../../components/admin/AdminConfirmModal'
import AdminEmptyState from '../../components/admin/AdminEmptyState'
import AdminFeedback from '../../components/admin/AdminFeedback'
import AdminSectionHeader from '../../components/admin/AdminSectionHeader'
import AdminStatusBadge from '../../components/admin/AdminStatusBadge'
import AdminTable from '../../components/admin/AdminTable'
import ComprobanteDialog from '../../components/admin/ComprobanteDialog'
import { ApiErrorState, LoadingState } from '../../components/common/RequestState'
import { useAdmin } from '../../contexts/AdminContext'
import { useAsync } from '../../hooks/useAsync'
import { obtenerPagoPedidoAdmin, obtenerPedidoAdmin } from '../../services/adminService'
import type { AdminFeedbackMessage, AdminOrder, PedidoEstado } from '../../types/admin'
import { ApiError } from '../../types/api'
import { formatPrice } from '../../utils/formatPrice'

const acciones: Partial<Record<PedidoEstado, { estado: PedidoEstado; texto: string }>> = {
  PENDIENTE: { estado: 'EN_PREPARACION', texto: 'Iniciar preparación' },
  EN_PREPARACION: { estado: 'LISTO', texto: 'Marcar como listo' },
  LISTO: { estado: 'ENTREGADO', texto: 'Marcar como entregado' },
}

const estados: Record<PedidoEstado, string> = {
  PENDIENTE: 'Pendiente', EN_PREPARACION: 'En preparación', LISTO: 'Listo',
  ENTREGADO: 'Entregado', CANCELADO: 'Cancelado',
}

const tarjeta = 'rounded-2xl border border-stone-200 bg-white p-5'
const boton = 'inline-flex min-h-10 items-center rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-800 hover:border-stone-500'
const fecha = new Intl.DateTimeFormat('es-EC', { dateStyle: 'long', timeZone: 'UTC' })

export default function AdminOrderDetailPage() {
  const { id = '' } = useParams<{ id: string }>()
  return <DetallePedido key={id} id={id} />
}

function DetallePedido({ id }: { id: string }) {
  const { cambiarEstadoPedido } = useAdmin()
  const [confirmando, setConfirmando] = useState(false)
  const [mensaje, setMensaje] = useState<AdminFeedbackMessage | null>(null)
  const { data: pedido, loading, error, recargar } = useAsync(async () => {
    if (!/^[1-9]\d*$/.test(id)) return null
    try {
      return await obtenerPedidoAdmin(id)
    } catch (causa) {
      if (causa instanceof ApiError && causa.status === 404) return null
      throw causa
    }
  })

  const accion = pedido ? acciones[pedido.estado] : undefined
  const bloqueado = pedido?.estado === 'PENDIENTE' && pedido.pago_estado !== 'APROBADO'

  async function confirmarAvance() {
    if (!accion || bloqueado) return
    try {
      await cambiarEstadoPedido(id, accion.estado)
      setMensaje({ tipo: 'exito', texto: 'Estado actualizado.' })
    } catch (causa) {
      if (!(causa instanceof ApiError) ||
        !['PED_ESTADO_INVALIDO', 'PED_PAGO_NO_APROBADO', 'PED_NO_ENCONTRADO'].includes(causa.codigoError ?? '')) throw causa
      setMensaje({ tipo: 'error', texto: causa.message })
    }
    setConfirmando(false)
    recargar()
  }

  const volver = <Link to="/admin/pedidos" className={boton}>Volver a pedidos</Link>

  return (
    <div className="space-y-6">
      <AdminSectionHeader titulo={pedido ? `Pedido ${pedido.numero}` : 'Detalle del pedido'} accion={volver} />
      <AdminFeedback mensaje={mensaje} />
      {loading ? (
        <LoadingState mensaje="Cargando pedido…" />
      ) : error ? (
        <ApiErrorState mensaje={mensaje?.tipo === 'exito' ? `No se pudo actualizar la vista. ${error}` : error}
          onReintentar={mensaje?.tipo === 'exito' ? undefined : recargar} />
      ) : !pedido ? (
        <AdminEmptyState titulo="Pedido no encontrado" descripcion="El pedido solicitado no existe o ya no está disponible." />
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <AdminStatusBadge estado={pedido.estado} etiqueta={estados[pedido.estado]} />
            <span className="text-sm text-stone-600">Total del pedido</span>
            <strong className="text-xl">{formatPrice(pedido.total)}</strong>
            <button type="button" className={boton} onClick={recargar}>Actualizar pedido</button>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <section className={tarjeta}>
              <h2 className="font-semibold">Pago y siguiente acción</h2>
              <PagoPedido pedido={pedido} />
              {bloqueado ? (
                <p className="mt-3 text-sm text-stone-700">La preparación puede iniciar cuando el pago esté aprobado.</p>
              ) : accion ? (
                <button type="button" className={`${boton} mt-3`} onClick={() => setConfirmando(true)}>{accion.texto}</button>
              ) : (
                <p className="mt-3 text-sm text-stone-700">{pedido.estado === 'CANCELADO' ? 'Pedido cancelado.' : 'Pedido entregado.'}</p>
              )}
            </section>
            <section className={tarjeta}>
              <h2 className="font-semibold">Entrega</h2>
              <div className="mt-2 space-y-1 text-sm text-stone-700">
                <p>{pedido.fecha_entrega ? fecha.format(new Date(`${pedido.fecha_entrega}T00:00:00Z`)) : 'Fecha sin registrar'}{pedido.horaEntrega && ` · ${pedido.horaEntrega}`}</p>
                <p>{pedido.tipo_entrega === 'DOMICILIO' ? 'Entrega a domicilio' : pedido.tipo_entrega === 'RETIRO' ? 'Retiro en tienda' : 'Modalidad sin registrar'}</p>
                {pedido.tipo_entrega === 'DOMICILIO' && <p>{pedido.direccion || 'Dirección sin registrar'}</p>}
                <p>Teléfono de contacto: {pedido.telefonoContacto || 'Sin registrar'}</p>
              </div>
            </section>
            <section className={tarjeta}>
              <h2 className="font-semibold">Cliente</h2>
              <div className="mt-2 space-y-1 text-sm text-stone-700">
                <p>{pedido.clienteNombre}</p>
                <p className="break-all">{pedido.clienteCorreo || 'Correo sin registrar'}</p>
                <p>Teléfono del perfil: {pedido.clienteTelefono || 'Sin registrar'}</p>
              </div>
            </section>
          </div>

          <AdminTable encabezados={['Producto', 'Cantidad', 'Precio unitario', 'Personalización', 'Subtotal']}>
            {pedido.detalles.map((detalle) => (
              <tr key={detalle.id} className="border-b border-stone-100 align-top">
                <td className="px-4 py-3 font-medium">{detalle.productoNombre}</td>
                <td className="px-4 py-3">{detalle.cantidad}</td>
                <td className="whitespace-nowrap px-4 py-3">{formatPrice(detalle.precio_unitario)}</td>
                <td className="min-w-40 space-y-1 px-4 py-3">
                  {(detalle.nombreDiseno || detalle.tipoConfiguracion) && <p>{detalle.tipoConfiguracion === 'PLANTILLA' ? 'Plantilla' : 'Diseño'}: {detalle.nombreDiseno || 'Personalizado'}</p>}
                  {detalle.costoDiseno != null && detalle.costoDiseno > 0 && <p>Recargo: {formatPrice(detalle.costoDiseno)}</p>}
                  {detalle.indicaciones && <p className="whitespace-pre-wrap break-words">Indicaciones: {detalle.indicaciones}</p>}
                  {!detalle.tipoConfiguracion && !detalle.nombreDiseno && !detalle.indicaciones && !(detalle.costoDiseno && detalle.costoDiseno > 0) && '—'}
                </td>
                <td className="whitespace-nowrap px-4 py-3">{formatPrice(detalle.subtotal)}</td>
              </tr>
            ))}
          </AdminTable>
          <AdminConfirmModal abierto={confirmando} titulo={accion?.texto ?? 'Cambiar estado'}
            descripcion={accion ? `¿Cambiar el estado del pedido a «${estados[accion.estado]}»?` : 'Confirma el cambio de estado.'}
            textoConfirmar={accion?.texto ?? 'Confirmar'} onCancelar={() => setConfirmando(false)} onConfirmar={confirmarAvance} />
        </>
      )}
      {error && mensaje?.tipo === 'exito' && <button type="button" className={boton} onClick={recargar}>Actualizar pedido</button>}
    </div>
  )
}

function PagoPedido({ pedido }: { pedido: AdminOrder }) {
  const { data: pago, loading, error, recargar } = useAsync(
    () => pedido.pagoId ? obtenerPagoPedidoAdmin(pedido.id) : Promise.resolve(null),
    [pedido.id, pedido.pagoId],
  )
  const [mostrarComprobante, setMostrarComprobante] = useState(false)
  const etiquetas = { APROBADO: 'Aprobado', PENDIENTE: 'Pendiente de revisión', RECHAZADO: 'Rechazado', REEMBOLSADO: 'Reembolsado' }
  const comprobante = pago?.id === pedido.pagoId && pago?.comprobanteId ? pago : null

  return (
    <div className="mt-2 space-y-2 text-sm text-stone-700">
      {pedido.pago_estado ? (
        <AdminStatusBadge estado={pedido.pago_estado} etiqueta={etiquetas[pedido.pago_estado]} />
      ) : <p>Sin pago registrado</p>}
      {pedido.metodo_pago && <p>{pedido.metodo_pago === 'TRANSFERENCIA' ? 'Transferencia' : 'Referencia de pago'}</p>}
      {pedido.pagoMonto !== undefined && <p>{formatPrice(pedido.pagoMonto)}</p>}
      {pedido.pagoId && loading && <p role="status">Consultando comprobante…</p>}
      {error && <ApiErrorState mensaje={error} onReintentar={recargar} />}
      {!loading && !error && comprobante && <button type="button" className={boton} onClick={() => setMostrarComprobante(true)}>Ver comprobante</button>}
      {pedido.pago_estado !== 'APROBADO' && <Link to="/admin/pagos" className="block font-medium underline">Ir a pagos</Link>}
      {mostrarComprobante && comprobante && <ComprobanteDialog pago={comprobante} onCerrar={() => setMostrarComprobante(false)} />}
    </div>
  )
}
