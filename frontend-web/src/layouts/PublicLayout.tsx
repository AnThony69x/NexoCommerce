import { Outlet } from 'react-router-dom'
import FloatingCartButton from '../components/common/FloatingCartButton'
import Footer from '../components/common/Footer'
import Header from '../components/common/Header'

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-stone-50">
      <Header />

      <Outlet />

      <Footer />

      <FloatingCartButton />
    </div>
  )
}
