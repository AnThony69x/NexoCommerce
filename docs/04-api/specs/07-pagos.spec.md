# Modulo 07: Pagos y Comprobantes — Especificacion Tecnica (SDD)

* **Version del contrato:** 1.1.1
* **Fecha:** 2026-09-26
* **Prefijo base:** `/api/v1/pagos`
* **Estado:** Aprobado para implementacion
* **Fuente de datos:** `pagos`, `comprobantes_pago`
* **Responsables:** Backend Anthony / Web Nathalia / Movil Emilio / BD Melanie

---

## 1. Proposito y Alcance
Registrar pagos de un pedido. Metodos SQL: `PASARELA`, `TRANSFERENCIA`. Estados: `PENDIENTE`, `APROBADO`, `RECHAZADO`.

`PASARELA` es la categoria general (PayPhone u otro proveedor). En esta fase solo se registra una referencia y queda `PENDIENTE` para verificacion manual de ADMIN; no se integra un proveedor ni se guardan datos de tarjetas. Una referencia enviada por el cliente no prueba que el cobro haya ocurrido.

La transferencia exige un archivo en `multimedia` y una fila en `comprobantes_pago`. No existe `comprobante_url` ni `metodo_pago` efectivo/tarjeta en el SQL.

---

## 2. Reglas de Negocio e Invariantes
* **RN-PAG-01:** `pedido_id` obligatorio. El pedido debe existir y estar `PENDIENTE`.
* **RN-PAG-02:** `monto` llega como texto decimal canonico de dos posiciones y debe coincidir exactamente, en centavos, con `pedidos.total`. El backend guarda el total del pedido, no un valor arbitrario del cliente.
* **RN-PAG-03:** `metodo` solo `PASARELA` o `TRANSFERENCIA`.
* **RN-PAG-04:** TRANSFERENCIA: `multimedia_id` obligatorio; el archivo debe estar activo, pertenecer al CLIENTE, tener prefijo `comprobantes/` y no estar usado en otro pago. Se inserta `comprobantes_pago`. Estado inicial: `PENDIENTE`.
* **RN-PAG-05:** PASARELA: `referencia_pasarela` obligatoria y no reutilizable, incluso despues de rechazo. No hay comprobante. La referencia no aprueba automaticamente el pago.
* **RN-PAG-06:** ADMIN aprueba o rechaza (`APROBADO` / `RECHAZADO`). En comprobante llena `revisado_por_id`, `fecha_revision`, `comentario_revision`.
* **RN-PAG-07:** Aprobar no cambia `pedidos.estado` a un valor inexistente (`pagado`). Deja el pedido en `PENDIENTE` y habilita el avance a `EN_PREPARACION` (spec 06).
* **RN-PAG-08:** El pedido se considera confirmado para produccion solo con un pago `APROBADO`.
* **RN-PAG-09:** CLIENTE solo paga sus pedidos `PENDIENTE`. Un pedido no admite otro pago si ya tiene uno `PENDIENTE` o `APROBADO`; despues de `RECHAZADO` admite un nuevo intento. El registro se serializa bloqueando el pedido.
* **RN-PAG-10:** Solo un pago `PENDIENTE` puede pasar a `APROBADO` o `RECHAZADO`; no se permite verificar dos veces. `fecha_pago` se fija solo al aprobar. El pedido permanece `PENDIENTE`.
* **RN-PAG-11:** `GET /pedidos/{pedido_id}/pago` devuelve el pago de mayor ID; si no hay ninguno, responde 200 con `data: null`. El dueño o ADMIN puede consultarlo.
* **RN-PAG-12:** Las notificaciones por registro y verificacion se incorporaran en Fase 11 (spec 10).

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
  "monto": "35.00",
  "multimedia_id": 88
}
```

#### Payload PASARELA
```json
{
  "pedido_id": 101,
  "metodo": "PASARELA",
  "monto": "35.00",
  "referencia_pasarela": "PAYPHONE-8874129"
}
```

#### Validaciones
* `pedido_id`: `required|integer|exists:pedidos,id`
* `metodo`: `required|in:PASARELA,TRANSFERENCIA`
* `monto`: texto obligatorio en formato decimal canonico de dos posiciones (maximo `99999999.99`).
* `referencia_pasarela`: `required_if:metodo,PASARELA|prohibited_unless:metodo,PASARELA|nullable|string|max:255`
* `multimedia_id`: `required_if:metodo,TRANSFERENCIA|prohibited_unless:metodo,TRANSFERENCIA|nullable|integer|exists:multimedia,id`

Monto distinto al total: 400 `PAG_MONTO_INVALIDO`. Pedido ajeno o archivo de otro usuario: 403. Pago activo, referencia repetida, archivo invalido o ya usado: 400. `referencia_pasarela` y `multimedia_id` son mutuamente excluyentes segun metodo; el error de body es 422.

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

La notificacion a administradores se implementara en Fase 11 (spec 10).

---

### 4.2 Consultar pago de un pedido
* **Metodo:** `GET`
* **Ruta:** `/api/v1/pedidos/{pedido_id}/pago`
* **Autenticacion:** Sanctum

Dueño o ADMIN. Si el pedido no existe, 404; si es ajeno, 403. Si existe y no tiene pago, responde `{"success": true, "data": null}`. Si hay varios intentos, devuelve el pago de mayor ID.

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

Solo un pago `PENDIENTE` se puede verificar. Si hay comprobante, actualiza `revisado_por_id` (admin autenticado), `fecha_revision` y `comentario_revision`. En PASARELA no existe campo SQL para guardar ese comentario. Si `APROBADO`, setea `pagos.fecha_pago`. El pedido **no** cambia de estado aqui.

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

La notificacion al cliente se implementara en Fase 11 (spec 10).

---

## 5. Criterios de Aceptacion
* [x] **TC-01:** `metodo: tarjeta` o `efectivo` responde 422.
* [x] **TC-02:** TRANSFERENCIA sin `multimedia_id` responde 422.
* [x] **TC-03:** Se inserta fila en `comprobantes_pago`, no un campo URL en `pagos`.
* [x] **TC-04:** Aprobar pago deja `pedidos.estado = PENDIENTE` (nunca `pagado`).
* [x] **TC-05:** Monto distinto a `pedidos.total`: 400.

* [x] **TC-06:** Un pedido sin pago retorna 200 con `data: null`; el CLIENTE no consulta pagos ajenos.
* [x] **TC-07:** Archivo ajeno, inactivo, fuera de `comprobantes/` o reutilizado se rechaza sin inserciones parciales.
* [x] **TC-08:** Pago rechazado permite nuevo intento; referencia PASARELA ya usada no se reutiliza.
* [x] **TC-09:** Dos registros simultaneos del mismo pedido no crean dos pagos activos.
