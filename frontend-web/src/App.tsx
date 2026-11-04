import AppRouter from './routes/AppRouter'
import { AdminMockProvider } from './contexts/AdminMockContext'
import { AuthProvider } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartProvider'

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AdminMockProvider>
          <AppRouter />
        </AdminMockProvider>
      </CartProvider>
    </AuthProvider>
  )
}
