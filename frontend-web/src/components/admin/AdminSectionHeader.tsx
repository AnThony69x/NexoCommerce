import type { ReactNode } from 'react'

type AdminSectionHeaderProps = {
  titulo: string
  descripcion?: string
  accion?: ReactNode
}

export default function AdminSectionHeader({
  titulo,
  descripcion,
  accion,
}: AdminSectionHeaderProps) {
  return (
    <section className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold text-stone-800">{titulo}</h1>
        {descripcion && (
          <p className="mt-1 max-w-2xl text-sm text-stone-600">{descripcion}</p>
        )}
      </div>
      {accion && <div className="flex flex-wrap gap-2">{accion}</div>}
    </section>
  )
}
