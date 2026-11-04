import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-brown px-4 py-12 text-stone-300 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 sm:grid-cols-2 lg:grid-cols-5">
        {/* Marca */}
        <div>
          <Link to="/" className="font-display text-xl font-semibold text-white">
            Dulces Aesca
          </Link>
          <p className="mt-3 max-w-xs text-sm leading-6 text-stone-400">
            Repostería artesanal, regalos personalizados y detalles hechos para
            celebrar lo que importa.
          </p>
        </div>

        {/* Comprar */}
        <div>
          <h2 className="text-sm font-semibold text-white">Comprar</h2>
          <ul className="mt-3 space-y-2 text-sm text-stone-400">
            <li>
              <Link to="/catalogo" className="transition-colors hover:text-white">
                Tienda
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
              <Link to="/detalles" className="transition-colors hover:text-white">
                Detalles personalizados
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
        </div>

        {/* Ayuda */}
        <div>
          <h2 className="text-sm font-semibold text-white">Ayuda</h2>
          <ul className="mt-3 space-y-2 text-sm text-stone-400">
            <li>Envíos y entregas</li>
            <li>Preguntas frecuentes</li>
            <li>
              <a
                href="mailto:contacto@dulcesaesca.com"
                className="transition-colors hover:text-white"
              >
                Contacto
              </a>
            </li>
          </ul>
        </div>

        {/* Tiendas */}
        <div>
          <h2 className="text-sm font-semibold text-white">Tiendas</h2>
          <div className="mt-3 space-y-2 text-sm leading-6 text-stone-400">
            <p>Lunes a viernes: 9:00 – 18:00</p>
            <p>Sábados: 10:00 – 14:00</p>
            <p>
              <a
                href="tel:+00000000000"
                className="transition-colors hover:text-white"
              >
                +00 000 000 000
              </a>
            </p>
            <p>
              <a
                href="mailto:contacto@dulcesaesca.com"
                className="transition-colors hover:text-white"
              >
                contacto@dulcesaesca.com
              </a>
            </p>
          </div>
        </div>

        {/* Colaboradores */}
        <div>
          <h2 className="text-sm font-semibold text-white">Colaboradores</h2>
          <ul className="mt-3 space-y-1 text-sm leading-6 text-stone-400">
            <li>Emilio Cardenas</li>
            <li>Nathalia Angulo</li>
            <li>Melenie Pérez</li>
            <li>Anthony Mejia</li>
            <li>Michael Intriago</li>
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <div className="mx-auto mt-10 max-w-7xl border-t border-white/10 pt-5 text-xs text-stone-500">
        © 2026 Dulces Aesca. Todos los derechos reservados. Privacidad ·
        Términos
      </div>
    </footer>
  )
}
