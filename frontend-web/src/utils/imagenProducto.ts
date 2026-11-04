import boxPlaceholder from '../assets/product-box-placeholder.svg'

/**
 * URL de imagen de un producto para renderizar en UI. Si el origen (mock o
 * backend) no informa imagen, devuelve un placeholder local: la UI nunca
 * debe renderizar un src vacío.
 */
export function imagenProducto(url: string | null | undefined): string {
  return url ?? boxPlaceholder
}
