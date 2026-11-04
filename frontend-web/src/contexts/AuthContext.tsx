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
import type { AuthUser, SesionAuth } from '../types/auth'

type AuthContextValue = {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
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

  // Al montar: el repositorio resuelve la sesión inicial (mock = local,
  // real = valida token contra /auth/perfil y lo descarta si ya no sirve).
  useEffect(() => {
    let cancelado = false

    refrescarSesionInicial()
      .then((perfil) => {
        if (cancelado) return
        if (perfil) {
          setUser(perfil)
          guardarSesion(perfil)
        } else {
          limpiarSesion()
          limpiarToken()
        }
      })
      .catch(() => {
        if (cancelado) return
        limpiarSesion()
        limpiarToken()
      })

    return () => {
      cancelado = true
    }
  }, [])

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
    setUser(null)
    setToken(null)
    limpiarSesion()
    limpiarToken()
    // Revoca el token en el backend (real); en mock es un no-op.
    void cerrarSesion()
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: user !== null,
        login,
        registrar,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
