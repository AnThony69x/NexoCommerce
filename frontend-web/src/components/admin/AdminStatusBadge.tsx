type AdminStatusBadgeProps = {
  estado: string
}

function clasePorEstado(estado: string): string {
  switch (estado) {
    case 'ACTIVO':
    case 'APROBADO':
    case 'ENTREGADO':
    case 'ADMIN':
      return 'bg-emerald-100 text-emerald-800'
    case 'PENDIENTE':
      return 'bg-amber-100 text-amber-800'
    case 'EN_PREPARACION':
      return 'bg-sky-100 text-sky-800'
    case 'LISTO':
      return 'bg-violet-100 text-violet-800'
    case 'RECHAZADO':
    case 'INACTIVO':
      return 'bg-rose-100 text-rose-800'
    case 'CLIENTE':
      return 'bg-stone-200 text-stone-700'
    default:
      return 'bg-stone-200 text-stone-700'
  }
}

export default function AdminStatusBadge({ estado }: AdminStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${clasePorEstado(estado)}`}
    >
      {estado}
    </span>
  )
}
