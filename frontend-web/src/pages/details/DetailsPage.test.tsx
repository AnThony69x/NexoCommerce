import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { expect, it, vi } from 'vitest'
import { listarCategorias } from '../../services/categoriesRepository'
import { listarProductos } from '../../services/productsRepository'
import type { CategoryNode } from '../../types/category'
import DetailsPage from './DetailsPage'

vi.mock('../../services/categoriesRepository', () => ({ listarCategorias: vi.fn() }))
vi.mock('../../services/productsRepository', async (importOriginal) => ({
  ...await importOriginal<typeof import('../../services/productsRepository')>(),
  listarProductos: vi.fn(),
}))
vi.mock('../../hooks/useCart', () => ({ useCart: () => ({ addItem: vi.fn() }) }))

it('filtra por las familias reales y deshabilita la compra rápida de un detalle agotado', async () => {
  const familias = ['Cajas de regalo', 'Kits personalizados', 'Detalles dulces']
  const categoria = (id: number, nombre: string, padre: number | null): CategoryNode => ({
    id, nombre, categoria_padre_id: padre, activo: true, descripcion: null, imagen: null, subcategorias: [],
  })
  const hijas = familias.map((nombre, i) => categoria(i + 2, nombre, 1))
  vi.mocked(listarCategorias).mockResolvedValue([
    { ...categoria(1, 'Detalles personalizados', null), subcategorias: hijas },
  ])
  vi.mocked(listarProductos).mockResolvedValue(
    hijas.map(({ id, nombre }, i) => ({
      id, nombre: `DEMO ${nombre}`, tipo: 'DETALLE', precio: 15, activo: true,
      categoria: { id, nombre }, stock: i === 2 ? 0 : 5, descripcion: null, imagen: null,
    })),
  )

  render(<MemoryRouter><DetailsPage /></MemoryRouter>)
  await screen.findByRole('heading', { name: 'DEMO Cajas de regalo' })
  expect((screen.getByRole('button', { name: 'Agregar DEMO Detalles dulces al carrito' }) as HTMLButtonElement).disabled).toBe(true)
  for (const familia of familias) {
    fireEvent.click(screen.getByRole('button', { name: familia }))
    expect(screen.getByRole('heading', { name: `DEMO ${familia}` })).toBeTruthy()
    expect(screen.getAllByRole('heading', { name: /^DEMO / })).toHaveLength(1)
  }
  fireEvent.click(screen.getByRole('button', { name: 'Todas' }))
  expect(screen.getAllByRole('heading', { name: /^DEMO / })).toHaveLength(3)
})
