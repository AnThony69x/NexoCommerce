import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '../../contexts/AuthContext'
import ProtectedRoute from './ProtectedRoute'
import type { AuthUser } from '../../types/auth'

const SESION_KEY = 'nexocommerce.mockSession.v1'

function dejarSesion(rol: 'CLIENTE' | 'ADMIN') {
  const usuario: AuthUser = {
    id: 1,
    role: rol,
    nombre_completo: 'Usuario de prueba',
    correo: 'prueba@ejemplo.com',
    telefono: null,
    correo_verificado: true,
    activo: true,
  }
  localStorage.setItem(SESION_KEY, JSON.stringify(usuario))
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('redirige a /login cuando no hay sesion', () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/perfil']}>
          <Routes>
            <Route element={<ProtectedRoute />}>
              <Route path="/perfil" element={<p>Perfil</p>} />
            </Route>
            <Route path="/login" element={<p>Pantalla de login</p>} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    )

    expect(screen.getByText('Pantalla de login')).toBeTruthy()
    expect(screen.queryByText('Perfil')).toBeNull()
  })

  it('deja pasar al usuario con sesion', () => {
    dejarSesion('CLIENTE')
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/perfil']}>
          <Routes>
            <Route element={<ProtectedRoute />}>
              <Route path="/perfil" element={<p>Perfil</p>} />
            </Route>
            <Route path="/login" element={<p>Pantalla de login</p>} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    )

    expect(screen.getByText('Perfil')).toBeTruthy()
  })
})
