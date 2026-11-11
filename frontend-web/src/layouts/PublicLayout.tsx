import { Outlet } from 'react-router-dom'
import FloatingCartButton from '../components/common/FloatingCartButton'
import Footer from '../components/common/Footer'
import Header from '../components/common/Header'

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-stone-50">
      {/* Skip link: permite saltar el header con el teclado. */}
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-stone-800 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
      >
        Saltar al contenido
      </a>

      <Header />

      <div id="contenido" tabIndex={-1} className="outline-none">
        <Outlet />
      </div>

      <Footer />

      <FloatingCartButton />
    </div>
  )
}
