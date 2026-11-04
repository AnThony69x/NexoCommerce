import boxPlaceholder from '../assets/product-box-placeholder.svg'
import cakePlaceholder from '../assets/product-cake-placeholder.svg'
import dessertPlaceholder from '../assets/product-dessert-placeholder.svg'
import mugPlaceholder from '../assets/product-mug-placeholder.svg'

const mapaAssets: Record<string, string> = {
  'product-box-placeholder.svg': boxPlaceholder,
  'product-cake-placeholder.svg': cakePlaceholder,
  'product-dessert-placeholder.svg': dessertPlaceholder,
  'product-mug-placeholder.svg': mugPlaceholder,
}

/**
 * Resuelve una referencia de multimedia mock a una URL mostrable.
 * Acepta blob:, http(s):, data: y rutas absolutas; mapea los nombres
 * de placeholder a los assets locales. Devuelve null si no es mostrable
 * (p. ej. PDFs o textos mock). Al conectar el backend, aquí se antepondrá
 * la base del servidor de archivos a `ruta_archivo`.
 */
export function resolverUrlMultimedia(url: string): string | null {
  const ref = url.trim()
  if (
    ref.startsWith('blob:') ||
    ref.startsWith('http://') ||
    ref.startsWith('https://') ||
    ref.startsWith('data:') ||
    ref.startsWith('/')
  ) {
    return ref
  }
  return mapaAssets[ref] ?? null
}

/** Límite de imágenes de referencia por producto (mock). */
export const MAX_IMAGENES_PRODUCTO = 4
