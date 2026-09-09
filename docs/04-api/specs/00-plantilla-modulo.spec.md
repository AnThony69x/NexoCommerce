# [NOMBRE DEL MÓDULO] — Especificación Técnica (SDD)

* **Versión del contrato:** 1.0.0
* **Fecha:** YYYY-MM-DD
* **Estado:** [Borrador / En Revisión / Aprobado / Implementado]
* **Responsables:** 
  * Backend: Anthony
  * Frontend Web: Nathalia
  * App Móvil: Emilio
  * Base de Datos: Melanie

---

## 1. Propósito y Alcance
Descripción de la funcionalidad del módulo y qué problema de negocio resuelve.

---

## 2. Reglas de Negocio e Invariantes
* **RN-01:** Regla de negocio 1 (ej: Stock no puede ser negativo).
* **RN-02:** Regla de negocio 2 (ej: Solo pedidos en estado pendiente pueden cancelarse).

---

## 3. Modelo de Datos (PostgreSQL)
Tablas y campos involucrados:

### Tabla: `nombre_tabla`
| Campo | Tipo | Nulo | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | BIGSERIAL | NO | Llave primaria |
| `nombre` | VARCHAR(255) | NO | Nombre del recurso |
| `created_at` | TIMESTAMP | NO | Auditoría |

---

## 4. Endpoints de la API (`/api/v1/...`)

### 4.1 [Nombre del Caso de Uso]
* **Método:** `POST` / `GET` / `PUT` / `PATCH` / `DELETE`
* **Ruta:** `/api/v1/recurso`
* **Autenticación:** [Pública / Sanctum (Bearer Token)]
* **Roles autorizados:** [Todos / Clientes / Administradores]

#### Parámetros / Headers
| Parámetro | Ubicación | Tipo | Requerido | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| `Authorization` | Header | String | Sí | `Bearer <token>` |

#### Payload de Entrada (Request Body)
```json
{
  "campo": "valor"
}
```

#### Reglas de Validación (Laravel FormRequest)
* `campo`: `required|string|max:255`

#### Respuestas Esperadas

##### 200 OK / 201 Created (Éxito)
```json
{
  "success": true,
  "message": "Operación completada.",
  "data": {
    "id": 1
  }
}
```

##### 422 Unprocessable Content (Error de validación)
```json
{
  "success": false,
  "message": "Los datos proporcionados no son válidos.",
  "errors": {
    "campo": ["El campo es obligatorio."]
  }
}
```

---

## 5. Criterios de Aceptación (Casos de Prueba)
* [ ] **TC-01:** Si se envían datos válidos, responde 200/201 y guarda el registro en PostgreSQL.
* [ ] **TC-02:** Si falta un campo requerido, responde 422 con mensaje descriptivo.
* [ ] **TC-03:** Si el token falta en rutas protegidas, responde 401 Unauthorized.
