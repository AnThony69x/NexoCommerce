# Módulo 08: Multimedia y Servidor de Archivos — Especificación Técnica (SDD)

* **Versión del contrato:** 1.0.0
* **Prefijo base:** `/api/v1/multimedia`
* **Mecanismo:** Laravel Sanctum (Subida) / Público (Lectura directa vía NGINX o Servidor de Archivos)
* **Nodo responsable:** Emilio (Laptop 5 — File Server Linux) + Anthony (Backend)
* **Estado:** Aprobado para revisión

---

## 1. Propósito y Alcance
Permite la subida, almacenamiento y obtención de URLs públicas de archivos multimedia (imágenes de productos, comprobantes de pago, diseños subidos por los clientes para personalización).

---

## 2. Reglas de Negocio
* **RN-MED-01:** Formatos permitidos de imagen: `jpg`, `jpeg`, `png`, `webp`.
* **RN-MED-02:** Formato adicional permitido para comprobantes: `pdf`.
* **RN-MED-03:** Tamaño máximo permitido: 5 MB (5120 KB).
* **RN-MED-04:** El backend procesa el archivo y lo transfiere al servidor de archivos central o disco remoto en Laptop 5, devolviendo la URL pública accesible por los clientes.

---

## 3. Endpoints

### 3.1 Subida de Archivo Multimedia
* **Método:** `POST`
* **Ruta:** `/api/v1/multimedia/subir`
* **Cabecera:** `Content-Type: multipart/form-data`
* **Autenticación:** `Bearer <token>`

#### Form Data
| Campo | Tipo | Requerido | Descripción |
| :--- | :--- | :--- | :--- |
| `archivo` | File (Binario) | Sí | Archivo imagen o PDF |
| `carpeta` | String | Sí | Destino: `productos`, `comprobantes`, `personalizaciones` |

#### Validaciones
* `archivo`: `required|file|mimes:jpeg,png,jpg,webp,pdf|max:5120`
* `carpeta`: `required|string|in:productos,comprobantes,personalizaciones,tienda`

#### Respuesta 201 Created
```json
{
  "success": true,
  "message": "Archivo subido correctamente al servidor de archivos.",
  "data": {
    "nombre_original": "foto_taza.png",
    "nombre_guardado": "productos/20260908_64f8a12bc9.webp",
    "url": "http://192.168.1.50/storage/productos/20260908_64f8a12bc9.webp",
    "tamanio_bytes": 1048576,
    "mime_type": "image/webp"
  }
}
```
