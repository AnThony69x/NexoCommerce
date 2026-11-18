import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
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

const usuario = { id: 1 }
vi.mock('../hooks/useAuth', () => ({ useAuth: () => ({ user: usuario }) }))
let cantidadRemota = 0

function snapshot() {
  const subtotal = cantidadRemota * 45
  return {
    productos: cantidadRemota ? [{ ...producto(), cantidad: cantidadRemota }] : [],
    subtotal,
    total: subtotal + (cantidadRemota ? 5 : 0),
  }
}

vi.mock('../services/cartService', () => ({
  obtenerCarrito: async () => snapshot(),
  agregarAlCarrito: async (_id: number, cantidad: number) => {
    if (cantidad === 1) throw new Error('Sin stock')
    cantidadRemota = Math.min(cantidadRemota + cantidad, 3)
    return snapshot()
  },
  actualizarCantidadCarrito: async (_id: string, cantidad: number) => {
    cantidadRemota = Math.min(cantidad, 3)
    return snapshot()
  },
  eliminarDelCarrito: async () => { cantidadRemota = 0; return snapshot() },
  vaciarCarritoRemoto: async () => { cantidadRemota = 0; return snapshot() },
}))

async function pulsar(nombre: string) {
  await act(async () => { fireEvent.click(screen.getByText(nombre)) })
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
    <CartProvider><Sonda item={item} /></CartProvider>,
  )
}

function valorDe(pruebaId: string): string {
  return screen.getByTestId(pruebaId).textContent ?? ''
}

describe('CartProvider', () => {
  beforeEach(() => {
    cantidadRemota = 0
  })

  it('no agrega productos sin stock', async () => {
    montarCarrito()
    await pulsar('agregar sin stock')
    expect(valorDe('unidades')).toBe('0')
    expect(valorDe('subtotal')).toBe('0')
  })

  it('calcula subtotal, envio y total', async () => {
    montarCarrito()
    await pulsar('agregar')
    expect(valorDe('unidades')).toBe('2')
    expect(valorDe('subtotal')).toBe('90')
    // 90 de productos + 5 de envio
    expect(valorDe('total')).toBe('95')
  })

  it('acumula el mismo producto sin superar el stock', async () => {
    montarCarrito()
    await pulsar('agregar')
    await pulsar('agregar')
    expect(valorDe('unidades')).toBe('3')
    expect(valorDe('items')).toBe('1:3')
  })

  it('aumentar no pasa del stock y disminuir no baja de 1', async () => {
    montarCarrito()
    await pulsar('agregar')
    await pulsar('agregar')
    await pulsar('aumentar')
    expect(valorDe('items')).toBe('1:3')
    await pulsar('disminuir')
    await pulsar('disminuir')
    await pulsar('disminuir')
    expect(valorDe('items')).toBe('1:1')
  })

  it('elimina y vacia el carrito', async () => {
    montarCarrito()
    await pulsar('agregar')
    await pulsar('eliminar')
    expect(valorDe('unidades')).toBe('0')
    await pulsar('agregar')
    await pulsar('vaciar')
    expect(valorDe('unidades')).toBe('0')
    expect(valorDe('total')).toBe('0')
  })

  it('vuelve a cargar el carrito remoto al montar', async () => {
    const { unmount } = montarCarrito()
    await pulsar('agregar')
    unmount()

    montarCarrito()
    await waitFor(() => expect(valorDe('unidades')).toBe('2'))
    expect(valorDe('subtotal')).toBe('90')
  })
})
