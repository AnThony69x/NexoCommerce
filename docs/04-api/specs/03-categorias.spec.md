# Modulo 03: Categorias — Especificacion Tecnica (SDD)

* **Version del contrato:** 1.1.0
* **Fecha:** 2026-09-13
* **Prefijo base:** `/api/v1/categorias`
* **Estado:** Aprobado para implementacion
* **Fuente de datos:** `database/database.sql` tabla `categorias`
* **Responsables:** Backend Anthony / Web Nathalia / Movil Emilio / BD Melanie

---

## 1. Proposito y Alcance
Arbol de categorias y subcategorias (`categoria_padre_id` autorreferenciada). No existe columna `slug` ni `parent_id`. La imagen es FK `imagen_id` → `multimedia.id`.

Categorias principales previstas por negocio: Reposteria, Detalles, Sublimacion.

---

## 2. Reglas de Negocio e Invariantes
* **RN-CAT-01:** Principal: `categoria_padre_id IS NULL`. Subcategoria: FK a otra categoria.
* **RN-CAT-02:** UNIQUE (`categoria_padre_id`, `nombre`). Nombres de raiz unicos (indice parcial `uq_categoria_raiz_nombre`).
* **RN-CAT-03:** Categoria con productos asociados no se borra: desactivar `activo = false`.
* **RN-CAT-04:** Lectura publica. Escritura solo ADMIN.
* **RN-CAT-05:** `imagen_id` debe existir en `multimedia` o ser null.

---

## 3. Modelo de Datos (PostgreSQL)

### Tabla: `categorias`
| Campo | Tipo | Nulo | Descripcion |
| :--- | :--- | :--- | :--- |
| `id` | SERIAL | NO | PK |
| `categoria_padre_id` | INT | SI | FK `categorias.id` ON DELETE SET NULL |
| `nombre` | VARCHAR(100) | NO | |
| `descripcion` | TEXT | SI | |
| `imagen_id` | INT | SI | FK `multimedia.id` ON DELETE SET NULL |
| `activo` | BOOLEAN | NO | Default TRUE |
| `creado_en` | TIMESTAMP | NO | |
| `actualizado_en` | TIMESTAMP | NO | |

---

## 4. Endpoints

### 4.1 Listar arbol (publico)
* **Metodo:** `GET`
* **Ruta:** `/api/v1/categorias`
* **Autenticacion:** Ninguna

Query opcional: `solo_activas=true` (default true para publico).

#### 200 OK
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "categoria_padre_id": null,
      "nombre": "Sublimacion",
      "descripcion": "Productos personalizables",
      "imagen": {
        "id": 3,
        "ruta_archivo": "categorias/sublimacion.webp",
        "url": "http://192.168.1.50/storage/categorias/sublimacion.webp"
      },
      "activo": true,
      "subcategorias": [
        {
          "id": 4,
          "categoria_padre_id": 1,
          "nombre": "Tazas y Termos",
          "descripcion": null,
          "imagen": null,
          "activo": true,
          "subcategorias": []
        }
      ]
    }
  ]
}
```

---

### 4.2 Crear categoria (ADMIN)
* **Metodo:** `POST`
* **Ruta:** `/api/v1/admin/categorias`
* **Autenticacion:** Sanctum
* **Roles autorizados:** ADMIN

#### Payload
```json
{
  "categoria_padre_id": 1,
  "nombre": "Termos Metalicos",
  "descripcion": "Termos de acero inoxidable",
  "imagen_id": 12,
  "activo": true
}
```

#### Validaciones
* `categoria_padre_id`: `nullable|integer|exists:categorias,id`
* `nombre`: `required|string|max:100`
* `descripcion`: `nullable|string`
* `imagen_id`: `nullable|integer|exists:multimedia,id`
* `activo`: `boolean`

Nombre duplicado en el mismo padre: 422.

#### 201 Created
```json
{
  "success": true,
  "message": "Categoria creada con exito.",
  "data": {
    "id": 6,
    "categoria_padre_id": 1,
    "nombre": "Termos Metalicos",
    "descripcion": "Termos de acero inoxidable",
    "imagen_id": 12,
    "activo": true
  }
}
```

---

### 4.3 Actualizar categoria (ADMIN)
* **Metodo:** `PUT`
* **Ruta:** `/api/v1/admin/categorias/{id}`
* **Autenticacion:** Sanctum
* **Roles autorizados:** ADMIN

Mismo payload que creacion. 200 con mensaje de actualizacion. 404 si no existe.

---

### 4.4 Desactivar categoria (ADMIN)
* **Metodo:** `DELETE`
* **Ruta:** `/api/v1/admin/categorias/{id}`
* **Autenticacion:** Sanctum
* **Roles autorizados:** ADMIN

No borra la fila. Setea `activo = false`. Si tiene productos activos: 400 `CAT_CON_PRODUCTOS`.

#### 200 OK
```json
{
  "success": true,
  "message": "Categoria desactivada."
}
```

---

## 5. Criterios de Aceptacion
* [ ] **TC-01:** GET publico devuelve arbol con `categoria_padre_id` (nunca `parent_id` ni `slug`).
* [ ] **TC-02:** Dos raices con el mismo `nombre` responden 422.
* [ ] **TC-03:** DELETE con productos activos no elimina la fila; responde 400 o desactiva segun RN-CAT-03.
* [ ] **TC-04:** CLIENTE en POST admin recibe 403.
