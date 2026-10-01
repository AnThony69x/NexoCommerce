import { useState, type ReactNode } from 'react'
import boxPlaceholder from '../assets/product-box-placeholder.svg'
import cakePlaceholder from '../assets/product-cake-placeholder.svg'
import { CartContext, type CartProduct } from './CartContext'

const initialProducts: CartProduct[] = [
  {
    id: 'torta-jardin-de-rosas',
    nombre: 'Torta Jardín de Rosas',
    imagen: cakePlaceholder,
    precioUnitario: 45,
    categoría: 'Repostería',
    cantidad: 1,
  },
  {
    id: 'caja-dulce-celebracion',
    nombre: 'Caja Dulce Celebración',
    imagen: boxPlaceholder,
    precioUnitario: 32,
    categoría: 'Detalles personalizados',
    cantidad: 1,
  },
]

export function CartProvider({ children }: { children: ReactNode }) {
  const [productos, setProductos] = useState(initialProducts)

  function agregarProducto(
    product: Omit<CartProduct, 'cantidad'>,
    cantidad: number,
  ) {
    const safeQuantity = Number.isFinite(cantidad)
      ? Math.max(1, Math.floor(cantidad))
      : 1

    setProductos((currentProducts) => {
      const existingProduct = currentProducts.some(
        (currentProduct) => currentProduct.id === product.id,
      )

      if (existingProduct) {
        return currentProducts.map((currentProduct) =>
          currentProduct.id === product.id
            ? {
                ...currentProduct,
                cantidad: currentProduct.cantidad + safeQuantity,
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
          ? { ...product, cantidad: product.cantidad + 1 }
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

  const totalUnidades = productos.reduce(
    (total, product) => total + product.cantidad,
    0,
  )
  const subtotal = productos.reduce(
    (total, product) => total + product.precioUnitario * product.cantidad,
    0,
  )

  return (
    <CartContext.Provider
      value={{
        productos,
        totalUnidades,
        subtotal,
        agregarProducto,
        aumentarCantidad,
        disminuirCantidad,
        eliminarProducto,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}
