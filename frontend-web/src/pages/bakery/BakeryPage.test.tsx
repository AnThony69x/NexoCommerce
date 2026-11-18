import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { listarCategorias } from '../../services/categoriesRepository'
import { listarProductos } from '../../services/productsRepository'
import type { CategoryNode } from '../../types/category'
import type { Product } from '../../types/product'
import BakeryPage from './BakeryPage'

vi.mock('../../services/categoriesRepository', () => ({ listarCategorias: vi.fn() }))
vi.mock('../../services/productsRepository', async (importOriginal) => ({
  ...await importOriginal<typeof import('../../services/productsRepository')>(),
  listarProductos: vi.fn(),
}))
vi.mock('../../hooks/useCart', () => ({ useCart: () => ({ addItem: vi.fn() }) }))

function categoria(id: number, nombre: string, subcategorias: CategoryNode[] = [], activo = true): CategoryNode {
  return { id, nombre, subcategorias, activo, categoria_padre_id: null, descripcion: null, imagen: null }
}

function producto(id: number, nombre: string, categoriaId: number): Product {
  return {
    id, nombre, categoria: { id: categoriaId, nombre: 'Categoría' },
    tipo: 'TORTA', precio: 20, activo: true, descripcion: null, imagen: null, stock: null,
  }
}

function abrirReposteria() {
  return render(<MemoryRouter><BakeryPage /></MemoryRouter>)
}

beforeEach(() => {
  vi.resetAllMocks()
  vi.mocked(listarCategorias).mockResolvedValue([
    categoria(1, 'Repostería', [
      categoria(2, 'Tortas', [categoria(3, 'Chocolate')]),
      categoria(4, 'Tartas'),
      categoria(5, 'Oculta', [categoria(6, 'Descendiente oculto')], false),
    ]),
    categoria(7, 'Otra'),
  ])
  vi.mocked(listarProductos).mockResolvedValue([
    producto(11, 'Torta de raíz', 1),
    producto(12, 'Torta de vainilla', 2),
    producto(13, 'Torta de chocolate', 3),
    producto(14, 'Producto ajeno', 7),
    producto(15, 'Producto oculto', 6),
  ])
})

describe('Repostería', () => {
  it('muestra la raíz y los descendientes activos y filtra por subcategoría directa', async () => {
    abrirReposteria()
    const tarjeta = (await screen.findByRole('heading', { name: 'Torta de chocolate' })).closest('article')!
    expect(within(tarjeta).getByRole('link', { name: 'Ver y personalizar' }).getAttribute('href')).toBe('/productos/13')
    expect(within(tarjeta).queryByRole('button', { name: /al carrito/ })).toBeNull()
    expect(screen.getByRole('button', { name: 'Todas', pressed: true })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Torta de raíz' })).toBeTruthy()
    expect(screen.queryByText('Producto ajeno')).toBeNull()
    expect(screen.queryByText('Producto oculto')).toBeNull()
    expect(screen.queryByRole('button', { name: 'Chocolate' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Oculta' })).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Tortas' }))
    expect(screen.getByRole('button', { name: 'Tortas', pressed: true })).toBeTruthy()
    expect(screen.getByText('Torta de vainilla')).toBeTruthy()
    expect(screen.getByText('Torta de chocolate')).toBeTruthy()
    expect(screen.queryByText('Torta de raíz')).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Tartas' }))
    fireEvent.click(screen.getByRole('button', { name: 'Ver todos los productos de repostería' }))
    expect(screen.getByText('Torta de raíz')).toBeTruthy()
  })

  it.each(['sin categoría', 'sin productos'])('ofrece explorar el catálogo cuando está %s', async (caso) => {
    if (caso === 'sin categoría') vi.mocked(listarCategorias).mockResolvedValueOnce([])
    else vi.mocked(listarProductos).mockResolvedValueOnce([])

    abrirReposteria()
    expect((await screen.findByRole('link', { name: 'Explorar catálogo' })).getAttribute('href')).toBe('/catalogo')
  })

  it('permite reintentar una carga fallida', async () => {
    vi.mocked(listarProductos).mockRejectedValueOnce(new Error('Catálogo no disponible'))
    abrirReposteria()
    expect(screen.getByRole('status').textContent).toContain('Cargando repostería')
    expect((await screen.findByRole('alert')).textContent).toContain('Catálogo no disponible')

    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(await screen.findByText('Torta de raíz')).toBeTruthy()
    expect(listarCategorias).toHaveBeenCalledTimes(2)
    expect(listarProductos).toHaveBeenCalledTimes(2)
  })
})
