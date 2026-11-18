import { useSearchParams } from 'react-router-dom'

export function useAdminQueryFilter(parametro: string, opciones: readonly string[], valorInicial: string) {
  const [params, setParams] = useSearchParams()
  const actual = params.get(parametro)
  const valor = actual !== null && opciones.includes(actual) ? actual : valorInicial

  function cambiar(valorNuevo: string) {
    setParams((previos) => {
      const siguientes = new URLSearchParams(previos)
      if (opciones.includes(valorNuevo)) siguientes.set(parametro, valorNuevo)
      else siguientes.delete(parametro)
      return siguientes
    })
  }

  return [valor, cambiar] as const
}
