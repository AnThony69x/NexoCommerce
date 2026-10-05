import { BrowserRouter, Route, Routes } from 'react-router-dom'
import CartPage from '../pages/cart/CartPage'
import BakeryPage from '../pages/bakery/BakeryPage'
import CatalogPage from '../pages/catalog/CatalogPage'
import CheckoutPage from '../pages/checkout/CheckoutPage'
import DetailsPage from '../pages/details/DetailsPage'
import FloatingCartButton from '../components/common/FloatingCartButton'
import ProductDetailPage from '../pages/catalog/ProductDetailPage'
import HomePage from '../pages/home/HomePage'
import SublimationPage from '../pages/sublimation/SublimationPage'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<p>Login</p>} />
        <Route path="/registro" element={<p>Registro</p>} />
        <Route path="/catalogo" element={<CatalogPage />} />
        <Route path="/reposteria" element={<BakeryPage />} />
        <Route path="/detalles" element={<DetailsPage />} />
        <Route path="/sublimacion" element={<SublimationPage />} />
        <Route path="/productos/:id" element={<ProductDetailPage />} />
        <Route path="/carrito" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/admin" element={<p>Admin</p>} />
      </Routes>
      <FloatingCartButton />
    </BrowserRouter>
  )
}
