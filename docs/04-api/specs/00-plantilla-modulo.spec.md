# [NOMBRE DEL MODULO] — Especificacion Tecnica (SDD)

* **Version del contrato:** 1.0.0
* **Fecha:** YYYY-MM-DD
* **Estado:** [Borrador / En Revision / Aprobado / Implementado]
* **Fuente de datos:** `database/database.sql`
* **Responsables:**
  * Backend: Anthony
  * Frontend Web: Nathalia
  * App Movil: Emilio
  * Base de Datos: Melanie

---

## 1. Proposito y Alcance
Descripcion del modulo y problema de negocio que resuelve. Debe referenciar las tablas PostgreSQL involucradas.

---

## 2. Reglas de Negocio e Invariantes
* **RN-01:** Extraer de `docs/03-base-datos/diseño-bd.md` seccion 7 o de los `CHECK` del SQL.
* **RN-02:** Los nombres JSON coinciden con las columnas SQL.

---

## 3. Modelo de Datos (PostgreSQL)
Copiar campos reales de `database/database.sql`. Usar `SERIAL`, `creado_en`, `actualizado_en`. No inventar `slug`, `created_at` ni tablas Laravel de negocio.

### Tabla: `nombre_tabla`
| Campo | Tipo | Nulo | Descripcion |
| :--- | :--- | :--- | :--- |
| `id` | SERIAL | NO | Llave primaria |
| `creado_en` | TIMESTAMP | NO | Auditoria |

---

## 4. Endpoints de la API (`/api/v1/...`)

### 4.1 [Nombre del Caso de Uso]
* **Metodo:** `POST` / `GET` / `PUT` / `PATCH` / `DELETE`
* **Ruta:** `/api/v1/recurso`
* **Autenticacion:** [Publica / Sanctum (Bearer Token)]
* **Roles autorizados:** [Todos / CLIENTE / ADMIN]

#### Payload de Entrada
```json
{
  "campo": "valor"
}
```

#### Reglas de Validacion (FormRequest)
* `campo`: `required|string|max:255`

#### Respuestas Esperadas

##### 200 OK / 201 Created
```json
{
  "success": true,
  "message": "Operacion completada.",
  "data": {
    "id": 1
  }
}
```

##### 422 Unprocessable Content
```json
{
  "success": false,
  "message": "Los datos proporcionados no son validos.",
  "errors": {
    "campo": ["El campo es obligatorio."]
  }
}
```

---

## 5. Criterios de Aceptacion
* [ ] **TC-01:** Datos validos: 200/201 y persistencia en PostgreSQL.
* [ ] **TC-02:** Campo requerido ausente: 422.
* [ ] **TC-03:** Ruta protegida sin token: 401.
