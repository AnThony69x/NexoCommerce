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
* **RN-MED-04:** `subido_por_id` = usuario autenticado. Los metadatos exigen Sanctum; los de `comprobantes/` y `personalizaciones/` solo son visibles para su dueño o ADMIN.
* **RN-MED-05:** No borrar fisicamente si hay FK RESTRICT (comprobantes, diseños personalizados). Desactivar `activo = false`.
* **RN-MED-06:** Prefijos de `ruta_archivo` segun destino: `productos/`, `comprobantes/`, `personalizaciones/`, `tienda/`, `categorias/`, `publicaciones/`, `disenos/`.
* **RN-MED-07:** En la integracion temporal por LAN, los binarios se guardan en un directorio persistente compartido por ambos contenedores. `productos/`, `categorias/`, `tienda/`, `publicaciones/` y `disenos/` son imagenes publicas; `comprobantes/` y `personalizaciones/` requieren Sanctum y autorizacion de dueño o ADMIN. La ruta solicitada se compara con una fila activa antes de leer el binario.
* **RN-MED-08:** `url` es publica solo para los cinco destinos publicos. En un archivo privado devuelve `null`; web y movil usan `GET /api/v1/multimedia/{id}/archivo` con token. `MULTIMEDIA_PUBLIC_BASE_URL` apunta al origen LAN mas `/api/v1/multimedia/publico` y luego se concatena `ruta_archivo`.
* **RN-MED-09:** Solo ADMIN sube archivos a destinos publicos. CLIENTE solo sube a `comprobantes` o `personalizaciones`; intentar un destino publico responde 403.

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

ADMIN puede usar todos los destinos; CLIENTE solo `comprobantes` y `personalizaciones`.

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
    "url": null
  }
}
```

`url` es calculada, no columna SQL.

---

### 4.2 Obtener metadatos
* **Metodo:** `GET`
* **Ruta:** `/api/v1/multimedia/{id}`
* **Autenticacion:** Sanctum

404 si no existe o `activo = false`. Metadatos privados ajenos: 403.

### 4.3 Leer imagen publica
* **Metodo:** `GET`
* **Ruta:** `/api/v1/multimedia/publico/{ruta}` (por ejemplo `productos/20260926_abcd.png`)
* **Autenticacion:** Publica

Devuelve bytes con el MIME registrado solo si la ruta pertenece a un destino publico, tiene formato de nombre seguro, existe en `multimedia` con `activo = true` y el archivo esta en el disco. En los demas casos: 404. No se sirven comprobantes ni personalizaciones por esta ruta.

### 4.4 Descargar archivo privado
* **Metodo:** `GET`
* **Ruta:** `/api/v1/multimedia/{id}/archivo`
* **Autenticacion:** Sanctum

Sirve unicamente `comprobantes/` o `personalizaciones/` al usuario `subido_por_id` o a ADMIN. Ajeno: 403; inexistente, inactivo o binario ausente: 404. Se devuelve el MIME registrado y `Cache-Control: no-store`.

---

### 4.5 Desactivar (ADMIN o dueño)
* **Metodo:** `DELETE`
* **Ruta:** `/api/v1/multimedia/{id}`

`activo = false`. Si FK RESTRICT lo impide: 400 `MED_EN_USO`.

---

## 5. Criterios de Aceptacion
* [x] **TC-01:** 201 incluye `id` numerico usable como `multimedia_id`.
* [x] **TC-02:** Archivo > 5 MB: 422.
* [x] **TC-03:** Inserta fila en `multimedia` con `subido_por_id` del token.
* [x] **TC-04:** Respuesta usa `tamano_bytes` y `tipo_mime`, no `tamanio_bytes` / `mime_type`.
* [x] **TC-05:** Imagen publica activa devuelve bytes sin token; ruta privada, inactiva, ausente o con MIME no permitido devuelve 404.
* [x] **TC-06:** Archivo privado exige token y devuelve 403 a usuario ajeno; dueño y ADMIN pueden descargarlo.
* [x] **TC-07:** CLIENTE no puede subir a destinos publicos; ADMIN si puede.
* [x] **TC-08:** Archivo subido por backend-1 se lee identico desde backend-2 mediante el volumen compartido.
