import type { PedidoEstado } from '../../types/admin'

type AccountStatusBadgeProps = {
  estado: PedidoEstado
}

/**
 * Estado del pedido con lenguaje de negocio (no el enum del backend).
 * El cliente ve "En preparación" en vez de "EN_PREPARACION".
 */
const ESTILOS: Record<PedidoEstado, { etiqueta: string; clases: string }> = {
  PENDIENTE: {
    etiqueta: 'Pendiente',
    clases: 'bg-amber-100 text-amber-800',
  },
  EN_PREPARACION: {
    etiqueta: 'En preparación',
    clases: 'bg-sky-100 text-sky-800',
  },
  LISTO: {
    etiqueta: 'Listo',
    clases: 'bg-violet-100 text-violet-800',
  },
  ENTREGADO: {
    etiqueta: 'Entregado',
    clases: 'bg-emerald-100 text-emerald-800',
  },
}

export default function AccountStatusBadge({ estado }: AccountStatusBadgeProps) {
  const estilo = ESTILOS[estado] ?? {
    etiqueta: estado,
    clases: 'bg-stone-200 text-stone-700',
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${estilo.clases}`}
    >
      {estilo.etiqueta}
    </span>
  )
}
