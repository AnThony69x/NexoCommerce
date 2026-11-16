import { LoadingState } from './RequestState'

/**
 * Estado de carga de una pagina (carga diferida de rutas). Se muestra dentro
 * del layout, de modo que el header y el footer no desaparecen mientras baja
 * el trozo de JavaScript de la seccion.
 */
export default function CargandoPagina() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-16">
      <LoadingState mensaje="Cargando…" />
    </div>
  )
}
