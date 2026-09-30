import { BrowserRouter, Route, Routes } from 'react-router-dom'
import CartPage from '../pages/cart/CartPage'
import CatalogPage from '../pages/catalog/CatalogPage'
import CheckoutPage from '../pages/checkout/CheckoutPage'
import ProductDetailPage from '../pages/catalog/ProductDetailPage'
import HomePage from '../pages/home/HomePage'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<p>Login</p>} />
        <Route path="/registro" element={<p>Registro</p>} />
        <Route path="/catalogo" element={<CatalogPage />} />
        <Route path="/productos/:id" element={<ProductDetailPage />} />
        <Route path="/carrito" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/admin" element={<p>Admin</p>} />
      </Routes>
    </BrowserRouter>
  )
}
