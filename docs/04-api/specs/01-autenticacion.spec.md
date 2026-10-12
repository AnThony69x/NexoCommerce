# Modulo 01: Autenticacion — Especificacion Tecnica (SDD)

* **Version del contrato:** 1.1.2
* **Fecha:** 2026-09-23
* **Prefijo base:** `/api/v1/auth`
* **Mecanismo:** Laravel Sanctum (Personal Access Tokens)
* **Estado:** Aprobado para implementacion (Fase 1 implementada)
* **Trazabilidad RF:** RF-01, RF-02 (`docs/01-requisitos/README.md`)
* **Fuente de datos:** `database/database.sql` tablas `usuarios`, `roles`, `cuentas_oauth`, `verificaciones_correo`
* **Responsables:** Backend Anthony / Web Nathalia / Movil Emilio / BD Melanie

---

## 1. Proposito y Alcance
Registro de clientes, inicio y cierre de sesion, perfil autenticado, verificacion de correo (codigo por email), bloqueo por intentos fallidos y vinculacion OAuth **solo `GOOGLE`**. El hash de contraseña se persiste en `usuarios.password_hash`. Los tokens Sanctum no forman parte de las 25 tablas de negocio.

---

## 2. Reglas de Negocio e Invariantes
* **RN-AUTH-01:** El correo es unico (`usuarios.correo`).
* **RN-AUTH-02:** Todo registro publico crea un usuario con `rol_id` del rol `CLIENTE`.
* **RN-AUTH-03:** La contraseña de entrada tiene minimo 8 caracteres; se almacena hasheada. `password_hash` puede ser NULL solo en cuentas creadas por OAuth.
* **RN-AUTH-04:** El cliente debe enviar `terminos_aceptados = true` y `version_terminos`. Se guardan `terminos_aceptados_en`.
* **RN-AUTH-05:** Tras el registro se inserta un registro en `verificaciones_correo` (`codigo`, `expira_en` 24h) y se envia el codigo al correo del usuario via el puerto de notificaciones.
* **RN-AUTH-06:** Tras 5 `intentos_fallidos` la cuenta se bloquea 15 minutos (`bloqueado_hasta`). Login en ese intervalo responde 429.
* **RN-AUTH-07:** Login exitoso reinicia `intentos_fallidos` a 0 y emite un token Bearer.
* **RN-AUTH-08:** Logout revoca el token Sanctum actual.
* **RN-AUTH-09:** OAuth: `proveedor` solo `GOOGLE`; par (`proveedor`, `id_proveedor`) unico. Facebook u otros proveedores responden 422.
* **RN-AUTH-10:** Usuario con `activo = false` no puede autenticarse (403).

---

## 3. Modelo de Datos (PostgreSQL)

### Tabla: `roles`
| Campo | Tipo | Nulo | Descripcion |
| :--- | :--- | :--- | :--- |
| `id` | SERIAL | NO | PK. Seeds: 1 `ADMIN`, 2 `CLIENTE` |
| `nombre` | VARCHAR(50) | NO | UNIQUE |

### Tabla: `usuarios`
| Campo | Tipo | Nulo | Descripcion |
| :--- | :--- | :--- | :--- |
| `id` | SERIAL | NO | PK |
| `rol_id` | INT | NO | FK `roles.id` |
| `nombre_completo` | VARCHAR(150) | NO | |
| `correo` | VARCHAR(150) | NO | UNIQUE |
| `telefono` | VARCHAR(20) | SI | |
| `password_hash` | VARCHAR(255) | SI | NULL solo OAuth |
| `correo_verificado` | BOOLEAN | NO | Default FALSE |
| `intentos_fallidos` | INT | NO | `>= 0` |
| `bloqueado_hasta` | TIMESTAMP | SI | |
| `terminos_aceptados` | BOOLEAN | NO | Default FALSE |
| `version_terminos` | VARCHAR(20) | SI | |
| `terminos_aceptados_en` | TIMESTAMP | SI | |
| `activo` | BOOLEAN | NO | Default TRUE |
| `creado_en` | TIMESTAMP | NO | |
| `actualizado_en` | TIMESTAMP | NO | |

### Tabla: `cuentas_oauth`
| Campo | Tipo | Nulo | Descripcion |
| :--- | :--- | :--- | :--- |
| `id` | SERIAL | NO | PK |
| `usuario_id` | INT | NO | FK `usuarios.id` CASCADE |
| `proveedor` | VARCHAR(50) | NO | Solo `GOOGLE` |
| `id_proveedor` | VARCHAR(255) | NO | |
| `creado_en` | TIMESTAMP | NO | |
| `actualizado_en` | TIMESTAMP | NO | |

UNIQUE (`proveedor`, `id_proveedor`).

### Tabla: `verificaciones_correo`
| Campo | Tipo | Nulo | Descripcion |
| :--- | :--- | :--- | :--- |
| `id` | SERIAL | NO | PK |
| `usuario_id` | INT | NO | FK `usuarios.id` CASCADE |
| `codigo` | VARCHAR(100) | NO | |
| `expira_en` | TIMESTAMP | NO | |
| `usado_en` | TIMESTAMP | SI | |
| `creado_en` | TIMESTAMP | NO | |

---

## 4. Endpoints

### 4.1 Registro de cliente
* **Metodo:** `POST`
* **Ruta:** `/api/v1/auth/registro`
* **Autenticacion:** Publica
* **Roles autorizados:** Todos

#### Payload
```json
{
  "nombre_completo": "Juan Perez",
  "correo": "juan.perez@example.com",
  "password": "Password123*",
  "password_confirmation": "Password123*",
  "telefono": "0991234567",
  "terminos_aceptados": true,
  "version_terminos": "1.0"
}
```

