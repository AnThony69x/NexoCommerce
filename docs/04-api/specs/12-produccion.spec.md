# Modulo 12: Produccion — Especificacion Tecnica (SDD)

* **Version del contrato:** 1.1.0
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
* **RN-PRD-05:** Si no hay configuracion para esa fecha, la aplicacion puede aceptar el pedido o rechazar (politica: **rechazar** con 400 `PED_SIN_CAPACIDAD` para fechas de tortas/reposteria; documentar en implementacion). Recomendacion: exigir cupo para categorias de Reposteria.
* **RN-PRD-06:** El conteo usa pedidos no `ENTREGADO` con la misma `fecha_entrega`.

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

`ocupado` y `disponible` son calculados, no columnas SQL.

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

Sin configuracion: 404 o `disponible: 0` segun RN-PRD-05.

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

---

### 4.4 Actualizar / desactivar (ADMIN)
* **Metodo:** `PUT` `/api/v1/admin/produccion/{id}`
* **Metodo:** `DELETE` `/api/v1/admin/produccion/{id}` (`activo = false`)

---

## 5. Criterios de Aceptacion
* [ ] **TC-01:** `capacidad_maxima = 0` responde 422.
* [ ] **TC-02:** Pedido cuya suma supera el cupo: 400 `PED_SIN_CAPACIDAD`.
* [ ] **TC-03:** CLIENTE no crea configuracion (403).
* [ ] **TC-04:** GET disponibilidad no inventa campos ajenos al SQL salvo `ocupado`/`disponible` calculados.
