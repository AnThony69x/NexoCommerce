import { Suspense, lazy, useEffect } from 'react'
import { BrowserRouter, Route, Routes, Link, useLocation } from 'react-router-dom'
import { marcarEntradaInicial } from '../utils/historialSpa'
import CargandoPagina from '../components/common/CargandoPagina'
import AdminEmptyState from '../components/admin/AdminEmptyState'
import AdminRoute from '../components/auth/AdminRoute'
import ProtectedRoute from '../components/auth/ProtectedRoute'
import PublicLayout from '../layouts/PublicLayout'

/**
 * Carga diferida de paginas: el bundle inicial solo trae lo necesario para
 * pintar la primera pantalla y cada seccion (catalogo, cuenta, panel admin)
 * baja su propio archivo al visitarla. Los guards y los layouts se quedan
 * en el bundle inicial porque hacen falta en el primer render.
 */
const HomePage = lazy(() => import('../pages/home/HomePage'))
const CatalogPage = lazy(() => import('../pages/catalog/CatalogPage'))
const ProductDetailPage = lazy(() => import('../pages/catalog/ProductDetailPage'))
const BakeryPage = lazy(() => import('../pages/bakery/BakeryPage'))
const DetailsPage = lazy(() => import('../pages/details/DetailsPage'))
const SublimationPage = lazy(() => import('../pages/sublimation/SublimationPage'))
const CartPage = lazy(() => import('../pages/cart/CartPage'))
const CheckoutPage = lazy(() => import('../pages/checkout/CheckoutPage'))
const LoginPage = lazy(() => import('../pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage'))
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'))
const PerfilPage = lazy(() => import('../pages/perfil/PerfilPage'))
const MisPedidosPage = lazy(() => import('../pages/orders/MisPedidosPage'))
const MiPedidoDetallePage = lazy(() => import('../pages/orders/MiPedidoDetallePage'))
const NotificacionesPage = lazy(() => import('../pages/notifications/NotificacionesPage'))
/** Area admin: trae el layout y los mocks administrativos en un solo trozo. */
const AdminArea = lazy(() => import('../layouts/AdminArea'))
const AdminDashboardPage = lazy(() => import('../pages/admin/AdminDashboardPage'))
const AdminProductsPage = lazy(() => import('../pages/admin/AdminProductsPage'))
const AdminCategoriesPage = lazy(() => import('../pages/admin/AdminCategoriesPage'))
const AdminOrdersPage = lazy(() => import('../pages/admin/AdminOrdersPage'))
const AdminOrderDetailPage = lazy(() => import('../pages/admin/AdminOrderDetailPage'))
const AdminPaymentsPage = lazy(() => import('../pages/admin/AdminPaymentsPage'))
const AdminUsersPage = lazy(() => import('../pages/admin/AdminUsersPage'))
const AdminPublicationsPage = lazy(() => import('../pages/admin/AdminPublicationsPage'))
const AdminMediaPage = lazy(() => import('../pages/admin/AdminMediaPage'))
const AdminProductionPage = lazy(() => import('../pages/admin/AdminProductionPage'))
const AdminStoreConfigPage = lazy(() => import('../pages/admin/AdminStoreConfigPage'))

/**
 * Título legible por ruta: se usa en document.title (y lo anuncian los
 * lectores de pantalla al cambiar de página).
 */
const TITULOS_POR_RUTA: Record<string, string> = {
  '/': 'Inicio',
  '/catalogo': 'Catálogo',
  '/reposteria': 'Repostería',
  '/detalles': 'Detalles personalizados',
  '/sublimacion': 'Sublimación',
  '/login': 'Iniciar sesión',
  '/registro': 'Crear cuenta',
  '/carrito': 'Carrito de compras',
  '/checkout': 'Finalizar compra',
  '/perfil': 'Mi perfil',
  '/pedidos': 'Mis pedidos',
  '/notificaciones': 'Notificaciones',
  '/admin': 'Panel de administración',
}

function tituloDeRuta(pathname: string): string {
  if (TITULOS_POR_RUTA[pathname]) return TITULOS_POR_RUTA[pathname]
  if (pathname.startsWith('/productos/')) return 'Detalle del producto'
  if (pathname.startsWith('/pedidos/')) return 'Detalle del pedido'
  if (pathname.startsWith('/admin/')) return 'Administración'
  return 'Dulces Aesca'
}

/**
 * Actualiza el título del documento y vuelve al inicio del scroll al cambiar
 * de ruta (antes se conservaba la posición de la página anterior).
 */
function TituloYPosicion() {
  const location = useLocation()

  useEffect(() => {
    document.title = `${tituloDeRuta(location.pathname)} · Dulces Aesca`
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [location.pathname])

  return null
}

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
      <TituloYPosicion />
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
          <Route
            path="/admin"
            element={
              <Suspense fallback={<CargandoPagina />}>
                <AdminArea />
              </Suspense>
            }
          >
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
