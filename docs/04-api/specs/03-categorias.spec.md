# Módulo 03: Categorías y Subcategorías — Especificación Técnica (SDD)

* **Versión del contrato:** 1.0.0
* **Prefijo base:** `/api/v1/categorias`
* **Mecanismo:** Lectura pública / Escritura protegida por rol `administrador`
* **Estado:** Aprobado para revisión

---

## 1. Propósito y Alcance
Organizar el catálogo de NexoCommerce en una estructura jerárquica (categorías padre y subcategorías) para permitir la parametrización de cualquier modelo de negocio (ej. *Repostería -> Pasteles, Bocaditos*; o *Sublimación -> Tazas, Camisetas*).

---

## 2. Reglas de Negocio
* **RN-CAT-01:** Las categorías pueden ser principales (`parent_id = null`) o subcategorías (`parent_id != null`).
* **RN-CAT-02:** El slug de la categoría debe ser único y auto-generado a partir del nombre.
* **RN-CAT-03:** Una categoría que tiene productos asociados no puede eliminarse físicamente, solo desactivarse (`activo = false`).
* **RN-CAT-04:** La lectura del catálogo de categorías es pública (no requiere autenticación).

---

## 3. Endpoints

### 3.1 Listar Árbol de Categorías (Público)
* **Método:** `GET`
* **Ruta:** `/api/v1/categorias`
* **Autenticación:** Ninguna

#### Respuesta 200 OK
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "Sublimación y Estampados",
      "slug": "sublimacion-y-estampados",
      "descripcion": "Productos personalizables para eventos y regalos",
      "imagen_url": "http://192.168.1.50/storage/categorias/sublimacion.jpg",
      "activo": true,
      "subcategorias": [
        {
          "id": 4,
          "parent_id": 1,
          "nombre": "Tazas y Termos",
          "slug": "tazas-y-termos",
          "activo": true
        },
        {
          "id": 5,
          "parent_id": 1,
          "nombre": "Camisetas y Gorras",
          "slug": "camisetas-y-gorras",
          "activo": true
        }
      ]
    }
  ]
}
```

---

### 3.2 Crear Categoría / Subcategoría (Admin)
* **Método:** `POST`
* **Ruta:** `/api/v1/admin/categorias`
* **Autenticación:** `Bearer <token>` (Rol: `administrador`)

#### Request Body
```json
{
  "parent_id": 1,
  "nombre": "Termos Metálicos",
  "descripcion": "Termos de acero inoxidable para sublimación",
  "imagen_url": "http://192.168.1.50/storage/categorias/termos.jpg",
  "activo": true
}
```

#### Validaciones
* `parent_id`: `nullable|integer|exists:categorias,id`
* `nombre`: `required|string|max:100`
* `descripcion`: `nullable|string|max:500`
* `imagen_url`: `nullable|url`
* `activo`: `boolean`

#### Respuesta 201 Created
```json
{
  "success": true,
  "message": "Categoría creada con éxito.",
  "data": {
    "id": 6,
    "parent_id": 1,
    "nombre": "Termos Metálicos",
    "slug": "termos-metalicos",
    "activo": true
  }
}
```

---

### 3.3 Modificar Categoría (Admin)
* **Método:** `PUT`
* **Ruta:** `/api/v1/admin/categorias/{id}`
* **Autenticación:** `Bearer <token>` (Rol: `administrador`)

#### Respuesta 200 OK
```json
{
  "success": true,
  "message": "Categoría actualizada con éxito."
}
```
