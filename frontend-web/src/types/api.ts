/**
 * Formas del contrato HTTP del backend (/api/v1).
 * Convención: el backend habla snake_case y envuelve todo en { success, data, meta }.
 * Los services mapean estas formas a los tipos UI de src/types.
 */

export interface ApiEnvelope<T> {
  success: boolean
  data: T
  message?: string
}

/** meta de respuesta paginada del backend (p. ej. GET /productos). */
export interface ApiMetaPaginacion {
  pagina_actual: number
  por_pagina: number
  total: number
  total_paginas: number
}

export interface ApiEnvelopePaginado<T> {
  success: boolean
  data: T[]
  meta: ApiMetaPaginacion
}

export interface ApiErrorForma {
  success: false
  message: string
  errors?: Record<string, string[]>
  /** Código de negocio del backend en errores 400 (spec: PED_PRECIO_CAMBIADO, CAR_SIN_STOCK, …). */
  codigo_error?: string
}

export class ApiError extends Error {
  status: number
  errors?: Record<string, string[]>
  /** Copia de ApiErrorForma.codigo_error para control de flujo en la UI. */
  codigoError?: string

  constructor(
    status: number,
    message: string,
    errors?: Record<string, string[]>,
    codigoError?: string,
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
    this.codigoError = codigoError
  }
}

export type PaginacionParams = {
  pagina?: number
  porPagina?: number
  buscar?: string
}
