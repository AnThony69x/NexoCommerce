import { Link } from 'react-router-dom'
import AccountNav from '../../components/account/AccountNav'
import AccountStatusBadge from '../../components/account/AccountStatusBadge'
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

  const lista = pedidos ?? []
  const totalGastado = lista.reduce((total, pedido) => total + pedido.total, 0)
  const articulos = lista.reduce(
    (total, pedido) =>
      total +
      pedido.detalles.reduce(
        (suma, detalle) => suma + detalle.cantidad,
        0,
      ),
    0,
  )

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <BackButton fallback="/" />

        <div>
          <h1 className="text-3xl font-semibold text-stone-800">Mis pedidos</h1>
          <p className="mt-2 text-sm text-stone-600">
            Revisa el estado de tus compras y el detalle de cada entrega.
          </p>
        </div>

        <AccountNav />

        {loading ? (
          <LoadingState mensaje="Cargando tus pedidos…" />
        ) : error ? (
          <ApiErrorState mensaje={error} onReintentar={recargar} />
        ) : lista.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-center">
            <p className="text-lg font-semibold text-stone-800">
              Aún no tienes pedidos
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm text-stone-600">
              Cuando confirmes tu primera compra, aparecerá en esta lista y
              podrás seguir su estado aquí.
            </p>
            <Link
              to="/catalogo"
              className="mt-6 inline-flex min-h-11 items-center justify-center rounded-lg bg-stone-800 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-stone-700"
            >
              Explorar catálogo
            </Link>
          </div>
        ) : (
          <>
            <section className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-stone-200 bg-white p-5">
                <p className="text-xs uppercase tracking-[0.14em] text-stone-500">
                  Pedidos
                </p>
                <p className="mt-2 text-2xl font-semibold text-stone-800">
                  {lista.length}
                </p>
              </div>
              <div className="rounded-2xl border border-stone-200 bg-white p-5">
                <p className="text-xs uppercase tracking-[0.14em] text-stone-500">
                  Artículos
                </p>
                <p className="mt-2 text-2xl font-semibold text-stone-800">
                  {articulos}
                </p>
              </div>
              <div className="rounded-2xl border border-stone-200 bg-white p-5">
                <p className="text-xs uppercase tracking-[0.14em] text-stone-500">
                  Total comprado
                </p>
                <p className="mt-2 text-2xl font-semibold text-stone-800">
                  {formatPrice(totalGastado)}
                </p>
              </div>
            </section>

            <ul className="space-y-4">
              {lista.map((pedido) => {
                const articulosPedido = pedido.detalles.reduce(
                  (suma, detalle) => suma + detalle.cantidad,
                  0,
                )

                return (
                  <li
                    key={pedido.id}
                    className="rounded-2xl border border-stone-200 bg-white p-5 transition-colors hover:border-stone-300"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-stone-800">
                          {pedido.numero}
                        </p>
                        <p className="mt-1 text-sm text-stone-600">
                          {articulosPedido}{' '}
                          {articulosPedido === 1 ? 'artículo' : 'artículos'} ·
                          entrega {pedido.fecha_entrega}
                        </p>
                      </div>
                      <AccountStatusBadge estado={pedido.estado} />
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-4">
                      <p className="text-base font-semibold text-stone-800">
                        {formatPrice(pedido.total)}
                      </p>
                      <Link
                        to={`/pedidos/${pedido.id}`}
                        className="inline-flex min-h-10 items-center rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition-colors hover:border-stone-500"
                      >
                        Ver detalle
                      </Link>
                    </div>
                  </li>
                )
              })}
            </ul>
          </>
        )}
      </div>
    </main>
  )
}
