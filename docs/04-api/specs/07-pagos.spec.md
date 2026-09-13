# Modulo 07: Pagos y Comprobantes — Especificacion Tecnica (SDD)

* **Version del contrato:** 1.1.0
* **Fecha:** 2026-09-13
* **Prefijo base:** `/api/v1/pagos`
* **Estado:** Aprobado para implementacion
* **Fuente de datos:** `pagos`, `comprobantes_pago`
* **Responsables:** Backend Anthony / Web Nathalia / Movil Emilio / BD Melanie

---

## 1. Proposito y Alcance
Registrar pagos de un pedido. Metodos SQL: `PASARELA`, `TRANSFERENCIA`. Estados: `PENDIENTE`, `APROBADO`, `RECHAZADO`.

`PASARELA` es la categoria general (PayPhone u otro proveedor). No se guardan datos de tarjetas.

La transferencia exige un archivo en `multimedia` y una fila en `comprobantes_pago`. No existe `comprobante_url` ni `metodo_pago` efectivo/tarjeta en el SQL.

---

## 2. Reglas de Negocio e Invariantes
* **RN-PAG-01:** `pedido_id` obligatorio. El pedido debe existir y estar `PENDIENTE`.
* **RN-PAG-02:** `monto` debe coincidir con `pedidos.total`.
* **RN-PAG-03:** `metodo` solo `PASARELA` o `TRANSFERENCIA`.
* **RN-PAG-04:** TRANSFERENCIA: `multimedia_id` obligatorio; se inserta `comprobantes_pago`. Estado inicial del pago: `PENDIENTE`.
* **RN-PAG-05:** PASARELA: `referencia_pasarela` se llena con la referencia del proveedor. No hay comprobante.
* **RN-PAG-06:** ADMIN aprueba o rechaza (`APROBADO` / `RECHAZADO`). En comprobante llena `revisado_por_id`, `fecha_revision`, `comentario_revision`.
* **RN-PAG-07:** Aprobar no cambia `pedidos.estado` a un valor inexistente (`pagado`). Deja el pedido en `PENDIENTE` y habilita el avance a `EN_PREPARACION` (spec 06).
* **RN-PAG-08:** El pedido se considera confirmado para produccion solo con un pago `APROBADO`.
* **RN-PAG-09:** CLIENTE solo paga sus pedidos. Un pedido no admite un segundo pago `PENDIENTE` o `APROBADO` simultaneo (aplicacion).

---

## 3. Modelo de Datos (PostgreSQL)

### Tabla: `pagos`
| Campo | Tipo | Nulo | Descripcion |
| :--- | :--- | :--- | :--- |
| `id` | SERIAL | NO | PK |
| `pedido_id` | INT | NO | FK `pedidos.id` CASCADE |
| `metodo` | VARCHAR(50) | NO | `PASARELA` / `TRANSFERENCIA` |
| `estado` | VARCHAR(50) | NO | Default `PENDIENTE` |
| `monto` | DECIMAL(10,2) | NO | `>= 0` |
| `referencia_pasarela` | VARCHAR(255) | SI | |
| `fecha_pago` | TIMESTAMP | SI | |
| `creado_en` | TIMESTAMP | NO | |
| `actualizado_en` | TIMESTAMP | NO | |

### Tabla: `comprobantes_pago`
| Campo | Tipo | Nulo | Descripcion |
| :--- | :--- | :--- | :--- |
| `id` | SERIAL | NO | PK |
| `pago_id` | INT | NO | FK `pagos.id` CASCADE |
| `multimedia_id` | INT | NO | FK `multimedia.id` RESTRICT |
| `revisado_por_id` | INT | SI | FK `usuarios.id` SET NULL |
| `fecha_revision` | TIMESTAMP | SI | |
| `comentario_revision` | TEXT | SI | |
| `creado_en` | TIMESTAMP | NO | |

---

## 4. Endpoints

### 4.1 Registrar pago (CLIENTE)
* **Metodo:** `POST`
* **Ruta:** `/api/v1/pagos`
* **Autenticacion:** Sanctum
* **Roles autorizados:** CLIENTE

El archivo de transferencia se sube antes (spec 08, carpeta `comprobantes`).

#### Payload TRANSFERENCIA
```json
{
  "pedido_id": 101,
  "metodo": "TRANSFERENCIA",
  "monto": 35.00,
  "multimedia_id": 88
}
```

#### Payload PASARELA
```json
{
  "pedido_id": 101,
  "metodo": "PASARELA",
  "monto": 35.00,
  "referencia_pasarela": "PAYPHONE-8874129"
}
```

#### Validaciones
* `pedido_id`: `required|integer|exists:pedidos,id`
* `metodo`: `required|in:PASARELA,TRANSFERENCIA`
* `monto`: `required|numeric|min:0`
* `referencia_pasarela`: `required_if:metodo,PASARELA|nullable|string|max:255`
* `multimedia_id`: `required_if:metodo,TRANSFERENCIA|nullable|integer|exists:multimedia,id`

Monto distinto al total: 400 `PAG_MONTO_INVALIDO`. Pedido ajeno: 403.

#### 201 Created
```json
{
  "success": true,
  "message": "Pago registrado. En espera de verificacion.",
  "data": {
    "id": 54,
    "pedido_id": 101,
    "metodo": "TRANSFERENCIA",
    "estado": "PENDIENTE",
    "monto": 35.00,
    "referencia_pasarela": null,
    "comprobante": {
      "id": 12,
      "multimedia_id": 88,
      "revisado_por_id": null
    }
  }
}
```

Notifica a administradores (spec 10).

---

### 4.2 Consultar pago de un pedido
* **Metodo:** `GET`
* **Ruta:** `/api/v1/pedidos/{pedido_id}/pago`
* **Autenticacion:** Sanctum

Dueño o ADMIN.

---

### 4.3 Verificar pago (ADMIN)
* **Metodo:** `PATCH`
* **Ruta:** `/api/v1/admin/pagos/{id}/verificar`
* **Autenticacion:** Sanctum
* **Roles autorizados:** ADMIN

```json
{
  "estado": "APROBADO",
  "comentario_revision": "Transferencia acreditada."
}
```

#### Validaciones
* `estado`: `required|in:APROBADO,RECHAZADO`
* `comentario_revision`: `nullable|string`

Si hay comprobante, actualiza `revisado_por_id` (admin autenticado) y `fecha_revision`. Si `APROBADO`, setea `pagos.fecha_pago`. El pedido **no** cambia de estado aqui.

#### 200 OK
```json
{
  "success": true,
  "message": "Pago actualizado.",
  "data": {
    "id": 54,
    "pedido_id": 101,
    "estado": "APROBADO",
    "pedido_estado": "PENDIENTE"
  }
}
```

Notifica al cliente (spec 10).

---

## 5. Criterios de Aceptacion
* [ ] **TC-01:** `metodo: tarjeta` o `efectivo` responde 422.
* [ ] **TC-02:** TRANSFERENCIA sin `multimedia_id` responde 422.
* [ ] **TC-03:** Se inserta fila en `comprobantes_pago`, no un campo URL en `pagos`.
* [ ] **TC-04:** Aprobar pago deja `pedidos.estado = PENDIENTE` (nunca `pagado`).
* [ ] **TC-05:** Monto distinto a `pedidos.total`: 400.
