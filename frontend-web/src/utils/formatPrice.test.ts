import { describe, expect, it } from 'vitest'
import { formatPrice } from './formatPrice'

describe('formatPrice', () => {
  it('muestra dos decimales', () => {
    expect(formatPrice(0)).toBe('$0.00')
    expect(formatPrice(45)).toBe('$45.00')
    expect(formatPrice(45.5)).toBe('$45.50')
  })

  it('agrupa los miles', () => {
    expect(formatPrice(1234.5)).toBe('$1,234.50')
    expect(formatPrice(1234567.891)).toBe('$1,234,567.89')
  })
})
