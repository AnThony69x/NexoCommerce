import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '../../contexts/AuthContext'
import AdminRoute from './AdminRoute'
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

function montarRutas(inicial: string) {
  render(
    <AuthProvider>
      <MemoryRouter initialEntries={[inicial]}>
        <Routes>
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<p>Panel</p>} />
          </Route>
          <Route path="/" element={<p>Inicio</p>} />
          <Route path="/login" element={<p>Login</p>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  )
}

describe('AdminRoute', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('manda a /login a los invitados', () => {
    montarRutas('/admin')
    expect(screen.getByText('Login')).toBeTruthy()
    expect(screen.queryByText('Panel')).toBeNull()
  })

  it('manda a /inicio a quien no es administrador', () => {
    dejarSesion('CLIENTE')
    montarRutas('/admin')
    expect(screen.getByText('Inicio')).toBeTruthy()
    expect(screen.queryByText('Panel')).toBeNull()
  })

  it('deja entrar al administrador', () => {
    dejarSesion('ADMIN')
    montarRutas('/admin')
    expect(screen.getByText('Panel')).toBeTruthy()
  })
})
