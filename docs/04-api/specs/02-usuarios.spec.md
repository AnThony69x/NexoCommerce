# Modulo 02: Usuarios y Roles — Especificacion Tecnica (SDD)

* **Version del contrato:** 1.1.1
* **Fecha:** 2026-09-23
* **Prefijo base:** `/api/v1/usuarios`
* **Estado:** Aprobado para implementacion (Fase 1 implementada)
* **Trazabilidad RF:** RF-01 (roles / acceso), RF-02 (perfil cliente)
* **Fuente de datos:** `database/database.sql` tablas `usuarios`, `roles`
* **Responsables:** Backend Anthony / Web Nathalia / Movil Emilio / BD Melanie

---

## 1. Proposito y Alcance
Gestion de perfiles. No existe tabla `clientes`: el tipo de usuario es `usuarios.rol_id` → `roles.nombre` (`ADMIN` o `CLIENTE`). No existe el rol «Personal autorizado».

---

## 2. Reglas de Negocio e Invariantes
* **RN-USR-01:** Roles permitidos: `ADMIN`, `CLIENTE`.
* **RN-USR-02:** Un CLIENTE solo consulta y edita su propio perfil.
* **RN-USR-03:** Solo ADMIN lista usuarios, cambia `activo` o asigna rol.
* **RN-USR-04:** No se elimina el ultimo usuario con rol `ADMIN` (pueden existir varios ADMIN).
* **RN-USR-05:** Cambio de contraseña exige `password_actual`. No aplica a cuentas solo OAuth (`password_hash` NULL): 400 `AUTH_SIN_PASSWORD_LOCAL`.
* **RN-USR-06:** No hay DELETE fisico de usuarios; se usa `activo = false`.

---

## 3. Modelo de Datos (PostgreSQL)

Tablas `roles` y `usuarios` segun spec 01. Campos editables por el propio usuario: `nombre_completo`, `telefono`. Campos solo ADMIN: `rol_id`, `activo`.

---

## 4. Endpoints

### 4.1 Listar usuarios (ADMIN)
* **Metodo:** `GET`
* **Ruta:** `/api/v1/admin/usuarios`
* **Autenticacion:** Sanctum
* **Roles autorizados:** ADMIN

#### Query
| Parametro | Tipo | Descripcion |
| :--- | :--- | :--- |
| `rol` | string | `CLIENTE` o `ADMIN` |
| `buscar` | string | `nombre_completo` o `correo` |
| `activo` | boolean | Filtro de estado |
| `page` | integer | Default 1 |

#### 200 OK
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre_completo": "Administrador Principal",
      "correo": "admin@dulcesaesca.com",
      "telefono": "0990000000",
      "rol": "ADMIN",
      "correo_verificado": true,
      "activo": true,
      "creado_en": "2026-09-01T12:00:00.000000Z"
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

CLIENTE en esta ruta: 403 `AUTH_FORBIDDEN`.

---

### 4.2 Actualizar perfil propio
* **Metodo:** `PUT`
* **Ruta:** `/api/v1/usuarios/perfil`
* **Autenticacion:** Sanctum
* **Roles autorizados:** CLIENTE, ADMIN

#### Payload
```json
{
  "nombre_completo": "Juan Carlos Perez",
  "telefono": "0998765432"
}
```

#### Validaciones
* `nombre_completo`: `required|string|max:150`
* `telefono`: `nullable|string|max:20`

#### 200 OK
```json
{
  "success": true,
  "message": "Perfil actualizado correctamente.",
  "data": {
    "id": 2,
    "nombre_completo": "Juan Carlos Perez",
    "correo": "juan.perez@example.com",
    "telefono": "0998765432",
    "rol": "CLIENTE"
  }
}
```

El correo no se cambia por este endpoint.

---

### 4.3 Cambiar contraseña
* **Metodo:** `PUT`
* **Ruta:** `/api/v1/usuarios/cambiar-password`
* **Autenticacion:** Sanctum

#### Payload
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

Actualiza `usuarios.password_hash`. Password actual incorrecto: 400.

---

### 4.4 Cambiar estado o rol (ADMIN)
* **Metodo:** `PATCH`
* **Ruta:** `/api/v1/admin/usuarios/{id}`
* **Autenticacion:** Sanctum
* **Roles autorizados:** ADMIN

#### Payload
```json
{
  "rol": "CLIENTE",
  "activo": false
}
```

#### Validaciones
* `rol`: `nullable|in:ADMIN,CLIENTE`
* `activo`: `nullable|boolean`

Si `rol` cambia, se resuelve `rol_id` contra `roles.nombre`. No desactivar ni degradar al ultimo ADMIN: 400 `USR_ULTIMO_ADMIN`.

---

## 5. Criterios de Aceptacion
* [x] **TC-01:** CLIENTE en `GET /admin/usuarios` recibe 403. (Fase 1)
* [x] **TC-02:** PUT perfil persiste `nombre_completo` y `telefono` del usuario autenticado. (Fase 1)
* [x] **TC-03:** Cambio de password con actual incorrecta: 400. (Fase 1)
* [x] **TC-04:** No se puede dejar el sistema sin ningun ADMIN activo. (Fase 1)
