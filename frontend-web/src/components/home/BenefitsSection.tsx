export default function BenefitsSection() {
  return (
    <section className="border-b border-stone-200 bg-[#dfe8dc] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <article className="flex gap-3">
          <span
            aria-hidden="true"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-stone-400 text-sm font-semibold text-stone-700"
          >
            P
          </span>
          <div>
            <h2 className="text-sm font-semibold text-stone-800">
              Productos personalizados
            </h2>
            <p className="mt-1 text-xs leading-5 text-stone-600">
              Diseños pensados para hacer especial cada ocasión.
            </p>
          </div>
        </article>

        <article className="flex gap-3">
          <span
            aria-hidden="true"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-stone-400 text-sm font-semibold text-stone-700"
          >
            A
          </span>
          <div>
            <h2 className="text-sm font-semibold text-stone-800">
              Atención cercana
            </h2>
            <p className="mt-1 text-xs leading-5 text-stone-600">
              Te acompañamos para elegir el detalle ideal.
            </p>
          </div>
        </article>

        <article className="flex gap-3">
          <span
            aria-hidden="true"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-stone-400 text-sm font-semibold text-stone-700"
          >
            C
          </span>
          <div>
            <h2 className="text-sm font-semibold text-stone-800">
              Calidad en cada detalle
            </h2>
            <p className="mt-1 text-xs leading-5 text-stone-600">
              Elaboramos cada producto con cuidado y dedicación.
            </p>
          </div>
        </article>

        <article className="flex gap-3">
          <span
            aria-hidden="true"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-stone-400 text-sm font-semibold text-stone-700"
          >
            E
          </span>
          <div>
            <h2 className="text-sm font-semibold text-stone-800">
              Entregas planificadas
            </h2>
            <p className="mt-1 text-xs leading-5 text-stone-600">
              Coordinamos los tiempos para que todo llegue a tiempo.
            </p>
          </div>
        </article>
      </div>
    </section>
  )
}
