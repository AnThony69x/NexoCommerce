/**
 * Formato de precio en dolares: "$1,234.56".
 * Usa separador de miles para que los importes altos se lean bien.
 */
export function formatPrice(valor: number): string {
  return `$${valor.toLocaleString('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}
