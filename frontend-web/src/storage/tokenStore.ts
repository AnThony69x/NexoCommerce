const TOKEN_KEY = 'nexocommerce.mockToken.v1'

function leer(clave: string): string | null {
  try {
    return localStorage.getItem(clave)
  } catch {
    return null
  }
}

export function cargarToken(): string | null {
  const token = leer(TOKEN_KEY)
  return token?.startsWith('mock-token-') ? null : token
}

export function guardarToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token)
  } catch {
    // Sin almacenamiento: la sesión vive solo en memoria.
  }
}

export function limpiarToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY)
  } catch {
    // Sin almacenamiento: nada que limpiar.
  }
}
