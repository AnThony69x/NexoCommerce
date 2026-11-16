import { useMemo, useState } from 'react'
import AccountNav from '../../components/account/AccountNav'
import BackButton from '../../components/common/BackButton'
import { ApiErrorState, LoadingState } from '../../components/common/RequestState'
import { useAsync } from '../../hooks/useAsync'
import {
  listarNotificaciones,
  marcarLeida,
} from '../../services/notificationsRepository'
import type { NotificacionTipo } from '../../types/notifications'

const ETIQUETA_TIPO: Record<NotificacionTipo, string> = {
  PEDIDO_CONFIRMADO: 'Pedido',
  PEDIDO_EN_PREPARACION: 'Pedido',
  PEDIDO_LISTO: 'Pedido',
  PEDIDO_ENTREGADO: 'Pedido',
  PAGO_APROBADO: 'Pago',
  PAGO_RECHAZADO: 'Pago',
  AVISO: 'Aviso',
}

const COLOR_TIPO: Record<NotificacionTipo, string> = {
  PEDIDO_CONFIRMADO: 'bg-sky-100 text-sky-800',
  PEDIDO_EN_PREPARACION: 'bg-sky-100 text-sky-800',
  PEDIDO_LISTO: 'bg-violet-100 text-violet-800',
  PEDIDO_ENTREGADO: 'bg-emerald-100 text-emerald-800',
  PAGO_APROBADO: 'bg-emerald-100 text-emerald-800',
  PAGO_RECHAZADO: 'bg-rose-100 text-rose-800',
  AVISO: 'bg-amber-100 text-amber-800',
}

function formatearFecha(iso: string): string {
  const fecha = new Date(iso)
  if (Number.isNaN(fecha.getTime())) return iso
  return new Intl.DateTimeFormat('es-EC', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(fecha)
}

export default function NotificacionesPage() {
  const [soloNoLeidas, setSoloNoLeidas] = useState(false)
  const [idEnProceso, setIdEnProceso] = useState<string | null>(null)
  const [errorAccion, setErrorAccion] = useState<string | null>(null)

  const {
    data,
    loading,
    error,
    recargar,
  } = useAsync(listarNotificaciones)

  const totalNoLeidas = data?.total_no_leidas ?? 0

  const visibles = useMemo(() => {
    const lista = data?.notificaciones ?? []
    return soloNoLeidas
      ? lista.filter((notificacion) => !notificacion.leida)
      : lista
  }, [data, soloNoLeidas])

  async function marcarComoLeida(id: string) {
    setIdEnProceso(id)
    setErrorAccion(null)
    try {
      await marcarLeida(id)
      await recargar()
    } catch (falla) {
      setErrorAccion(
        falla instanceof Error
          ? falla.message
          : 'No se pudo marcar la notificación.',
      )
    } finally {
      setIdEnProceso(null)
    }
  }

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <BackButton fallback="/" />

        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold text-stone-800">
              Notificaciones
            </h1>
            <p className="mt-2 text-sm text-stone-600">
              Avisos de tus pedidos, pagos y tu cuenta.
            </p>
          </div>
          {totalNoLeidas > 0 && (
            <span className="inline-flex items-center rounded-full bg-rose-brand-dark px-3 py-1 text-xs font-semibold text-white">
              {totalNoLeidas} sin leer
            </span>
          )}
        </div>

        <AccountNav />

        {errorAccion && (
          <p
            role="alert"
            className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
          >
            {errorAccion}
          </p>
        )}

        {loading ? (
          <LoadingState mensaje="Cargando tus notificaciones…" />
        ) : error ? (
          <ApiErrorState mensaje={error} onReintentar={recargar} />
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSoloNoLeidas(false)}
                aria-pressed={!soloNoLeidas}
                className={`inline-flex min-h-9 items-center rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  !soloNoLeidas
                    ? 'bg-stone-800 text-white'
                    : 'border border-stone-300 bg-white text-stone-600 hover:border-stone-400'
                }`}
              >
                Todas
              </button>
              <button
                type="button"
                onClick={() => setSoloNoLeidas(true)}
                aria-pressed={soloNoLeidas}
                className={`inline-flex min-h-9 items-center rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  soloNoLeidas
                    ? 'bg-stone-800 text-white'
                    : 'border border-stone-300 bg-white text-stone-600 hover:border-stone-400'
                }`}
              >
                Sin leer{totalNoLeidas > 0 ? ` (${totalNoLeidas})` : ''}
              </button>
            </div>

            {visibles.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-center">
                <p className="text-lg font-semibold text-stone-800">
                  {soloNoLeidas
                    ? 'No tienes avisos sin leer'
                    : 'Sin notificaciones'}
                </p>
                <p className="mx-auto mt-2 max-w-md text-sm text-stone-600">
                  {soloNoLeidas
                    ? 'Estás al día: todo lo que te avisamos ya está leído.'
                    : 'Te avisaremos aquí cuando haya novedades de tus pedidos y pagos.'}
                </p>
              </div>
            ) : (
              <ul className="space-y-3">
                {visibles.map((notificacion) => (
                  <li
                    key={notificacion.id}
                    className={`rounded-2xl border bg-white p-5 transition-colors ${
                      notificacion.leida
                        ? 'border-stone-200'
                        : 'border-rose-brand/40 bg-rose-50/30'
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.1em] ${
                              COLOR_TIPO[notificacion.tipo] ??
                              'bg-stone-200 text-stone-700'
                            }`}
                          >
                            {ETIQUETA_TIPO[notificacion.tipo] ??
                              'Aviso'}
                          </span>
                          {!notificacion.leida && (
                            <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-rose-brand-dark">
                              Nuevo
                            </span>
                          )}
                        </div>
                        <p className="mt-2 font-semibold text-stone-800">
                          {notificacion.titulo}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-stone-600">
                          {notificacion.mensaje}
                        </p>
                        <p className="mt-2 text-xs text-stone-500">
                          {formatearFecha(notificacion.creado_en)}
                        </p>
                      </div>
                      {!notificacion.leida && (
                        <button
                          type="button"
                          onClick={() => marcarComoLeida(notificacion.id)}
                          disabled={idEnProceso === notificacion.id}
                          className="inline-flex min-h-9 shrink-0 items-center rounded-lg border border-stone-300 px-3 py-1.5 text-xs font-medium text-stone-700 transition-colors hover:border-stone-500 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {idEnProceso === notificacion.id
                            ? 'Marcando…'
                            : 'Marcar como leída'}
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </main>
  )
}
