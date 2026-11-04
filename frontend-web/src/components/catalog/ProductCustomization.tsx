export default function ProductCustomization() {
  return (
    <section className="rounded-xl border border-stone-200 bg-white p-5 sm:p-6">
      <h2 className="text-lg font-semibold text-stone-800 sm:text-xl">
        Personaliza tu producto
      </h2>
      <p className="mt-3 text-sm leading-6 text-stone-600">
        Elige opciones mock para visualizar cómo podría personalizarse este
        producto.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm text-stone-600">
          <span>Diseño</span>
          <select className="min-h-11 rounded-lg border border-stone-300 bg-white px-3 text-stone-700">
            <option>Jardín de rosas</option>
            <option>Celebración clásica</option>
            <option>Flores delicadas</option>
          </select>
        </label>

        <label className="flex flex-col gap-2 text-sm text-stone-600">
          <span>Sabor</span>
          <select className="min-h-11 rounded-lg border border-stone-300 bg-white px-3 text-stone-700">
            <option>Vainilla</option>
            <option>Chocolate</option>
            <option>Red velvet</option>
          </select>
        </label>

        <label className="flex flex-col gap-2 text-sm text-stone-600">
          <span>Tamaño</span>
          <select className="min-h-11 rounded-lg border border-stone-300 bg-white px-3 text-stone-700">
            <option>Pequeño</option>
            <option>Mediano</option>
            <option>Grande</option>
          </select>
        </label>

        <label className="flex flex-col gap-2 text-sm text-stone-600 sm:col-span-2">
          <span>Instrucciones adicionales</span>
          <textarea
            rows={4}
            placeholder="Escribe una instrucción temporal..."
            className="rounded-lg border border-stone-300 px-3 py-3 text-sm text-stone-700 outline-none placeholder:text-stone-400 focus:border-stone-500"
          />
        </label>
      </div>
    </section>
  )
}
