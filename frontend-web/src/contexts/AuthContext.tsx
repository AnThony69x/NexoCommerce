import {
  createContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import {
  cerrarSesion,
  iniciarSesion,
  refrescarSesionInicial,
  registrarCliente,
  type DatosRegistro,
} from '../services/authRepository'
import {
  cargarSesion,
  guardarSesion,
  limpiarSesion,
} from '../storage/sessionStore'
import {
  cargarToken,
  guardarToken,
  limpiarToken,
} from '../storage/tokenStore'
import { SESION_EXPIRADA_EVENTO } from '../services/api'
import { config } from '../config/app'
import type { AuthUser, SesionAuth } from '../types/auth'

type AuthContextValue = {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  /**
   * true mientras se valida la sesión guardada al arrancar (solo modo real).
   * Las rutas protegidas esperan este chequeo antes de redirigir, para no
   * mandar a /login a alguien con sesión válida que aún se está confirmando.
   */
  validando: boolean
  /**
   * Inicia sesión (mock o API real según VITE_MOCK_MODE). Lanza ApiError si
   * falla (401 credenciales inválidas, error de red, etc.) para que la página
   * muestre el mensaje; nunca devuelve null silencioso.
   */
  login: (email: string, password: string) => Promise<AuthUser>
  /** Registro público (siempre CLIENTE). Lanza ApiError si falla (422, etc.). */
  registrar: (datos: DatosRegistro) => Promise<AuthUser>
  logout: () => void
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
)

export function AuthProvider({ children }: { children: ReactNode }) {
  // Sesión persistida (usuario en localStorage; token en tokenStore). Se
  // restaura de forma síncrona para que rutas protegidas no parpadeen como
  // invitadas al recargar; el refresh de abajo la valida en modo real.
  const [user, setUser] = useState<AuthUser | null>(() => cargarSesion())
  const [token, setToken] = useState<string | null>(() => cargarToken())
  // En mock la sesión local ya es válida (validando = false, sin parpadeo de
  // "verificando"); en real se valida contra el backend y las rutas protegidas
  // esperan a este chequeo antes de decidir si redirigen.
  const [validando, setValidando] = useState(!config.mockMode)

  // Al montar: el repositorio resuelve la sesión inicial (mock = local,
  // real = valida token contra /auth/perfil; solo 401 la descarta).
  useEffect(() => {
    let cancelado = false

    refrescarSesionInicial()
      .then((perfil) => {
        if (cancelado) return
        if (perfil) {
          setUser(perfil)
          guardarSesion(perfil)
        } else {
          // Token rechazado por el backend: cerrar también la sesión visible
          // (antes quedaba en memoria una sesión ya inválida en localStorage).
          setUser(null)
          setToken(null)
          limpiarSesion()
          limpiarToken()
        }
      })
      .catch(() => {
        if (cancelado) return
        // Error inesperado fuera del repositorio: conservar la sesión local
        // (solo un 401 confirmado la cierra) para no desloguear por un fallo.
      })
      .finally(() => {
        if (!cancelado) setValidando(false)
      })

    return () => {
      cancelado = true
    }
  }, [])

  // 401 en cualquier petición real (api.ts): el interceptor limpia el token y
  // anuncia SESION_EXPIRADA_EVENTO. Aquí se cierra también la sesión visible,
  // para que la UI no quede "logueada" con un token ya inválido.
  useEffect(() => {
    function expirarSesion() {
      if (!user) return
      setUser(null)
      setToken(null)
      limpiarSesion()
      limpiarToken()
    }
    window.addEventListener(SESION_EXPIRADA_EVENTO, expirarSesion)
    return () =>
      window.removeEventListener(SESION_EXPIRADA_EVENTO, expirarSesion)
  }, [user])

  function aplicarSesion(sesion: SesionAuth) {
    setUser(sesion.usuario)
    setToken(sesion.token)
    guardarSesion(sesion.usuario)
    guardarToken(sesion.token)
  }

  async function login(email: string, password: string): Promise<AuthUser> {
    const sesion = await iniciarSesion(email, password)
    aplicarSesion(sesion)
    return sesion.usuario
  }

  async function registrar(datos: DatosRegistro): Promise<AuthUser> {
    const sesion = await registrarCliente(datos)
    aplicarSesion(sesion)
    return sesion.usuario
  }

  function logout() {
    // La revocación remota inicia ANTES de borrar el token: el interceptor
    // de api.ts lo lee al enviar la petición; si se borra antes, el POST
    // /auth/logout sale sin Authorization y el token nunca se revoca.
    const revocacion = cerrarSesion()
    setUser(null)
    setToken(null)
    limpiarSesion()
    limpiarToken()
    void revocacion
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: user !== null,
        validando,
        login,
        registrar,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
