/**
 * Reglas de validación reutilizables (mock, coherentes con el negocio).
 * Fuente única para formularios con React Hook Form. El backend deberá
 * reimplementar obligatoriamente estas mismas reglas del lado servidor.
 */

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const TELEFONO_PATTERN = /^[+\d][\d\s().-]{6,19}$/

export const PASSWORD_MINIMO = 8

/** Días mínimos de anticipación para la fecha de entrega. */
export const DIAS_ANTICIPACION_ENTREGA = 3

export const MENSAJE_FECHA_ANTICIPACION =
  'Los pedidos deben realizarse con mínimo 3 días de anticipación.'

export function reglaCorreoRequerido() {
  return {
    required: 'El correo es obligatorio.',
    pattern: { value: EMAIL_PATTERN, message: 'Ingresa un correo válido.' },
  }
}

export function reglaPasswordRegistro() {
  return {
    required: 'La contraseña es obligatoria.',
    minLength: {
      value: PASSWORD_MINIMO,
      message: `Debe tener al menos ${PASSWORD_MINIMO} caracteres.`,
    },
  }
}

/** En login no se exige longitud: la decide el servidor con sus credenciales. */
export function reglaPasswordLogin() {
  return { required: 'La contraseña es obligatoria.' }
}

export function reglaTelefono() {
  return {
    required: 'El teléfono es obligatorio.',
    pattern: { value: TELEFONO_PATTERN, message: 'Ingresa un teléfono válido.' },
  }
}

function aFechaLocal(valor: string): Date | null {
  const partes = valor.split('-')
  if (partes.length !== 3) return null
  const [anio, mes, dia] = partes.map(Number)
  if (
    !Number.isInteger(anio) ||
    !Number.isInteger(mes) ||
    !Number.isInteger(dia)
  ) {
    return null
  }
  const fecha = new Date(anio, mes - 1, dia)
  if (
    fecha.getFullYear() !== anio ||
    fecha.getMonth() !== mes - 1 ||
    fecha.getDate() !== dia
  ) {
    return null
  }
  return fecha
}

function aISOFechaLocal(fecha: Date): string {
  const mes = `${fecha.getMonth() + 1}`.padStart(2, '0')
  const dia = `${fecha.getDate()}`.padStart(2, '0')
  return `${fecha.getFullYear()}-${mes}-${dia}`
}

/** Fecha mínima de entrega (yyyy-mm-dd) calculada dinámicamente: hoy + 3 días. */
export function getMinimumDeliveryDate(desde: Date = new Date()): string {
  const minima = new Date(
    desde.getFullYear(),
    desde.getMonth(),
    desde.getDate() + DIAS_ANTICIPACION_ENTREGA,
  )
  return aISOFechaLocal(minima)
}

/** Validador para React Hook Form: true si es válida, mensaje si no. */
export function validarFechaEntrega(valor: string): true | string {
  if (!valor) return 'La fecha de entrega es obligatoria.'
  const fecha = aFechaLocal(valor)
  if (!fecha) return 'Ingresa una fecha válida.'
  return aISOFechaLocal(fecha) >= getMinimumDeliveryDate()
    ? true
    : MENSAJE_FECHA_ANTICIPACION
}

/** Cantidad segura: mínimo 1; si hay stock, lo respeta (0 = agotado). */
export function clampCantidad(cantidad: number, stock?: number): number {
  const segura = Number.isFinite(cantidad) ? Math.floor(cantidad) : 1
  if (stock !== undefined && stock <= 0) return 0
  const conMinimo = Math.max(1, segura)
  return stock === undefined ? conMinimo : Math.min(conMinimo, stock)
}

export function hayStock(stock: number | undefined): boolean {
  return (stock ?? 0) > 0
}
