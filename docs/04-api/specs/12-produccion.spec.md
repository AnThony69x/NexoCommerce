# Modulo 12: Produccion — Especificacion Tecnica (SDD)

* **Version del contrato:** 1.1.1
* **Fecha:** 2026-09-13
* **Prefijo base:** `/api/v1/produccion`
* **Estado:** Aprobado para implementacion
* **Fuente de datos:** `configuracion_produccion`
* **Responsables:** Backend Anthony / Web Nathalia / Movil Emilio / BD Melanie

---

## 1. Proposito y Alcance
Capacidad maxima de produccion por `fecha` y `categoria_id` opcional. Al crear un pedido (spec 06) el backend suma cantidades de items cuya categoria coincida (o aplica el cupo global de esa fecha si `categoria_id` es NULL) y rechaza si se supera `capacidad_maxima`.

---

## 2. Reglas de Negocio e Invariantes
* **RN-PRD-01:** `capacidad_maxima > 0`.
* **RN-PRD-02:** `categoria_id` NULL = cupo para toda la fecha.
* **RN-PRD-03:** Solo filas `activo = true` participan en la validacion.
* **RN-PRD-04:** Escritura solo ADMIN. Lectura: ADMIN (gestion) y, en checkout, el backend consulta internamente.
* **RN-PRD-05:** Sin configuracion aplicable, disponibilidad responde 404 `PRD_CAPACIDAD_NO_CONFIGURADA`. En pedidos, una TORTA sin cupo global ni especifico se rechaza con 400 `PED_SIN_CAPACIDAD`; otros tipos pueden continuar.
* **RN-PRD-06:** El conteo usa pedidos no `ENTREGADO` con la misma `fecha_entrega`.
* **RN-PRD-07:** Cupo global y cupo especifico se aplican simultaneamente; se muestra el mas restrictivo. La categoria coincide exactamente, sin incluir descendientes.
* **RN-PRD-08:** Solo puede existir una configuracion activa por fecha y categoria, considerando `categoria_id = NULL` como cupo global.

---

## 3. Modelo de Datos (PostgreSQL)

### Tabla: `configuracion_produccion`
| Campo | Tipo | Nulo | Descripcion |
| :--- | :--- | :--- | :--- |
| `id` | SERIAL | NO | PK |
| `fecha` | DATE | NO | Fecha de entrega/produccion |
| `categoria_id` | INT | SI | FK `categorias.id` RESTRICT |
| `capacidad_maxima` | INT | NO | `> 0` |
| `activo` | BOOLEAN | NO | Default TRUE |
| `creado_en` | TIMESTAMP | NO | |
| `actualizado_en` | TIMESTAMP | NO | |

---

## 4. Endpoints

### 4.1 Listar (ADMIN)
* **Metodo:** `GET`
* **Ruta:** `/api/v1/admin/produccion`
* **Autenticacion:** Sanctum
* **Roles autorizados:** ADMIN

Query: `fecha`, `categoria_id`, `activo`.

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "fecha": "2026-09-20",
      "categoria_id": 2,
      "capacidad_maxima": 15,
      "activo": true,
      "ocupado": 4,
      "disponible": 11
    }
  ]
}
```

`ocupado` y `disponible` son calculados, no columnas SQL. `disponible = max(0, capacidad_maxima - ocupado)`.

---

### 4.2 Consulta publica de disponibilidad
* **Metodo:** `GET`
* **Ruta:** `/api/v1/produccion/disponibilidad`
* **Autenticacion:** Ninguna o Sanctum

Query requerido: `fecha`. Opcional: `categoria_id`.

Sirve al calendario de Web/Movil antes del checkout.

```json
{
  "success": true,
  "data": {
    "fecha": "2026-09-20",
    "categoria_id": 2,
    "capacidad_maxima": 15,
    "ocupado": 4,
    "disponible": 11
  }
}
```

Sin configuracion aplicable: 404 `PRD_CAPACIDAD_NO_CONFIGURADA`. Con categoria se evaluan el cupo global y el especifico y se devuelve el mas restrictivo; sin categoria se consulta el global.

---

### 4.3 Crear (ADMIN)
* **Metodo:** `POST`
* **Ruta:** `/api/v1/admin/produccion`

```json
{
  "fecha": "2026-09-20",
  "categoria_id": 2,
  "capacidad_maxima": 15,
  "activo": true
}
```

#### Validaciones
* `fecha`: `required|date`
* `categoria_id`: `nullable|integer|exists:categorias,id`
* `capacidad_maxima`: `required|integer|min:1`
* `activo`: `boolean`

Crear o reactivar una configuracion activa duplicada para la misma fecha y categoria responde 422 `PRD_CONFIG_DUPLICADA`.

---

### 4.4 Actualizar / desactivar (ADMIN)
* **Metodo:** `PUT` `/api/v1/admin/produccion/{id}`
* **Metodo:** `DELETE` `/api/v1/admin/produccion/{id}` (`activo = false`)

PUT conserva campos omitidos.

---

## 5. Criterios de Aceptacion
* [ ] **TC-01:** `capacidad_maxima = 0` responde 422.
* [ ] **TC-02:** Pedido cuya suma supera el cupo: 400 `PED_SIN_CAPACIDAD`.
* [ ] **TC-03:** CLIENTE no crea configuracion (403).
* [ ] **TC-04:** GET disponibilidad no inventa campos ajenos al SQL salvo `ocupado`/`disponible` calculados.
