# Módulo 01: Autenticación y Tokens — Especificación Técnica (SDD)

* **Versión del contrato:** 1.0.0
* **Prefijo base:** `/api/v1/auth`
* **Mecanismo:** Laravel Sanctum (Personal Access Tokens)
* **Estado:** Aprobado para implementación

---

## 1. Propósito y Alcance
Permite el registro, inicio de sesión, cierre de sesión y consulta de perfil de usuarios (Clientes y Administradores) de NexoCommerce tanto desde la Web como desde la App Móvil.

---

## 2. Reglas de Negocio
* **RN-AUTH-01:** El correo electrónico debe ser único en el sistema.
* **RN-AUTH-02:** La contraseña debe tener mínimo 8 caracteres.
* **RN-AUTH-03:** Todo nuevo registro desde la API pública se crea con el rol por defecto `cliente`.
* **RN-AUTH-04:** Al hacer login exitoso, se revoca cualquier sesión previa en ese mismo dispositivo y se retorna un token Bearer válido.
* **RN-AUTH-05:** Al hacer logout, el token actual es revocado inmediatamente en la base de datos.

---

## 3. Endpoints

### 3.1 Registro de Cliente
* **Método:** `POST`
* **Ruta:** `/api/v1/auth/registro`
* **Autenticación:** Pública

#### Request Body
```json
{
  "name": "Juan Pérez",
  "email": "juan.perez@example.com",
  "password": "Password123*",
  "password_confirmation": "Password123*",
  "telefono": "0991234567"
}
```

#### Validaciones
* `name`: `required|string|max:100`
* `email`: `required|string|email|max:150|unique:users,email`
* `password`: `required|string|min:8|confirmed`
* `telefono`: `nullable|string|max:20`

#### Respuesta 201 Created
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente.",
  "data": {
    "user": {
      "id": 1,
      "name": "Juan Pérez",
      "email": "juan.perez@example.com",
      "rol": "cliente",
      "telefono": "0991234567"
    },
    "token": "1|raX7z9..."
  }
}
```

---

### 3.2 Inicio de Sesión (Login)
* **Método:** `POST`
* **Ruta:** `/api/v1/auth/login`
* **Autenticación:** Pública

#### Request Body
```json
{
  "email": "juan.perez@example.com",
  "password": "Password123*",
  "device_name": "Xiaomi Redmi Note 12"
}
```

#### Validaciones
* `email`: `required|email`
* `password`: `required|string`
* `device_name`: `nullable|string|max:100`

#### Respuesta 200 OK
```json
{
  "success": true,
  "message": "Sesión iniciada correctamente.",
  "data": {
    "user": {
      "id": 1,
      "name": "Juan Pérez",
      "email": "juan.perez@example.com",
      "rol": "cliente"
    },
    "token": "2|b8Yw..."
  }
}
```

#### Respuesta 401 Unauthorized (Credenciales incorrectas)
```json
{
  "success": false,
  "message": "Las credenciales proporcionadas son incorrectas."
}
```

---

### 3.3 Cierre de Sesión (Logout)
* **Método:** `POST`
* **Ruta:** `/api/v1/auth/logout`
* **Autenticación:** `Bearer <token>` (Sanctum)

#### Respuesta 200 OK
```json
{
  "success": true,
  "message": "Sesión cerrada y token revocado con éxito."
}
```

---

### 3.4 Perfil de Usuario Autenticado
* **Método:** `GET`
* **Ruta:** `/api/v1/auth/perfil`
* **Autenticación:** `Bearer <token>` (Sanctum)

#### Respuesta 200 OK
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Juan Pérez",
    "email": "juan.perez@example.com",
    "rol": "cliente",
    "telefono": "0991234567",
    "created_at": "2026-09-07T22:00:00.000000Z"
  }
}
```
