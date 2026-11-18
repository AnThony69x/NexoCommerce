import { apiClient } from './api'
import type { ApiEnvelope } from '../types/api'

type MultimediaCreadaApi = { id: number }
type DisenoPersonalizadoApi = { id: number }

/** Sube la referencia del cliente y la registra para una sublimación propia. */
export async function crearDisenoPersonalizado(
  productoId: number,
  archivo: File,
  indicaciones: string,
): Promise<number> {
  const formulario = new FormData()
  formulario.append('archivo', archivo)
  formulario.append('destino', 'personalizaciones')

  const subida = await apiClient.post<ApiEnvelope<MultimediaCreadaApi>>('/multimedia', formulario)
  const multimediaId = Number(subida.data.data.id)

  try {
    const respuesta = await apiClient.post<ApiEnvelope<DisenoPersonalizadoApi>>('/disenos-personalizados', {
      sublimacion_id: productoId,
      multimedia_id: multimediaId,
      indicaciones: indicaciones.trim() || undefined,
    })
    return Number(respuesta.data.data.id)
  } catch (error) {
    // Evita dejar un archivo huérfano si la creación del diseño falla.
    try {
      await apiClient.delete(`/multimedia/${multimediaId}`)
    } catch {
      // Se conserva el error original del endpoint de diseños.
    }
    throw error
  }
}
