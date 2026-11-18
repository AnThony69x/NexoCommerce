import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '../../contexts/AuthContext'
import AdminRoute from './AdminRoute'
import type { AuthUser } from '../../types/auth'

vi.mock('../../services/authRepository', () => ({
  refrescarSesionInicial: async () => JSON.parse(localStorage.getItem(SESION_KEY) ?? 'null'),
}))

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

  it('manda a /login a los invitados', async () => {
    montarRutas('/admin')
    expect(await screen.findByText('Login')).toBeTruthy()
    expect(screen.queryByText('Panel')).toBeNull()
  })

  it('manda a /inicio a quien no es administrador', async () => {
    dejarSesion('CLIENTE')
    montarRutas('/admin')
    expect(await screen.findByText('Inicio')).toBeTruthy()
    expect(screen.queryByText('Panel')).toBeNull()
  })

  it('deja entrar al administrador', async () => {
    dejarSesion('ADMIN')
    montarRutas('/admin')
    expect(await screen.findByText('Panel')).toBeTruthy()
  })
})
