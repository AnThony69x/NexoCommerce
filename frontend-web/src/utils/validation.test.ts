import { describe, expect, it } from 'vitest'
import {
  DIAS_ANTICIPACION_ENTREGA,
  MENSAJE_FECHA_ANTICIPACION,
  clampCantidad,
  getMinimumDeliveryDate,
  hayStock,
  validarFechaEntrega,
} from './validation'

describe('clampCantidad', () => {
  it('devuelve 0 cuando no hay stock', () => {
    expect(clampCantidad(3, 0)).toBe(0)
    expect(clampCantidad(3, -1)).toBe(0)
  })

  it('nunca baja de 1 y siempre es un entero', () => {
    expect(clampCantidad(0)).toBe(1)
    expect(clampCantidad(-4)).toBe(1)
    expect(clampCantidad(2.9)).toBe(2)
  })

  it('respeta el stock disponible', () => {
    expect(clampCantidad(10, 4)).toBe(4)
    expect(clampCantidad(2, 4)).toBe(2)
  })

  it('normaliza valores no numericos', () => {
    expect(clampCantidad(Number.NaN)).toBe(1)
    expect(clampCantidad(Number.POSITIVE_INFINITY)).toBe(1)
  })
})

describe('validarFechaEntrega', () => {
  it('exige una fecha', () => {
    expect(validarFechaEntrega('')).toBe(
      'La fecha de entrega es obligatoria.',
    )
  })

  it('rechaza fechas imposibles', () => {
    expect(validarFechaEntrega('2026-13-45')).toBe('Ingresa una fecha válida.')
    expect(validarFechaEntrega('no-es-fecha')).toBe('Ingresa una fecha válida.')
  })

  it('exige la anticipacion minima', () => {
    const minima = getMinimumDeliveryDate()
    expect(validarFechaEntrega(minima)).toBe(true)
    expect(validarFechaEntrega('2020-01-01')).toBe(MENSAJE_FECHA_ANTICIPACION)
  })

  it('calcula la fecha minima con los dias de anticipacion', () => {
    const desde = new Date(2026, 0, 10)
    const esperada = new Date(2026, 0, 10 + DIAS_ANTICIPACION_ENTREGA)
    const iso = `${esperada.getFullYear()}-${`${esperada.getMonth() + 1}`.padStart(2, '0')}-${`${esperada.getDate()}`.padStart(2, '0')}`
    expect(getMinimumDeliveryDate(desde)).toBe(iso)
  })
})

describe('hayStock', () => {
  it('trata undefined como agotado', () => {
    expect(hayStock(undefined)).toBe(false)
    expect(hayStock(0)).toBe(false)
    expect(hayStock(1)).toBe(true)
  })
})
