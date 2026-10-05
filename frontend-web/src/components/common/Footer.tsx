import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-stone-900 px-4 py-10 text-stone-200 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 sm:grid-cols-2 lg:grid-cols-5">
        {/* Dulces Aesca */}
        <div>
          <Link to="/" className="text-lg font-semibold text-white">
            Dulces Aesca
          </Link>

          <p className="mt-3 text-sm leading-6 text-stone-400">
            Detalles dulces y personalizados para celebrar los momentos que
            importan.
          </p>
        </div>

        {/* Colaboradores */}
        <div>
          <h2 className="text-sm font-semibold text-white">
            Colaboradores
          </h2>

          <ul className="mt-3 space-y-1 text-sm leading-6 text-stone-400">
            <li>Emilio Cardenas</li>
            <li>Nathalia Angulo</li>
            <li>Melenie Pérez</li>
            <li>Anthony Mejia</li>
            <li>Michael Intriago</li>
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-white">
            Contacto
          </h2>

          <div className="mt-3 space-y-2 text-sm leading-6 text-stone-400">
            <p>contacto@dulcesaesca.com</p>
            <p>+00 000 000 000</p>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-white">
            Enlaces
          </h2>

          <nav
            className="mt-3"
            aria-label="Enlaces del pie de página"
          >
            <ul className="space-y-2 text-sm text-stone-400">
              <li>
                <Link
                  to="/"
                  className="transition-colors hover:text-white"
                >
                  Inicio
                </Link>
              </li>

              <li>
                <Link
                  to="/catalogo"
                  className="transition-colors hover:text-white"
                >
                  Catálogo
                </Link>
              </li>

              <li>
                <Link
                  to="/reposteria"
                  className="transition-colors hover:text-white"
                >
                  Repostería
                </Link>
              </li>

              <li>
                <Link
                  to="/detalles"
                  className="transition-colors hover:text-white"
                >
                  Detalles
                </Link>
              </li>

              <li>
                <Link
                  to="/sublimacion"
                  className="transition-colors hover:text-white"
                >
                  Sublimación
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        

        {/* Redes */}
        <div>
          <h2 className="text-sm font-semibold text-white">
            Redes
          </h2>

          <ul className="mt-3 space-y-2 text-sm text-stone-400">
            <li>
              <a
                href="#"
                className="transition-colors hover:text-white"
              >
                Instagram
              </a>
            </li>

            <li>
              <a
                href="#"
                className="transition-colors hover:text-white"
              >
                Facebook
              </a>
            </li>

            <li>
              <a
                href="#"
                className="transition-colors hover:text-white"
              >
                WhatsApp
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <div className="mx-auto mt-10 max-w-7xl border-t border-stone-700 pt-5 text-center text-xs text-stone-500">
        © 2026 Dulces Aesca. Todos los derechos reservados.
      </div>
    </footer>
  )
}