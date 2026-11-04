type AdminStatCardProps = {
  etiqueta: string
  valor: string
  detalle?: string
}

export default function AdminStatCard({
  etiqueta,
  valor,
  detalle,
}: AdminStatCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-stone-200 bg-white px-5 py-4 shadow-sm">
      <span
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-rose-600 to-amber-500"
      />
      <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
        {etiqueta}
      </p>
      <p className="mt-2 text-2xl font-semibold text-stone-800">{valor}</p>
      {detalle && <p className="mt-1 text-xs text-stone-500">{detalle}</p>}
    </div>
  )
}
