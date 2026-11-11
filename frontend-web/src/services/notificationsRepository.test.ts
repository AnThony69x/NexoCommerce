import { describe, expect, it } from 'vitest'
import {
  listarNotificaciones,
  marcarLeida,
} from './notificationsRepository'

describe('notificationsRepository (mock)', () => {
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
