import { createContext, useState, type ReactNode } from 'react'
import { authUsersMock } from '../data/authUsers.mock'
import type { AuthUser } from '../types/auth'

type AuthContextValue = {
  user: AuthUser | null
  isAuthenticated: boolean
  login: (email: string, password: string) => AuthUser | null
  registerMock: (
    nombre: string,
    email: string,
    telefono: string,
    password: string,
  ) => AuthUser
  logout: () => void
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)

  function login(email: string, password: string) {
    const mockUser = authUsersMock.find(
      (candidate) =>
        candidate.correo.toLowerCase() === email.trim().toLowerCase() &&
        candidate.passwordMock === password,
    )

    if (!mockUser || !mockUser.activo) {
      setUser(null)
      return null
    }

    const { passwordMock, ...loggedUser } = mockUser
    void passwordMock
    setUser(loggedUser)
    return loggedUser
  }

  function registerMock(
    nombre: string,
    email: string,
    telefono: string,
    password: string,
  ) {
    void password
    const registeredUser: AuthUser = {
      id: `mock-${email}`,
      role: 'CLIENTE',
      nombre_completo: nombre,
      correo: email,
      telefono,
      correo_verificado: false,
      activo: true,
    }

    setUser(registeredUser)
    return registeredUser
  }

  function logout() {
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        login,
        registerMock,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
