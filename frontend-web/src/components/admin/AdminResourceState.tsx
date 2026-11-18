import type { ReactNode } from 'react'
import type { EstadoRecurso } from '../../contexts/adminResources'
import { ApiErrorState, LoadingState } from '../common/RequestState'

type Recurso = EstadoRecurso<unknown> & { recargar: () => void }

export default function AdminResourceState({ recurso, nombre, children }: {
  recurso: Recurso
  nombre: string
  children?: ReactNode
}) {
  if (recurso.error) {
    return (
      <>
        {recurso.data === undefined && !recurso.guardado ? (
          <ApiErrorState mensaje={`${nombre}: ${recurso.error}`} onReintentar={recurso.recargar} />
        ) : (
          <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
            <p>{recurso.guardado ? 'Cambios guardados. ' : ''}No se pudieron actualizar los datos de {nombre.toLowerCase()}. {recurso.error}</p>
            <button type="button" className="mt-2 font-semibold underline" onClick={recurso.recargar}>Actualizar datos</button>
          </div>
        )}
        {recurso.data !== undefined && children}
      </>
    )
  }
  if (recurso.loading && recurso.data === undefined) return <LoadingState mensaje={`Cargando ${nombre.toLowerCase()}…`} />
  return <>{recurso.loading && <p role="status" className="text-sm text-stone-600">Actualizando {nombre.toLowerCase()}…</p>}{children}</>
}
