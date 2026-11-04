import type { ReactNode } from 'react'

type AdminEmptyStateProps = {
  titulo: string
  descripcion?: string
  accion?: ReactNode
}

export default function AdminEmptyState({
  titulo,
  descripcion,
  accion,
}: AdminEmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-10 text-center">
      <p className="text-base font-semibold text-stone-800">{titulo}</p>
      {descripcion && (
        <p className="mx-auto mt-2 max-w-md text-sm text-stone-600">
          {descripcion}
        </p>
      )}
      {accion && <div className="mt-4 flex justify-center">{accion}</div>}
    </div>
  )
}
