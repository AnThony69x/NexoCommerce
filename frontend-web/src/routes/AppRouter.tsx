import { useEffect } from 'react'
import { BrowserRouter, Route, Routes, Link, useLocation } from 'react-router-dom'
import { marcarEntradaInicial } from '../utils/historialSpa'
import CartPage from '../pages/cart/CartPage'
import BakeryPage from '../pages/bakery/BakeryPage'
import CatalogPage from '../pages/catalog/CatalogPage'
import CheckoutPage from '../pages/checkout/CheckoutPage'
import DetailsPage from '../pages/details/DetailsPage'
import ProductDetailPage from '../pages/catalog/ProductDetailPage'
import HomePage from '../pages/home/HomePage'
import LoginPage from '../pages/auth/LoginPage'
import RegisterPage from '../pages/auth/RegisterPage'
import NotFoundPage from '../pages/NotFoundPage'
import PerfilPage from '../pages/perfil/PerfilPage'
import MisPedidosPage from '../pages/orders/MisPedidosPage'
import MiPedidoDetallePage from '../pages/orders/MiPedidoDetallePage'
import NotificacionesPage from '../pages/notifications/NotificacionesPage'
import SublimationPage from '../pages/sublimation/SublimationPage'
import AdminEmptyState from '../components/admin/AdminEmptyState'
import AdminRoute from '../components/auth/AdminRoute'
import ProtectedRoute from '../components/auth/ProtectedRoute'
import AdminLayout from '../layouts/AdminLayout'
import PublicLayout from '../layouts/PublicLayout'
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

/**
 * Registra la primera entrada del historial (idempotente) para que Volver
 * sepa cuándo navigate(-1) es seguro. Debe vivir dentro del Router.
 */
function RegistrarEntradaInicial() {
  const location = useLocation()

  useEffect(() => {
    marcarEntradaInicial(location.key)
  }, [location.key])

  return null
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <RegistrarEntradaInicial />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registro" element={<RegisterPage />} />
          <Route path="/catalogo" element={<CatalogPage />} />
          <Route path="/reposteria" element={<BakeryPage />} />
          <Route path="/detalles" element={<DetailsPage />} />
          <Route path="/sublimacion" element={<SublimationPage />} />
          <Route path="/productos/:id" element={<ProductDetailPage />} />
          <Route path="/carrito" element={<CartPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/perfil" element={<PerfilPage />} />
            <Route path="/pedidos" element={<MisPedidosPage />} />
            <Route path="/pedidos/:id" element={<MiPedidoDetallePage />} />
            <Route path="/notificaciones" element={<NotificacionesPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Route>

        <Route element={<AdminRoute />}>
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
            <Route
              path="*"
              element={
                <AdminEmptyState
                  titulo="Página no encontrada"
                  descripcion="La ruta administrativa no existe (404)."
                  accion={
                    <Link
                      to="/admin"
                      className="inline-flex min-h-10 items-center rounded-lg bg-stone-800 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700"
                    >
                      Volver al panel
                    </Link>
                  }
                />
              }
            />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
