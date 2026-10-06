import AppRouter from './routes/AppRouter'
import { AuthProvider } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartProvider'

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppRouter />
      </CartProvider>
    </AuthProvider>
  )
}