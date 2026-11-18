import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { expect, it, vi } from 'vitest'
import { listarCategorias } from '../../services/categoriesRepository'
import { listarProductos } from '../../services/productsRepository'
import type { CategoryNode } from '../../types/category'
import type { Product } from '../../types/product'
import CatalogPage from './CatalogPage'

vi.mock('../../services/categoriesRepository', () => ({ listarCategorias: vi.fn() }))
vi.mock('../../services/productsRepository', () => ({ listarProductos: vi.fn() }))
vi.mock('../../hooks/useCart', () => ({ useCart: () => ({ addItem: vi.fn() }) }))

function categoria(id: number, nombre: string, categoria_padre_id: number | null, subcategorias: CategoryNode[] = []): CategoryNode {
  return { id, nombre, categoria_padre_id, subcategorias, activo: true, descripcion: null, imagen: null }
}

function producto(id: number, nombre: string, categoria: CategoryNode): Product {
  return {
    id, nombre, categoria: { id: categoria.id, nombre: categoria.nombre },
    tipo: 'TORTA', precio: 20, activo: true, descripcion: null, imagen: null, stock: null,
  }
}

it('incluye los descendientes de Repostería y excluye las subcategorías homónimas de otra raíz', async () => {
  const chocolate = categoria(3, 'Chocolate', 2)
  const tortas = categoria(2, 'Tortas', 1, [chocolate])
  const reposteria = categoria(1, 'Repostería', null, [tortas])
  const otrasTortas = categoria(5, 'Tortas', 4)
  vi.mocked(listarCategorias).mockResolvedValue([reposteria, categoria(4, 'Otra categoría', null, [otrasTortas])])
  vi.mocked(listarProductos).mockResolvedValue([
    producto(11, 'Torta de la raíz', reposteria),
    producto(12, 'DEMO Torta chocolate', tortas),
    producto(13, 'Torta de subcategoría anidada', chocolate),
    producto(14, 'Torta ajena', otrasTortas),
  ])

  render(<MemoryRouter><CatalogPage /></MemoryRouter>)
  fireEvent.click(await screen.findByRole('checkbox', { name: 'Repostería' }))

  expect(screen.getByText('Torta de la raíz')).toBeTruthy()
  expect(screen.getByText('DEMO Torta chocolate')).toBeTruthy()
  expect(screen.getByText('Torta de subcategoría anidada')).toBeTruthy()
  expect(screen.queryByText('Torta ajena')).toBeNull()

  fireEvent.click(screen.getByRole('button', { name: 'Quitar filtro Repostería' }))
  expect(screen.getByText('Torta ajena')).toBeTruthy()
})
