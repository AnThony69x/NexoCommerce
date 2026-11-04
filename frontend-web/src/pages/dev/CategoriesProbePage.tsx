/**
 * ⚠️ PÁGINA TEMPORAL DE DESARROLLO — BORRAR TRAS VERIFICAR.
 * Ruta temporal: /dev/categorias
 *
 * Prueba controlada del endpoint público GET /api/v1/categorias.
 * Muestra: loading, la respuesta real (JSON), y errores (conexión vs otro).
 * No toca ningún módulo mock. Su único propósito es comprobar que el
 * frontend se comunica con Laravel.
 */
import { useState } from 'react'
import { getCategories } from '../../services/categoriesService'
import type { CategoryNode } from '../../types/category'
import { ApiError } from '../../types/api'

type Estado =
  | { fase: 'inicial' }
  | { fase: 'cargando' }
  | { fase: 'ok'; datos: CategoryNode[] }
  | { fase: 'error'; mensaje: string; detalle?: string }

export default function CategoriesProbePage() {
  const [estado, setEstado] = useState<Estado>({ fase: 'inicial' })

  async function probar() {
    setEstado({ fase: 'cargando' })
    try {
      const datos = await getCategories()
      setEstado({ fase: 'ok', datos })
    } catch (error) {
      if (error instanceof ApiError) {
        // status 0 = sin respuesta del servidor (backend caído / CORS / URL mal).
        const esConexion = error.status === 0
        setEstado({
          fase: 'error',
          mensaje: esConexion ?
            'El backend no responde. Verifica que Laravel esté corriendo y la URL de VITE_API_URL sea correcta.'
            : error.message,
          detalle: `HTTP ${error.status}`,
        })
      } else {
        setEstado({
          fase: 'error',
          mensaje: 'Error inesperado al llamar a la API.',
          detalle: String(error),
        })
      }
    }
  }

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <strong>Probe temporal.</strong> Página de desarrollo para probar
          <code className="mx-1">GET /api/v1/categorias</code>. Bórrala (y su
          ruta en AppRouter) cuando termines de verificar.
        </div>

        <h1 className="text-2xl font-semibold text-stone-800">
          Probe: GET /api/v1/categorias
        </h1>

        <button
          type="button"
          onClick={probar}
          disabled={estado.fase === 'cargando'}
          className="inline-flex min-h-11 items-center rounded-lg bg-stone-800 px-5 py-3 text-sm font-medium text-white hover:bg-stone-700 disabled:opacity-60"
        >
          {estado.fase === 'cargando' ? 'Consultando…' : 'Ejecutar petición'}
        </button>

        {estado.fase === 'inicial' && (
          <p className="text-sm text-stone-500">
            Pulsa el botón para llamar al backend.
          </p>
        )}

        {estado.fase === 'cargando' && (
          <p className="text-sm text-stone-600">Cargando respuesta…</p>
        )}

        {estado.fase === 'error' && (
          <div className="rounded-xl border border-rose-300 bg-rose-50 p-4">
            <p className="text-sm font-medium text-rose-900">{estado.mensaje}</p>
            {estado.detalle && (
              <p className="mt-2 text-xs text-rose-700">{estado.detalle}</p>
            )}
          </div>
        )}

        {estado.fase === 'ok' && (
          <div className="space-y-4">
            <p className="text-sm font-medium text-emerald-700">
              Respuesta recibida. Categorías: {estado.datos.length}
            </p>
            <ul className="space-y-2">
              {estado.datos.map((cat) => (
                <li
                  key={cat.id}
                  className="rounded-lg border border-stone-200 bg-white p-3 text-sm text-stone-700"
                >
                  <span className="font-semibold">#{cat.id} {cat.nombre}</span>
                  <span className="text-stone-500"> — subcategorías: {cat.subcategorias.length}</span>
                </li>
              ))}
            </ul>
            <details className="rounded-lg border border-stone-200 bg-white p-3">
              <summary className="cursor-pointer text-sm font-medium text-stone-700">
                Ver JSON crudo
              </summary>
              <pre className="mt-3 overflow-auto rounded bg-stone-900 p-3 text-xs text-stone-100">
                {JSON.stringify(estado.datos, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </main>
  )
}
