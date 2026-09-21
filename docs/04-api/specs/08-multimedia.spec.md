# Modulo 08: Multimedia — Especificacion Tecnica (SDD)

* **Version del contrato:** 1.1.0
* **Fecha:** 2026-09-13
* **Prefijo base:** `/api/v1/multimedia`
* **Estado:** Aprobado para implementacion
* **Fuente de datos:** `multimedia`
* **Nodo de archivos:** Laptop 5 (referencia de ruta; PostgreSQL no guarda el binario)
* **Responsables:** Backend Anthony / Web Nathalia / Movil Emilio / BD Melanie

---

## 1. Proposito y Alcance
Repositorio central. Todas las imagenes (productos, categorias, diseños, comprobantes, publicaciones, logo) apuntan a `multimedia.id`. El JSON de subida **debe devolver `id`** para usarlo como FK (`imagen_id`, `multimedia_id`).

Columnas reales: `nombre_archivo`, `ruta_archivo`, `tipo_mime`, `tamano_bytes`, `ancho`, `alto`, `activo`, `subido_por_id`. No hay `url` persistida; la URL publica se construye en la API a partir de `ruta_archivo`.

---

## 2. Reglas de Negocio e Invariantes
* **RN-MED-01:** Imagenes: `jpg`, `jpeg`, `png`, `webp`. Comprobantes: esos mas `pdf`.
* **RN-MED-02:** Tamano maximo 5 MB (`tamano_bytes >= 0` en SQL; tope en aplicacion).
* **RN-MED-03:** `ancho`/`alto` si existen deben ser `> 0`.
* **RN-MED-04:** `subido_por_id` = usuario autenticado. Lectura de metadatos autenticada; el archivo se sirve por NGINX/file server.
* **RN-MED-05:** No borrar fisicamente si hay FK RESTRICT (comprobantes, diseños personalizados). Desactivar `activo = false`.
* **RN-MED-06:** Prefijos de `ruta_archivo` segun destino: `productos/`, `comprobantes/`, `personalizaciones/`, `tienda/`, `categorias/`, `publicaciones/`, `disenos/`.

---

## 3. Modelo de Datos (PostgreSQL)

### Tabla: `multimedia`
| Campo | Tipo | Nulo | Descripcion |
| :--- | :--- | :--- | :--- |
| `id` | SERIAL | NO | PK |
| `nombre_archivo` | VARCHAR(255) | NO | Nombre original o guardado |
| `ruta_archivo` | VARCHAR(500) | NO | Ruta relativa en el file server |
| `tipo_mime` | VARCHAR(100) | NO | |
| `tamano_bytes` | BIGINT | NO | `>= 0` |
| `ancho` | INT | SI | `> 0` si no null |
| `alto` | INT | SI | `> 0` si no null |
| `activo` | BOOLEAN | NO | Default TRUE |
| `subido_por_id` | INT | SI | FK `usuarios.id` SET NULL |
| `creado_en` | TIMESTAMP | NO | |
| `actualizado_en` | TIMESTAMP | NO | |

---

## 4. Endpoints

### 4.1 Subir archivo
* **Metodo:** `POST`
* **Ruta:** `/api/v1/multimedia`
* **Cabecera:** `Content-Type: multipart/form-data`
* **Autenticacion:** Sanctum
* **Roles autorizados:** CLIENTE, ADMIN

#### Form Data
| Campo | Tipo | Requerido | Descripcion |
| :--- | :--- | :--- | :--- |
| `archivo` | File | Si | Imagen o PDF |
| `destino` | String | Si | Prefijo de ruta |

#### Validaciones
* `archivo`: `required|file|mimes:jpeg,png,jpg,webp,pdf|max:5120`
* `destino`: `required|in:productos,comprobantes,personalizaciones,tienda,categorias,publicaciones,disenos`

PDF solo si `destino=comprobantes`.

#### 201 Created
```json
{
  "success": true,
  "message": "Archivo registrado.",
  "data": {
    "id": 44,
    "nombre_archivo": "foto_taza.png",
    "ruta_archivo": "personalizaciones/20260913_64f8a12bc9.webp",
    "tipo_mime": "image/webp",
    "tamano_bytes": 1048576,
    "ancho": 1200,
    "alto": 1200,
    "activo": true,
    "subido_por_id": 2,
    "url": "http://192.168.1.50/storage/personalizaciones/20260913_64f8a12bc9.webp"
  }
}
```

`url` es calculada, no columna SQL.

---

### 4.2 Obtener metadatos
* **Metodo:** `GET`
* **Ruta:** `/api/v1/multimedia/{id}`
* **Autenticacion:** Sanctum

404 si no existe o `activo = false`.

---

### 4.3 Desactivar (ADMIN o dueño)
* **Metodo:** `DELETE`
* **Ruta:** `/api/v1/multimedia/{id}`

`activo = false`. Si FK RESTRICT lo impide: 400 `MED_EN_USO`.

---

## 5. Criterios de Aceptacion
* [ ] **TC-01:** 201 incluye `id` numerico usable como `multimedia_id`.
* [ ] **TC-02:** Archivo > 5 MB: 422.
* [ ] **TC-03:** Inserta fila en `multimedia` con `subido_por_id` del token.
* [ ] **TC-04:** Respuesta usa `tamano_bytes` y `tipo_mime`, no `tamanio_bytes` / `mime_type`.
