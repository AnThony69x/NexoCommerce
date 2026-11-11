import { useEffect, useState, type ReactNode } from 'react'
import { CartContext, type CartProduct } from './CartContext'
import { cargarCarrito, guardarCarrito } from '../storage/cartStore'
import { clampCantidad } from '../utils/validation'

export function CartProvider({ children }: { children: ReactNode }) {
  // Restaurada de localStorage al montar: recargar la página ya no vacía
  // el carrito.
  const [productos, setProductos] = useState<CartProduct[]>(() =>
    cargarCarrito(),
  )

  // Se persiste en cada cambio (agregar, cantidades, eliminar, vaciar).
  useEffect(() => {
    guardarCarrito(productos)
  }, [productos])

  function agregarProducto(
    product: Omit<CartProduct, 'cantidad'>,
    cantidad: number,
  ) {
    if (product.stock <= 0) return
    const safeQuantity = clampCantidad(cantidad, product.stock)
    if (safeQuantity < 1) return

    setProductos((currentProducts) => {
      const existingProduct = currentProducts.some(
        (currentProduct) => currentProduct.id === product.id,
      )

      if (existingProduct) {
        return currentProducts.map((currentProduct) =>
          currentProduct.id === product.id
            ? {
                ...currentProduct,
                cantidad: clampCantidad(
                  currentProduct.cantidad + safeQuantity,
                  currentProduct.stock,
                ),
              }
            : currentProduct,
        )
      }

      return [...currentProducts, { ...product, cantidad: safeQuantity }]
    })
  }

  function aumentarCantidad(id: string) {
    setProductos((currentProducts) =>
      currentProducts.map((product) =>
        product.id === id
          ? {
              ...product,
              cantidad: clampCantidad(product.cantidad + 1, product.stock),
            }
          : product,
      ),
    )
  }

  function disminuirCantidad(id: string) {
    setProductos((currentProducts) =>
      currentProducts.map((product) =>
        product.id === id
          ? { ...product, cantidad: Math.max(1, product.cantidad - 1) }
          : product,
      ),
    )
  }

  function eliminarProducto(id: string) {
    setProductos((currentProducts) =>
      currentProducts.filter((product) => product.id !== id),
    )
  }

  function vaciarCarrito() {
    setProductos([])
  }

  const totalUnidades = productos.reduce(
    (total, product) => total + product.cantidad,
    0,
  )
  const subtotal = productos.reduce(
    (total, product) => total + product.precioUnitario * product.cantidad,
    0,
  )
  const costoEnvio = productos.length > 0 ? 5 : 0
  const total = subtotal + costoEnvio

  return (
    <CartContext.Provider
      value={{
        productos,
        totalUnidades,
        subtotal,
        costoEnvio,
        total,
        agregarProducto,
        aumentarCantidad,
        disminuirCantidad,
        eliminarProducto,
        vaciarCarrito,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}
