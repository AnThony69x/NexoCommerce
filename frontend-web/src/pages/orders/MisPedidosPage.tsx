import { Link } from 'react-router-dom'
import AdminStatusBadge from '../../components/admin/AdminStatusBadge'
import BackButton from '../../components/common/BackButton'
import { ApiErrorState, LoadingState } from '../../components/common/RequestState'
import { useAsync } from '../../hooks/useAsync'
import { listarMisPedidos } from '../../services/ordersService'
import { formatPrice } from '../../utils/formatPrice'

export default function MisPedidosPage() {
  const {
    data: pedidos,
    loading,
    error,
    recargar,
  } = useAsync(listarMisPedidos)

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <BackButton fallback="/" />

        <section>
          <h1 className="text-3xl font-semibold text-stone-800">Mis pedidos</h1>
          <p className="mt-2 text-sm text-stone-600">
            Historial mock (temporal, sin backend).
          </p>
        </section>

        {loading ? (
          <LoadingState mensaje="Cargando tus pedidos…" />
        ) : error ? (
          <ApiErrorState mensaje={error} onReintentar={recargar} />
        ) : (pedidos ?? []).length === 0 ? (
          <div className="rounded-xl border border-dashed border-stone-300 bg-white p-8 text-center">
            <p className="text-lg font-semibold text-stone-800">
              Aún no tienes pedidos
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm text-stone-600">
              Cuando confirmes tu primera compra, aparecerá en esta lista.
            </p>
            <Link
              to="/catalogo"
              className="mt-6 inline-flex min-h-11 items-center justify-center rounded-lg bg-stone-800 px-5 py-3 text-sm font-medium text-white hover:bg-stone-700"
            >
              Explorar catálogo
            </Link>
          </div>
        ) : (
          <ul className="space-y-4">
            {(pedidos ?? []).map((pedido) => (
              <li
                key={pedido.id}
                className="rounded-2xl border border-stone-200 bg-white p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-stone-800">{pedido.numero}</p>
                    <p className="mt-1 text-sm text-stone-600">
                      Entrega: {pedido.fecha_entrega} ·{' '}
                      {formatPrice(pedido.total)}
                    </p>
                  </div>
                  <AdminStatusBadge estado={pedido.estado} />
                </div>
                <Link
                  to={`/pedidos/${pedido.id}`}
                  className="mt-3 inline-block text-sm font-medium text-stone-800 hover:underline"
                >
                  Ver detalle
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  )
}
