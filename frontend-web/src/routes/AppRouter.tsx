import { BrowserRouter, Route, Routes } from 'react-router-dom'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<p>Inicio</p>} />
        <Route path="/login" element={<p>Login</p>} />
        <Route path="/registro" element={<p>Registro</p>} />
        <Route path="/catalogo" element={<p>Catalogo</p>} />
        <Route path="/carrito" element={<p>Carrito</p>} />
        <Route path="/admin" element={<p>Admin</p>} />
      </Routes>
    </BrowserRouter>
  )
}
