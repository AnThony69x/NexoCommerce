import { BrowserRouter, Route, Routes } from 'react-router-dom'
import CartPage from '../pages/cart/CartPage'
import BakeryPage from '../pages/bakery/BakeryPage'
import CatalogPage from '../pages/catalog/CatalogPage'
import CheckoutPage from '../pages/checkout/CheckoutPage'
import DetailsPage from '../pages/details/DetailsPage'
import FloatingCartButton from '../components/common/FloatingCartButton'
import ProductDetailPage from '../pages/catalog/ProductDetailPage'
import HomePage from '../pages/home/HomePage'
import LoginPage from '../pages/auth/LoginPage'
import RegisterPage from '../pages/auth/RegisterPage'
import SublimationPage from '../pages/sublimation/SublimationPage'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<RegisterPage />} />
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
