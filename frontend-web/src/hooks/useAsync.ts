import { useCallback, useEffect, useState } from 'react'

type UseAsyncResult<T> = {
  data: T | null
  loading: boolean
  error: string | null
  recargar: () => void
}

/**
 * Ejecuta una operación async (típicamente un service) con estados
 * de carga/error y reintento. Misma forma para mocks y API real.
 */
export function useAsync<T>(operacion: () => Promise<T>, deps: unknown[] = []): UseAsyncResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [intentos, setIntentos] = useState(0)

  const recargar = useCallback(() => {
    setLoading(true)
    setError(null)
    setIntentos((actual) => actual + 1)
  }, [])

  useEffect(() => {
    let cancelado = false

    operacion()
      .then((resultado) => {
        if (!cancelado) {
          setData(resultado)
          setLoading(false)
        }
      })
      .catch((falla: unknown) => {
        if (!cancelado) {
          setError(
            falla instanceof Error ? falla.message : 'Ocurrió un error inesperado.',
          )
          setLoading(false)
        }
      })

    return () => {
      cancelado = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, intentos])

  return { data, loading, error, recargar }
}
