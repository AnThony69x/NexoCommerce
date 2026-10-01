import AppRouter from './routes/AppRouter'
import { CartProvider } from './contexts/CartProvider'

export default function App() {
  return (
    <CartProvider>
      <AppRouter />
    </CartProvider>
  )
}