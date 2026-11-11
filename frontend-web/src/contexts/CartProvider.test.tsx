import { beforeEach, describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { CartProvider } from './CartProvider'
import { useCart } from '../hooks/useCart'
import type { CartProduct } from './CartContext'

function producto(
  over: Partial<Omit<CartProduct, 'cantidad'>> = {},
): Omit<CartProduct, 'cantidad'> {
  return {
    id: '1',
    nombre: 'Torta Jardín de Rosas',
    imagen: 'data:image/svg+xml;base64,',
    precioUnitario: 45,
    categoría: 'Repostería',
    stock: 3,
    ...over,
  }
}

/**
 * Sonda que expone el estado del carrito en el DOM y sus acciones como
 * botones: permite comprobar el comportamiento desde fuera del provider.
 */
function Sonda({ item }: { item: Omit<CartProduct, 'cantidad'> }) {
  const carrito = useCart()

  return (
    <div>
      <span data-testid="unidades">{carrito.totalItems}</span>
      <span data-testid="subtotal">{carrito.subtotal}</span>
      <span data-testid="total">{carrito.total}</span>
      <span data-testid="items">
        {carrito.items.map((i) => `${i.id}:${i.cantidad}`).join('|')}
      </span>
      <button type="button" onClick={() => carrito.addItem(item, 2)}>
        agregar
      </button>
      <button
        type="button"
        onClick={() => carrito.addItem({ ...item, stock: 0 }, 1)}
      >
        agregar sin stock
      </button>
      <button type="button" onClick={() => carrito.increaseQuantity(item.id)}>
        aumentar
      </button>
      <button type="button" onClick={() => carrito.decreaseQuantity(item.id)}>
        disminuir
      </button>
      <button type="button" onClick={() => carrito.removeItem(item.id)}>
        eliminar
      </button>
      <button type="button" onClick={() => carrito.clearCart()}>
        vaciar
      </button>
    </div>
  )
}

function montarCarrito(item = producto()) {
  return render(
    <CartProvider>
      <Sonda item={item} />
    </CartProvider>,
  )
}

function valorDe(pruebaId: string): string {
  return screen.getByTestId(pruebaId).textContent ?? ''
}

describe('CartProvider', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('no agrega productos sin stock', () => {
    montarCarrito()
    fireEvent.click(screen.getByText('agregar sin stock'))
    expect(valorDe('unidades')).toBe('0')
    expect(valorDe('subtotal')).toBe('0')
  })

  it('calcula subtotal, envio y total', () => {
    montarCarrito()
    fireEvent.click(screen.getByText('agregar'))
    expect(valorDe('unidades')).toBe('2')
    expect(valorDe('subtotal')).toBe('90')
    // 90 de productos + 5 de envio
    expect(valorDe('total')).toBe('95')
  })

  it('acumula el mismo producto sin superar el stock', () => {
    montarCarrito()
    fireEvent.click(screen.getByText('agregar'))
    fireEvent.click(screen.getByText('agregar'))
    expect(valorDe('unidades')).toBe('3')
    expect(valorDe('items')).toBe('1:3')
  })

  it('aumentar no pasa del stock y disminuir no baja de 1', () => {
    montarCarrito()
    fireEvent.click(screen.getByText('agregar'))
    fireEvent.click(screen.getByText('agregar'))
    fireEvent.click(screen.getByText('aumentar'))
    expect(valorDe('items')).toBe('1:3')
    fireEvent.click(screen.getByText('disminuir'))
    fireEvent.click(screen.getByText('disminuir'))
    fireEvent.click(screen.getByText('disminuir'))
    expect(valorDe('items')).toBe('1:1')
  })

  it('elimina y vacia el carrito', () => {
    montarCarrito()
    fireEvent.click(screen.getByText('agregar'))
    fireEvent.click(screen.getByText('eliminar'))
    expect(valorDe('unidades')).toBe('0')
    fireEvent.click(screen.getByText('agregar'))
    fireEvent.click(screen.getByText('vaciar'))
    expect(valorDe('unidades')).toBe('0')
    expect(valorDe('total')).toBe('0')
  })

  it('persiste el carrito y lo restaura al volver a montar', () => {
    const { unmount } = montarCarrito()
    fireEvent.click(screen.getByText('agregar'))
    unmount()

    montarCarrito()
    expect(valorDe('unidades')).toBe('2')
    expect(valorDe('subtotal')).toBe('90')
  })
})
