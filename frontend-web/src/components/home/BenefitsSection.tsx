type BeneficioProps = {
  icono: React.ReactNode
  titulo: string
  descripcion: string
}

function Beneficio({ icono, titulo, descripcion }: BeneficioProps) {
  return (
    <article className="flex gap-3">
      <span
        aria-hidden="true"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/70 text-brown"
      >
        {icono}
      </span>
      <div>
        <h2 className="text-sm font-semibold text-brown">{titulo}</h2>
        <p className="mt-1 text-xs leading-5 text-brown-soft">{descripcion}</p>
      </div>
    </article>
  )
}

const ICONO_HECHO_MANO = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5"
  >
    <path d="M12 3c2 3 5 4 5 8a5 5 0 0 1-10 0c0-4 3-5 5-8Z" />
  </svg>
)

const ICONO_REGALO = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5"
  >
    <rect x="4" y="9" width="16" height="11" rx="1" />
    <path d="M4 13h16M12 9v11M12 9c-2.5 0-4-1-4-2.5S9.5 4 12 9Zm0 0c2.5 0 4-1 4-2.5S14.5 4 12 9Z" />
  </svg>
)

const ICONO_ENVIO = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5"
  >
    <path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z" />
    <circle cx="7" cy="18" r="1.6" />
    <circle cx="17.5" cy="18" r="1.6" />
  </svg>
)

const ICONO_PAGO = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5"
  >
    <rect x="3" y="6" width="18" height="12" rx="2" />
    <path d="M3 10h18" />
  </svg>
)

export default function BenefitsSection() {
  return (
    <section className="bg-sage px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Beneficio
          icono={ICONO_HECHO_MANO}
          titulo="Hecho a mano"
          descripcion="Cada pieza se elabora con dedicación artesanal."
        />
        <Beneficio
          icono={ICONO_REGALO}
          titulo="Pedidos personalizados"
          descripcion="Adaptamos diseños a tu ocasión y mensaje."
        />
        <Beneficio
          icono={ICONO_ENVIO}
          titulo="Envíos a todo el país"
          descripcion="Coordinamos la entrega para que llegue a tiempo."
        />
        <Beneficio
          icono={ICONO_PAGO}
          titulo="Pagos seguros"
          descripcion="Paga con tarjeta o transferencia con confianza."
        />
      </div>
    </section>
  )
}
