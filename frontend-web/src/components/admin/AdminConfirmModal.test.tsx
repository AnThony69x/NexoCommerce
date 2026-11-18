import { fireEvent, render, screen } from '@testing-library/react'
import { afterAll, beforeAll, expect, it, vi } from 'vitest'
import AdminConfirmModal from './AdminConfirmModal'

// jsdom does not implement the native dialog methods.
const prototipo = HTMLDialogElement.prototype
const metodos = {
  showModal(this: HTMLDialogElement) { this.setAttribute('open', '') },
  close(this: HTMLDialogElement) { this.removeAttribute('open') },
}
const originales = Object.getOwnPropertyDescriptors(prototipo)
beforeAll(() => {
  for (const [nombre, metodo] of Object.entries(metodos)) {
    Object.defineProperty(prototipo, nombre, { configurable: true, value: metodo })
  }
})
afterAll(() => {
  for (const nombre of Object.keys(metodos)) {
    if (originales[nombre]) Object.defineProperty(prototipo, nombre, originales[nombre])
    else Reflect.deleteProperty(prototipo, nombre)
  }
})

it('permite cancelar sin aplicar el cambio', () => {
  const onConfirmar = vi.fn()
  const onCancelar = vi.fn()
  render(<AdminConfirmModal abierto titulo="Desactivar archivo" descripcion="Archivo de prueba" onConfirmar={onConfirmar} onCancelar={onCancelar} />)

  fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))

  expect(onCancelar).toHaveBeenCalledOnce()
  expect(onConfirmar).not.toHaveBeenCalled()
})

it('bloquea envíos repetidos y muestra los errores dentro del diálogo', async () => {
  let rechazar!: (error: Error) => void
  const onConfirmar = vi.fn(() => new Promise<void>((_, reject) => { rechazar = reject }))
  const onCancelar = vi.fn()
  render(<AdminConfirmModal abierto titulo="Activar archivo" descripcion="Archivo de prueba" onConfirmar={onConfirmar} onCancelar={onCancelar} />)

  fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }))
  fireEvent.click(screen.getByRole('button', { name: 'Guardando…' }))
  fireEvent(screen.getByRole('dialog'), new Event('cancel', { cancelable: true }))
  expect(onConfirmar).toHaveBeenCalledOnce()
  expect(onCancelar).not.toHaveBeenCalled()

  rechazar(new Error('Archivo en uso'))
  expect((await screen.findByRole('alert')).textContent).toBe('Archivo en uso')
})
