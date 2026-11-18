import * as api from '../services/adminService'

const lectores = {
  dashboard: api.obtenerDashboardAdmin,
  productos: api.listarProductosAdmin,
  categorias: api.listarCategoriasAdmin,
  pedidos: api.listarPedidosAdmin,
  pagos: api.listarPagosAdmin,
  usuarios: api.listarUsuariosAdmin,
  publicaciones: api.listarPublicacionesAdmin,
  multimedia: api.listarMultimediaAdmin,
  produccion: () => api.listarProduccionAdmin([]),
  tienda: api.obtenerConfiguracionTienda,
}

export type RecursoAdmin = keyof typeof lectores
type Datos<K extends RecursoAdmin> = Awaited<ReturnType<(typeof lectores)[K]>>
export type EstadoRecurso<T> = {
  data?: T
  loading: boolean
  error: string | null
  guardado?: boolean
}

const inicial = { loading: true, error: null }

export function crearRecursosAdmin() {
  const estados = new Map<RecursoAdmin, EstadoRecurso<Datos<RecursoAdmin>>>()
  const pendientes = new Map<RecursoAdmin, Promise<void>>()
  const observadores = new Map<RecursoAdmin, Set<() => void>>()
  const invalidos = new Set<RecursoAdmin>()

  function leer<K extends RecursoAdmin>(clave: K): EstadoRecurso<Datos<K>> {
    return (estados.get(clave) ?? inicial) as EstadoRecurso<Datos<K>>
  }

  function publicar(clave: RecursoAdmin, estado: EstadoRecurso<Datos<RecursoAdmin>>) {
    estados.set(clave, estado)
    observadores.get(clave)?.forEach((avisar) => avisar())
  }

  function observar(clave: RecursoAdmin, avisar: () => void) {
    const grupo = observadores.get(clave) ?? new Set()
    observadores.set(clave, grupo)
    grupo.add(avisar)
    return () => { grupo.delete(avisar) }
  }

  function cargar(clave: RecursoAdmin, forzar = false, guardado = false): Promise<void> {
    const pendiente = pendientes.get(clave)
    if (pendiente) return pendiente
    const actual = leer(clave)
    if (!forzar && !invalidos.has(clave) && (actual.data !== undefined || actual.error)) return Promise.resolve()

    const consulta = Promise.resolve().then<Datos<RecursoAdmin>>(() => lectores[clave]())
      .then((data) => {
        if (pendientes.get(clave) !== consulta) return
        invalidos.delete(clave)
        publicar(clave, { data, loading: false, error: null })
      })
      .catch((causa: unknown) => {
        if (pendientes.get(clave) !== consulta) return
        invalidos.delete(clave)
        publicar(clave, {
          data: actual.data,
          loading: false,
          error: causa instanceof Error ? causa.message : 'No se pudieron cargar los datos.',
          guardado: guardado || actual.guardado,
        })
      })
      .finally(() => {
        if (pendientes.get(clave) === consulta) pendientes.delete(clave)
      })

    pendientes.set(clave, consulta)
    publicar(clave, { ...actual, loading: true, error: null })
    return consulta
  }

  function invalidar(clave: RecursoAdmin, guardado = false) {
    pendientes.delete(clave)
    invalidos.add(clave)
    if (observadores.get(clave)?.size) return cargar(clave, true, guardado)
    return Promise.resolve()
  }

  function actualizar<K extends RecursoAdmin>(clave: K, transformar: (data: Datos<K>) => Datos<K>) {
    const actual = leer(clave)
    if (actual.data !== undefined) publicar(clave, { ...actual, data: transformar(actual.data) })
  }

  return { leer, observar, cargar, invalidar, actualizar }
}
