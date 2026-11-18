import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { beforeEach, expect, it, vi } from 'vitest'
import { useAsync } from '../../hooks/useAsync'
import { obtenerDashboardAdmin } from '../../services/adminService'
import AdminDashboardPage from './AdminDashboardPage'
import AdminProductsPage from './AdminProductsPage'

vi.mock('../../services/adminService', async (importOriginal) => ({
  ...await importOriginal<typeof import('../../services/adminService')>(),
  obtenerDashboardAdmin: vi.fn(),
}))

vi.mock('../../contexts/AdminContext', () => ({
  useAdmin: () => ({}),
  useAdminResource: (clave: string) => clave === 'dashboard' ? useDashboardPrueba() : ({
    data: clave === 'categorias' ? [] : [
      { id: '1', nombre: 'Regalo agotado', activo: true, tipo: 'DETALLE', stock: 0, imagenes: [], precio_base: 10 },
      { id: '2', nombre: 'Regalo inactivo', activo: false, tipo: 'DETALLE', stock: 1, imagenes: [], precio_base: 10 },
      { id: '3', nombre: 'Torta sin stock', activo: true, tipo: 'TORTA', imagenes: [], precio_base: 10 },
      { id: '4', nombre: 'Regalo disponible', activo: true, tipo: 'DETALLE', stock: 6, imagenes: [], precio_base: 10 },
    ], loading: false, error: null, recargar: vi.fn(),
  }),
}))

function useDashboardPrueba() {
  const recurso = useAsync(obtenerDashboardAdmin)
  return { ...recurso, data: recurso.data ?? undefined }
}

const resumen = {
  pedidos_pendientes: 2, pedidos_listos: 1, pagos_pendientes: 3,
  total_productos_stock_bajo: 12, productos_activos: 18, usuarios_registrados: 5,
  pedidos_recientes: [], productos_stock_bajo: [],
}

beforeEach(() => { vi.resetAllMocks() })

it('distingue la carga de un fallo y muestra el resumen con sus enlaces al reintentar', async () => {
  vi.mocked(obtenerDashboardAdmin).mockRejectedValueOnce(new Error('Sin conexión')).mockResolvedValueOnce(resumen)
  render(<MemoryRouter><AdminDashboardPage /></MemoryRouter>)
  expect(screen.getByRole('status').textContent).toContain('Cargando')
  expect(screen.queryByText('Pedidos pendientes')).toBeNull()
  await screen.findByText(/Sin conexión/)
  fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }))
  expect((await screen.findByRole('link', { name: /Listos para entregar/ })).getAttribute('href')).toBe('/admin/pedidos?estado=LISTO')
  expect(screen.getByRole('link', { name: /Pedidos pendientes/ }).getAttribute('href')).toBe('/admin/pedidos?estado=PENDIENTE')
  expect(screen.getByRole('link', { name: /Pagos por verificar/ }).getAttribute('href')).toBe('/admin/pagos?estado=PENDIENTE')
  expect(screen.getByRole('link', { name: /Productos con stock bajo.*12/ })).toBeTruthy()
  expect(screen.getByText('Aún no hay pedidos registrados.')).toBeTruthy()
  expect(screen.getByText('Sin alertas de stock.')).toBeTruthy()
})

function Navegacion() {
  const navigate = useNavigate()
  const location = useLocation()
  return <><output>{location.search}</output><button onClick={() => navigate(-1)}>Atrás</button><button onClick={() => navigate(1)}>Avanzar</button></>
}

it('aplica el inventario de la URL y lo restaura con el historial del navegador', async () => {
  vi.mocked(obtenerDashboardAdmin).mockResolvedValue(resumen)
  render(<MemoryRouter initialEntries={['/admin']}>
    <Navegacion />
    <Routes>
      <Route path="/admin" element={<AdminDashboardPage />} />
      <Route path="/admin/productos" element={<AdminProductsPage />} />
    </Routes>
  </MemoryRouter>)
  fireEvent.click(await screen.findByRole('link', { name: 'Ver inventario' }))
  expect(screen.getByText('?stock=bajo')).toBeTruthy()
  expect(screen.getByText('Regalo agotado')).toBeTruthy()
  expect(screen.queryByText('Regalo inactivo')).toBeNull()
  expect(screen.queryByText('Torta sin stock')).toBeNull()
  expect(screen.queryByText('Regalo disponible')).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: 'Limpiar filtros' }))
  expect(screen.getByText('Regalo inactivo')).toBeTruthy()
  expect(screen.queryByText('?stock=bajo')).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: 'Atrás' }))
  expect(screen.getByText('?stock=bajo')).toBeTruthy()
  expect(screen.queryByText('Regalo inactivo')).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: 'Avanzar' }))
  expect(screen.getByText('Regalo inactivo')).toBeTruthy()
})
