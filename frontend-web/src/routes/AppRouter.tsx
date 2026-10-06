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
import AdminLayout from '../layouts/AdminLayout'
import AdminDashboardPage from '../pages/admin/AdminDashboardPage'
import AdminProductsPage from '../pages/admin/AdminProductsPage'
import AdminCategoriesPage from '../pages/admin/AdminCategoriesPage'
import AdminOrdersPage from '../pages/admin/AdminOrdersPage'
import AdminOrderDetailPage from '../pages/admin/AdminOrderDetailPage'
import AdminPaymentsPage from '../pages/admin/AdminPaymentsPage'
import AdminUsersPage from '../pages/admin/AdminUsersPage'
import AdminPublicationsPage from '../pages/admin/AdminPublicationsPage'
import AdminMediaPage from '../pages/admin/AdminMediaPage'
import AdminProductionPage from '../pages/admin/AdminProductionPage'
import AdminStoreConfigPage from '../pages/admin/AdminStoreConfigPage'

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

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="productos" element={<AdminProductsPage />} />
          <Route path="categorias" element={<AdminCategoriesPage />} />
          <Route path="pedidos" element={<AdminOrdersPage />} />
          <Route path="pedidos/:id" element={<AdminOrderDetailPage />} />
          <Route path="pagos" element={<AdminPaymentsPage />} />
          <Route path="usuarios" element={<AdminUsersPage />} />
          <Route path="publicaciones" element={<AdminPublicationsPage />} />
          <Route path="multimedia" element={<AdminMediaPage />} />
          <Route path="produccion" element={<AdminProductionPage />} />
          <Route path="configuracion" element={<AdminStoreConfigPage />} />
        </Route>
      </Routes>
      <FloatingCartButton />
    </BrowserRouter>
  )
}
