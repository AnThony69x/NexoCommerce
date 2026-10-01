import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-stone-900 px-4 py-10 text-stone-200 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link to="/" className="text-lg font-semibold text-white">
            Dulces Aesca
          </Link>
          <p className="mt-3 max-w-xs text-sm leading-6 text-stone-400">
            Detalles dulces y personalizados para celebrar los momentos que
            importan.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-white">Enlaces</h2>
          <nav className="mt-3" aria-label="Enlaces del pie de página">
            <ul className="space-y-2 text-sm text-stone-400">
              <li>
                <Link to="/" className="hover:text-white">
                  Inicio
                </Link>
              </li>
              <li>
                <Link to="/catalogo" className="hover:text-white">
                  Catálogo
                </Link>
              </li>
              <li>
                <Link to="/reposteria" className="hover:text-white">
                  Repostería
                </Link>
              </li>
              <li>
                <Link
                  to="/detalles"
                  className="hover:text-white"
                >
                  Detalles
                </Link>
              </li>
              <li>
                <Link to="/sublimacion" className="hover:text-white">
                  Sublimación
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-white">Contacto</h2>
          <p className="mt-3 text-sm leading-6 text-stone-400">
            contacto@dulcesaesca.com
            <br />
            +00 000 000 000
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-white">Redes</h2>
          <p className="mt-3 text-sm leading-6 text-stone-400">
            Instagram · Facebook · WhatsApp
          </p>
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-6xl border-t border-stone-700 pt-5 text-xs text-stone-500">
        © 2026 Dulces Aesca. Todos los derechos reservados.
      </div>
    </footer>
  )
}
