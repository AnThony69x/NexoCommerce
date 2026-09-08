# Módulo 02: Usuarios y Roles — Especificación Técnica (SDD)

* **Versión del contrato:** 1.0.0
* **Prefijo base:** `/api/v1/usuarios`
* **Mecanismo:** Laravel Sanctum + Middleware de Roles
* **Estado:** Aprobado para revisión

---

## 1. Propósito y Alcance
Gestionar los perfiles de usuario del sistema (Clientes y Administradores), permitiendo la actualización de datos personales, cambio de contraseñas y la administración de cuentas por parte de los administradores.

---

## 2. Reglas de Negocio
* **RN-USR-01:** Los roles disponibles en el sistema son `administrador` y `cliente`.
* **RN-USR-02:** Un cliente solo puede consultar y editar su propio perfil.
* **RN-USR-03:** Solo los usuarios con rol `administrador` pueden listar todos los usuarios o cambiar el rol de un usuario.
* **RN-USR-04:** No se permite eliminar la última cuenta con rol `administrador` para evitar bloqueo del sistema.
* **RN-USR-05:** Para cambiar contraseña, se debe verificar obligatoriamente la contraseña actual.

---

## 3. Endpoints

### 3.1 Listar Usuarios (Solo Administrador)
* **Método:** `GET`
* **Ruta:** `/api/v1/admin/usuarios`
* **Autenticación:** `Bearer <token>` (Rol: `administrador`)

#### Parámetros de Query
| Parámetro | Tipo | Descripción |
| :--- | :--- | :--- |
| `rol` | string | Filtrar por `cliente` o `administrador` |
| `buscar` | string | Búsqueda por nombre o email |
| `page` | integer | Número de página (default: 1) |

#### Respuesta 200 OK
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Administrador Principal",
      "email": "admin@nexocommerce.com",
      "rol": "administrador",
      "telefono": "0990000000",
      "created_at": "2026-09-01T12:00:00.000000Z"
    }
  ],
  "meta": {
    "pagina_actual": 1,
    "por_pagina": 15,
    "total": 1,
    "total_paginas": 1
  }
}
```

---

### 3.2 Actualizar Datos del Perfil Propio
* **Método:** `PUT`
* **Ruta:** `/api/v1/usuarios/perfil`
* **Autenticación:** `Bearer <token>`

#### Request Body
```json
{
  "name": "Juan Carlos Pérez",
  "telefono": "0998765432"
}
```

#### Validaciones
* `name`: `required|string|max:100`
* `telefono`: `nullable|string|max:20`

#### Respuesta 200 OK
```json
{
  "success": true,
  "message": "Perfil actualizado correctamente.",
  "data": {
    "id": 2,
    "name": "Juan Carlos Pérez",
    "email": "juan.perez@example.com",
    "telefono": "0998765432"
  }
}
```

---

### 3.3 Cambiar Contraseña
* **Método:** `PUT`
* **Ruta:** `/api/v1/usuarios/cambiar-password`
* **Autenticación:** `Bearer <token>`

#### Request Body
```json
{
  "password_actual": "AntiguaPassword123*",
  "password_nueva": "NuevaPassword456*",
  "password_nueva_confirmation": "NuevaPassword456*"
}
```

#### Validaciones
* `password_actual`: `required|string`
* `password_nueva`: `required|string|min:8|confirmed|different:password_actual`

#### Respuesta 200 OK
```json
{
  "success": true,
  "message": "Contraseña actualizada exitosamente."
}
```
