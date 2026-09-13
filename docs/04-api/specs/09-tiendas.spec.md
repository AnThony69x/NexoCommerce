# Modulo 09: Tienda — Especificacion Tecnica (SDD)

* **Version del contrato:** 1.1.0
* **Fecha:** 2026-09-13
* **Prefijo base:** `/api/v1/tienda`
* **Estado:** Aprobado para implementacion
* **Fuente de datos:** `configuracion_tienda`
* **Responsables:** Backend Anthony / Web Nathalia / Movil Emilio / BD Melanie

---

## 1. Proposito y Alcance
Una fila de configuracion por instalacion (seed inicial: Dulces Aesca). Personaliza identidad visual y datos de contacto sin cambiar codigo. Logo y favicon son URLs/referencias; el binario no esta en PostgreSQL.

No existen en SQL: `lema`, `tipo_negocio`, `moneda_simbolo`, `moneda_codigo`, `permite_pedidos`, `nombre_comercial`.

---

## 2. Reglas de Negocio e Invariantes
* **RN-TND-01:** GET publico para splash / header de Web y Movil.
* **RN-TND-02:** Solo ADMIN altera la fila.
* **RN-TND-03:** `color_primario` y `color_secundario` son NOT NULL.
* **RN-TND-04:** `logo_url` y `favicon_url` son VARCHAR de referencia (pueden originarse en `multimedia.ruta_archivo`).
* **RN-TND-05:** No se crea una segunda instalacion por API; se actualiza el registro existente (`activo = true`).

---

## 3. Modelo de Datos (PostgreSQL)

### Tabla: `configuracion_tienda`
| Campo | Tipo | Nulo | Descripcion |
| :--- | :--- | :--- | :--- |
| `id` | SERIAL | NO | PK |
| `nombre_tienda` | VARCHAR(150) | NO | Seed: Dulces Aesca |
| `logo_url` | VARCHAR(500) | SI | |
| `favicon_url` | VARCHAR(500) | SI | |
| `color_primario` | VARCHAR(20) | NO | Seed `#8B5CF6` |
| `color_secundario` | VARCHAR(20) | NO | Seed `#EC4899` |
| `color_acento` | VARCHAR(20) | SI | `#F59E0B` |
| `color_fondo` | VARCHAR(20) | SI | `#FFF7ED` |
| `color_texto` | VARCHAR(20) | SI | `#1F2937` |
| `telefono` | VARCHAR(20) | SI | |
| `correo` | VARCHAR(150) | SI | |
| `direccion` | VARCHAR(255) | SI | |
| `activo` | BOOLEAN | NO | Default TRUE |
| `creado_en` | TIMESTAMP | NO | |
| `actualizado_en` | TIMESTAMP | NO | |

---

## 4. Endpoints

### 4.1 Obtener configuracion (publico)
* **Metodo:** `GET`
* **Ruta:** `/api/v1/tienda/configuracion`
* **Autenticacion:** Ninguna

Devuelve la fila `activo = true`.

#### 200 OK
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nombre_tienda": "Dulces Aesca",
    "logo_url": "http://192.168.1.50/storage/tienda/logo.png",
    "favicon_url": "http://192.168.1.50/storage/tienda/favicon.ico",
    "color_primario": "#8B5CF6",
    "color_secundario": "#EC4899",
    "color_acento": "#F59E0B",
    "color_fondo": "#FFF7ED",
    "color_texto": "#1F2937",
    "telefono": "0991234567",
    "correo": "hola@dulcesaesca.com",
    "direccion": "Manta, Manabi, Ecuador",
    "activo": true
  }
}
```

---

### 4.2 Actualizar configuracion (ADMIN)
* **Metodo:** `PUT`
* **Ruta:** `/api/v1/admin/tienda/configuracion`
* **Autenticacion:** Sanctum
* **Roles autorizados:** ADMIN

```json
{
  "nombre_tienda": "Dulces Aesca",
  "logo_url": "tienda/logo.png",
  "favicon_url": "tienda/favicon.ico",
  "color_primario": "#8B5CF6",
  "color_secundario": "#EC4899",
  "color_acento": "#F59E0B",
  "color_fondo": "#FFF7ED",
  "color_texto": "#1F2937",
  "telefono": "0998765432",
  "correo": "hola@dulcesaesca.com",
  "direccion": "Manta, Manabi, Ecuador",
  "activo": true
}
```

#### Validaciones
* `nombre_tienda`: `required|string|max:150`
* `logo_url`: `nullable|string|max:500`
* `favicon_url`: `nullable|string|max:500`
* `color_primario`: `required|string|max:20`
* `color_secundario`: `required|string|max:20`
* `color_acento`: `nullable|string|max:20`
* `color_fondo`: `nullable|string|max:20`
* `color_texto`: `nullable|string|max:20`
* `telefono`: `nullable|string|max:20`
* `correo`: `nullable|email|max:150`
* `direccion`: `nullable|string|max:255`
* `activo`: `boolean`

#### 200 OK
```json
{
  "success": true,
  "message": "Configuracion de la tienda actualizada.",
  "data": {
    "id": 1,
    "nombre_tienda": "Dulces Aesca"
  }
}
```

---

## 5. Criterios de Aceptacion
* [ ] **TC-01:** GET publico expone `nombre_tienda` y colores; no `lema` ni `moneda_codigo`.
* [ ] **TC-02:** Seed inicial es Dulces Aesca.
* [ ] **TC-03:** CLIENTE en PUT admin: 403.
* [ ] **TC-04:** PUT sin `color_primario`: 422.