#### Validaciones
* `nombre_completo`: `required|string|max:150`
* `correo`: `required|email|max:150|unique:usuarios,correo`
* `password`: `required|string|min:8|confirmed`
* `telefono`: `nullable|string|max:20`
* `terminos_aceptados`: `required|accepted`
* `version_terminos`: `required|string|max:20`

#### 201 Created
```json
{
  "success": true,
  "message": "Usuario registrado. Verifique su correo.",
  "data": {
    "usuario": {
      "id": 1,
      "nombre_completo": "Juan Perez",
      "correo": "juan.perez@example.com",
      "telefono": "0991234567",
      "rol": "CLIENTE",
      "correo_verificado": false,
      "activo": true
    },
    "token": "1|raX7z9..."
  }
}
```

---

### 4.2 Inicio de sesion
* **Metodo:** `POST`
* **Ruta:** `/api/v1/auth/login`
* **Autenticacion:** Publica

#### Payload
```json
{
  "correo": "juan.perez@example.com",
  "password": "Password123*",
  "device_name": "Xiaomi Redmi Note 12"
}
```

#### Validaciones
* `correo`: `required|email`
* `password`: `required|string`
* `device_name`: `nullable|string|max:100`

#### 200 OK
```json
{
  "success": true,
  "message": "Sesion iniciada correctamente.",
  "data": {
    "usuario": {
      "id": 1,
      "nombre_completo": "Juan Perez",
      "correo": "juan.perez@example.com",
      "rol": "CLIENTE",
      "correo_verificado": true,
      "activo": true
    },
    "token": "2|b8Yw..."
  }
}
```

#### 401 Unauthorized
```json
{
  "success": false,
  "message": "Las credenciales proporcionadas son incorrectas.",
  "codigo_error": "AUTH_CREDENCIALES_INVALIDAS"
}
```

#### 429 Too Many Requests (cuenta bloqueada)
```json
{
  "success": false,
  "message": "Cuenta bloqueada temporalmente por intentos fallidos.",
  "codigo_error": "AUTH_CUENTA_BLOQUEADA"
}
```

---

### 4.3 Cierre de sesion
* **Metodo:** `POST`
* **Ruta:** `/api/v1/auth/logout`
* **Autenticacion:** Sanctum
* **Roles autorizados:** CLIENTE, ADMIN

#### 200 OK
```json
{
  "success": true,
  "message": "Sesion cerrada y token revocado."
}
```

---

### 4.4 Perfil autenticado
* **Metodo:** `GET`
* **Ruta:** `/api/v1/auth/perfil`
* **Autenticacion:** Sanctum

#### 200 OK
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nombre_completo": "Juan Perez",
    "correo": "juan.perez@example.com",
    "telefono": "0991234567",
    "rol": "CLIENTE",
    "correo_verificado": true,
    "terminos_aceptados": true,
    "version_terminos": "1.0",
    "activo": true,
    "creado_en": "2026-09-07T22:00:00.000000Z"
  }
}
```

---

### 4.5 Verificar correo
* **Metodo:** `POST`
* **Ruta:** `/api/v1/auth/verificar-correo`
* **Autenticacion:** Sanctum

#### Payload
```json
{
  "codigo": "482193"
}
```

#### Validaciones
* `codigo`: `required|string|max:100`

Marca `verificaciones_correo.usado_en` y `usuarios.correo_verificado = true`. Codigo expirado o usado: 400 `AUTH_CODIGO_INVALIDO`.

---

### 4.6 Reenviar codigo de verificacion
* **Metodo:** `POST`
* **Ruta:** `/api/v1/auth/reenviar-verificacion`
* **Autenticacion:** Sanctum

Inserta un nuevo registro en `verificaciones_correo`.

---

### 4.7 Login / vinculo OAuth
* **Metodo:** `POST`
* **Ruta:** `/api/v1/auth/oauth`
* **Autenticacion:** Publica

#### Payload
```json
{
  "proveedor": "GOOGLE",
  "id_proveedor": "108234567890",
  "nombre_completo": "Juan Perez",
  "correo": "juan.perez@gmail.com",
  "terminos_aceptados": true,
  "version_terminos": "1.0"
}
```

#### Validaciones
* `proveedor`: `required|in:GOOGLE`
* `id_proveedor`: `required|string|max:255`
* `nombre_completo`: `required|string|max:150`
* `correo`: `required|email|max:150`
* `terminos_aceptados`: `required|accepted`
* `version_terminos`: `required|string|max:20`

Si el par proveedor/id existe, inicia sesion. Si el correo existe sin OAuth, vincula `cuentas_oauth`. Si no existe, crea `usuarios` con `password_hash` NULL, `correo_verificado = true` y `cuentas_oauth`.

---

## 5. Criterios de Aceptacion
* [x] **TC-01:** Registro valido inserta `usuarios` con rol CLIENTE y `verificaciones_correo`; responde 201. (Fase 1)
* [x] **TC-02:** Correo duplicado responde 422 sobre `correo`. (Fase 1)
* [x] **TC-03:** Login con password incorrecto incrementa `intentos_fallidos` y responde 401. (Fase 1)
* [x] **TC-04:** Quinto fallo setea `bloqueado_hasta`; el siguiente login responde 429. (Fase 1)
* [x] **TC-05:** Logout sin token responde 401. (Fase 1)
* [x] **TC-06:** OAuth con proveedor distinto de GOOGLE (ej. FACEBOOK, TWITTER) responde 422. (Fase 1)
* [x] **TC-07:** Registro dispara envio de correo de verificacion (Mailtrap / `NotificacionServiceInterface`). (Fase 1)
