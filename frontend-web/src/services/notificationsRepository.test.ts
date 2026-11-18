import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  listarNotificaciones,
  marcarLeida,
} from './notificationsRepository'

let leida = false

vi.mock('./api', () => ({
  apiClient: {
    get: async () => ({
      data: { data: [aviso(2, leida), aviso(1, true)], meta: { total_no_leidas: leida ? 0 : 1 } },
    }),
    patch: async (ruta: string) => {
      if (ruta !== '/notificaciones/2/leida') throw new Error('El aviso no existe.')
      leida = true
      return { data: { data: aviso(2, true) } }
    },
  },
}))

function aviso(id: number, leida: boolean) {
  return {
    id, pedido_id: null, leida, titulo: 'Aviso', mensaje: 'Aviso de prueba',
    creado_en: `2026-11-0${id}T00:00:00Z`,
    fecha_lectura: leida ? '2026-11-03T00:00:00Z' : null,
  }
}

beforeEach(() => { leida = false })

describe('notificationsRepository', () => {
  it('lista los avisos con el total de no leidas', async () => {
    const resultado = await listarNotificaciones()

    expect(resultado.notificaciones.length).toBeGreaterThan(0)
    expect(resultado.total_no_leidas).toBe(
      resultado.notificaciones.filter((item) => !item.leida).length,
    )
  })

  it('ordena los avisos del mas reciente al mas antiguo', async () => {
    const resultado = await listarNotificaciones()
    const fechas = resultado.notificaciones.map((item) => item.creado_en)

    expect(fechas).toEqual([...fechas].sort().reverse())
  })

  it('marca un aviso como leido y descuenta el contador', async () => {
    const antes = await listarNotificaciones()
    const pendiente = antes.notificaciones.find((item) => !item.leida)

    expect(pendiente).toBeDefined()

    const actualizada = await marcarLeida(pendiente!.id)
    expect(actualizada.leida).toBe(true)
    expect(actualizada.fecha_lectura).not.toBeNull()

    const despues = await listarNotificaciones()
    expect(despues.total_no_leidas).toBe(antes.total_no_leidas - 1)
  })

  it('falla si el aviso no existe', async () => {
    await expect(marcarLeida('no-existe')).rejects.toThrow()
  })
})
