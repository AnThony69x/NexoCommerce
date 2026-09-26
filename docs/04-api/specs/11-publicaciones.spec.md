# Modulo 11: Publicaciones — Especificacion Tecnica (SDD)

* **Version del contrato:** 1.1.1
* **Fecha:** 2026-09-13
* **Prefijo base:** `/api/v1/publicaciones`
* **Estado:** Aprobado para implementacion
* **Fuente de datos:** `publicaciones`, `publicacion_multimedia`
* **Responsables:** Backend Anthony / Web Nathalia / Movil Emilio / BD Melanie

---

## 1. Proposito y Alcance
Contenido editorial del ADMIN (novedades, promociones). Relacion opcional con `categoria_id` y/o `producto_id`. Imagenes via `publicacion_multimedia` (`orden >= 0`).

---

## 2. Reglas de Negocio e Invariantes
* **RN-PUB-01:** `usuario_id` es el ADMIN autor. FKs de categoria y producto opcionales.
* **RN-PUB-02:** Lectura publica solo `activo = true`. Un token ADMIN valido en las mismas rutas publicas permite ver todas.
* **RN-PUB-03:** Escritura solo ADMIN.
* **RN-PUB-04:** DELETE logico: `activo = false`.
* **RN-PUB-05:** Maximo de 8 imagenes por publicacion, validado por la aplicacion.

---

## 3. Modelo de Datos (PostgreSQL)

### Tabla: `publicaciones`
| Campo | Tipo | Nulo | Descripcion |
| :--- | :--- | :--- | :--- |
| `id` | SERIAL | NO | PK |
| `usuario_id` | INT | NO | FK `usuarios.id` RESTRICT |
| `categoria_id` | INT | SI | FK `categorias.id` SET NULL |
| `producto_id` | INT | SI | FK `productos.id` SET NULL |
| `titulo` | VARCHAR(150) | NO | |
| `descripcion` | TEXT | SI | |
| `activo` | BOOLEAN | NO | Default TRUE |
| `creado_en` | TIMESTAMP | NO | |
| `actualizado_en` | TIMESTAMP | NO | |

### Tabla: `publicacion_multimedia`
| Campo | Tipo | Nulo | Descripcion |
| :--- | :--- | :--- | :--- |
| `publicacion_id` | INT | NO | PK compuesta, CASCADE |
| `multimedia_id` | INT | NO | PK compuesta, CASCADE |
| `orden` | INT | NO | `>= 0` |

---

## 4. Endpoints

### 4.1 Listar (publico)
* **Metodo:** `GET`
* **Ruta:** `/api/v1/publicaciones`

Query: `categoria_id`, `producto_id`, `page`.

Sin token o con rol CLIENTE lista solo activas. Con token ADMIN valido incluye activas e inactivas.

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "titulo": "Nuevos sabores de temporada",
      "descripcion": "Tortas de maracuya.",
      "categoria_id": 2,
      "producto_id": null,
      "activo": true,
      "imagenes": [
        {
          "id": 30,
          "ruta_archivo": "publicaciones/promo.webp",
          "url": "http://192.168.1.50:8001/api/v1/multimedia/publico/publicaciones/promo.webp",
          "orden": 0
        }
      ],
      "creado_en": "2026-09-10T10:00:00.000000Z"
    }
  ],
  "meta": {
    "pagina_actual": 1,
    "por_pagina": 10,
    "total": 1,
    "total_paginas": 1
  }
}
```

---

### 4.2 Detalle (publico si activa)
* **Metodo:** `GET`
* **Ruta:** `/api/v1/publicaciones/{id}`

Inactiva para no-ADMIN: 404 `PUB_NO_ENCONTRADA`. Un token ADMIN valido puede consultarla en esta misma ruta.

---

### 4.3 Crear (ADMIN)
* **Metodo:** `POST`
* **Ruta:** `/api/v1/admin/publicaciones`
* **Autenticacion:** Sanctum
* **Roles autorizados:** ADMIN

```json
{
  "titulo": "Nuevos sabores de temporada",
  "descripcion": "Tortas de maracuya.",
  "categoria_id": 2,
  "producto_id": null,
  "activo": true,
  "imagenes": [
    { "multimedia_id": 30, "orden": 0 }
  ]
}
```

#### Validaciones
* `titulo`: `required|string|max:150`
* `descripcion`: `nullable|string`
* `categoria_id`: `nullable|integer|exists:categorias,id`
* `producto_id`: `nullable|integer|exists:productos,id`
* `activo`: `boolean`
* `imagenes.*.multimedia_id`: `required|integer|exists:multimedia,id`
* `imagenes.*.orden`: `integer|min:0`
* `imagenes`: `array|max:8`; los `multimedia_id` no se repiten

`usuario_id` = autenticado.

---

### 4.4 Actualizar / desactivar (ADMIN)
* **Metodo:** `PUT` `/api/v1/admin/publicaciones/{id}`
* **Metodo:** `DELETE` `/api/v1/admin/publicaciones/{id}` (`activo = false`)

---

## 5. Criterios de Aceptacion
* [ ] **TC-01:** Publicacion sin categoria ni producto es valida.
* [ ] **TC-02:** GET publico no lista `activo = false`.
* [ ] **TC-03:** CLIENTE en POST admin: 403.
* [ ] **TC-04:** Imagenes persisten en `publicacion_multimedia`, no en un campo URL de `publicaciones`.
