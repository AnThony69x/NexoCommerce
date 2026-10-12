# Modulo 10: Notificaciones — Especificacion Tecnica (SDD)

* **Version del contrato:** 1.1.0
* **Fecha:** 2026-09-13
* **Prefijo base:** `/api/v1/notificaciones`
* **Estado:** Aprobado para implementacion
* **Fuente de datos:** `notificaciones`
* **Responsables:** Backend Anthony / Web Nathalia / Movil Emilio / BD Melanie

---

## 1. Proposito y Alcance
Buzon persistente. FKs opcionales `pedido_id` y `pago_id` (no hay `referencia_id` generico). `leida` y `fecha_lectura` marcan lectura.

---

## 2. Reglas de Negocio e Invariantes
* **RN-NOT-01:** El cliente recibe avisos cuando: se crea su pedido; su pago pasa a `APROBADO` o `RECHAZADO`; su pedido cambia a `EN_PREPARACION`, `LISTO` o `ENTREGADO`.
* **RN-NOT-02:** Cada ADMIN activo recibe avisos cuando: hay un pedido nuevo; un cliente registra un pago `PENDIENTE` (comprobante).
* **RN-NOT-03:** `tipo` es VARCHAR(50). Valores de aplicacion:
  * `PEDIDO_CREADO`
  * `PEDIDO_EN_PREPARACION`
  * `PEDIDO_LISTO`
  * `PEDIDO_ENTREGADO`
  * `PAGO_REGISTRADO`
  * `PAGO_APROBADO`
  * `PAGO_RECHAZADO`
* **RN-NOT-04:** Un usuario solo lista y marca las suyas (`usuario_id`).
* **RN-NOT-05:** Marcar leida setea `leida = true` y `fecha_lectura = now()`. Idempotente.
* **RN-NOT-06:** Pedido, pago o cambio de estado y sus avisos se insertan en la misma transaccion. Si falla un aviso, se revierte toda la operacion. No se encolan estos listeners.
* **RN-NOT-07:** `PAGO_REGISTRADO` se envia a cada ADMIN activo para pagos `PENDIENTE` de `TRANSFERENCIA` y `PASARELA`. No se envia al CLIENTE.
* **RN-NOT-08:** La lectura repetida conserva la primera `fecha_lectura`. `leer-todas` cambia solo las no leidas del usuario y devuelve cuantas actualizo.

No se notifica un estado `enviado` porque no existe en `pedidos`.

---

## 3. Modelo de Datos (PostgreSQL)

### Tabla: `notificaciones`
| Campo | Tipo | Nulo | Descripcion |
| :--- | :--- | :--- | :--- |
| `id` | SERIAL | NO | PK |
| `usuario_id` | INT | NO | FK `usuarios.id` CASCADE |
| `pedido_id` | INT | SI | FK `pedidos.id` SET NULL |
| `pago_id` | INT | SI | FK `pagos.id` SET NULL |
| `tipo` | VARCHAR(50) | NO | |
| `titulo` | VARCHAR(150) | NO | |
| `mensaje` | TEXT | NO | |
| `leida` | BOOLEAN | NO | Default FALSE |
| `fecha_lectura` | TIMESTAMP | SI | |
| `creado_en` | TIMESTAMP | NO | |

---

## 4. Endpoints

### 4.1 Listar
* **Metodo:** `GET`
* **Ruta:** `/api/v1/notificaciones`
* **Autenticacion:** Sanctum

Query: `leida` (boolean), `page`.

Orden: `creado_en` descendente, con `id` descendente para desempatar. `page` comienza en 1. `meta.total_no_leidas` cuenta todas las no leidas del usuario, sin aplicar `leida` ni `page`.

#### 200 OK
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "usuario_id": 2,
      "pedido_id": 101,
      "pago_id": 54,
      "tipo": "PAGO_APROBADO",
      "titulo": "Pago verificado",
      "mensaje": "Tu pago del pedido 101 fue aprobado.",
      "leida": false,
      "fecha_lectura": null,
      "creado_en": "2026-09-13T11:20:00.000000Z"
    }
  ],
  "meta": {
    "pagina_actual": 1,
    "por_pagina": 20,
    "total": 1,
    "total_paginas": 1,
    "total_no_leidas": 1
  }
}
```

---

### 4.2 Marcar leida
* **Metodo:** `PATCH`
* **Ruta:** `/api/v1/notificaciones/{id}/leida`
* **Autenticacion:** Sanctum

Ajena: 403. Inexistente: 404.

#### 200 OK
```json
{
  "success": true,
  "message": "Notificacion marcada como leida.",
  "data": {
    "id": 1,
    "leida": true,
    "fecha_lectura": "2026-09-13T12:00:00.000000Z"
  }
}
```

---

### 4.3 Marcar todas leidas
* **Metodo:** `PATCH`
* **Ruta:** `/api/v1/notificaciones/leer-todas`
* **Autenticacion:** Sanctum

Actualiza todas las no leidas del usuario.

#### 200 OK
```json
{
  "success": true,
  "message": "Notificaciones marcadas como leidas.",
  "data": { "actualizadas": 3 }
}
```

---

## 5. Criterios de Aceptacion
* [x] **TC-01:** El JSON usa `pedido_id` y `pago_id`, no `referencia_id`.
* [x] **TC-02:** Crear pedido inserta notificacion `PEDIDO_CREADO` al cliente y a ADMIN.
* [x] **TC-03:** PATCH leida de otra persona: 403.
* [x] **TC-04:** `tipo` de pago aprobado es `PAGO_APROBADO`, no `pago_aprobado`.
