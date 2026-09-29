# Modulo 06: Pedidos — Especificacion Tecnica (SDD)

* **Version del contrato:** 1.1.1
* **Fecha:** 2026-09-24
* **Prefijo base:** `/api/v1/pedidos`
* **Estado:** Aprobado para implementacion
* **Fuente de datos:** `pedidos`, `detalles_pedido`
* **Responsables:** Backend Anthony / Web Nathalia / Movil Emilio / BD Melanie

---

## 1. Proposito y Alcance
Crear pedidos desde el carrito activo. `fecha_entrega` y `total_esperado` son obligatorios. No hay `direccion_envio`, `codigo`, `telefono_contacto`, `notas` ni `metodo_pago` en `pedidos` (el metodo vive en `pagos`). Los detalles guardan snapshot: `nombre_producto`, precios, `tipo_configuracion`, `nombre_diseno`, `costo_diseno`, `indicaciones`.

Maquina de estados SQL:

```text
PENDIENTE → EN_PREPARACION → LISTO → ENTREGADO
```

No existen estados `pagado`, `enviado`, `cancelado` ni `en_espera_pago`.

---

## 2. Reglas de Negocio e Invariantes
* **RN-PED-01:** Solo usuarios autenticados. CLIENTE crea y ve los propios. ADMIN lista todos y cambia estado.
* **RN-PED-02:** Alta en transaccion: revalidar disponibilidad y configuracion, precio vigente, stock agregado de DETALLE y capacidad (spec 12); copiar items del carrito a `detalles_pedido`, calcular `subtotal`/`total`, descontar stock de DETALLE, crear estado inicial `PENDIENTE` y vaciar `detalles_carrito`. El descuento se realiza una sola vez por producto, bajo bloqueo, y no se revierte al entregar (no existe cancelacion).
* **RN-PED-03:** `fecha_entrega` NOT NULL. No se aceptan fechas pasadas (aplicacion).
* **RN-PED-04:** Secuencia de estados sin saltos. Solo ADMIN hace PATCH de estado.
* **RN-PED-05:** No avanzar a `EN_PREPARACION` si el pedido no tiene un `pagos` en `APROBADO` (spec 07).
* **RN-PED-06:** `subtotal >= 0`, `total >= 0`. `total` = suma de `detalles_pedido.subtotal`.
* **RN-PED-07:** CHECK de configuracion en detalle: a lo sumo una FK de diseño. Snapshot `tipo_configuracion`: `DISENO_TORTA` | `PLANTILLA` | `DISENO_PERSONALIZADO` | null.
* **RN-PED-08:** No hay cancelacion en SQL. Un PENDIENTE sin pago aprobado permanece PENDIENTE.
* **RN-PED-09:** FKs de producto en detalle son RESTRICT; el historial conserva el nombre aunque el catalogo cambie.
* **RN-PED-10:** El cliente envia `total_esperado` como texto decimal de dos posiciones. Si difiere del total vigente, se persisten los precios nuevos en el carrito y se responde 400 `PED_PRECIO_CAMBIADO`; el cliente consulta el carrito y reintenta. No se crea pedido ni se descuenta stock.
* **RN-PED-11:** En diseño personalizado, `nombre_diseno = null` y `tipo_configuracion = DISENO_PERSONALIZADO`. Si hay comentario e indicaciones, `indicaciones` conserva ambos como `Comentario: ...\nDiseño personalizado: ...`; si solo hay uno, se guarda sin prefijo.
* **RN-PED-12:** El detalle muestra el pago de mayor ID o `null`. Las notificaciones se implementaran en Fase 11 (spec 10).

---

## 3. Modelo de Datos (PostgreSQL)

### Tabla: `pedidos`
| Campo | Tipo | Nulo | Descripcion |
| :--- | :--- | :--- | :--- |
| `id` | SERIAL | NO | PK |
| `usuario_id` | INT | NO | FK `usuarios.id` RESTRICT |
| `fecha_entrega` | DATE | NO | |
| `estado` | VARCHAR(50) | NO | Default `PENDIENTE` |
| `subtotal` | DECIMAL(10,2) | NO | |
| `total` | DECIMAL(10,2) | NO | |
| `creado_en` | TIMESTAMP | NO | |
| `actualizado_en` | TIMESTAMP | NO | |

CHECK estado: `PENDIENTE`, `EN_PREPARACION`, `LISTO`, `ENTREGADO`.

### Tabla: `detalles_pedido`
| Campo | Tipo | Nulo | Descripcion |
| :--- | :--- | :--- | :--- |
| `id` | SERIAL | NO | PK |
| `pedido_id` | INT | NO | FK `pedidos.id` CASCADE |
| `producto_id` | INT | NO | FK `productos.id` RESTRICT |
| `nombre_producto` | VARCHAR(150) | NO | Snapshot |
| `cantidad` | INT | NO | `> 0` |
| `precio_unitario` | DECIMAL(10,2) | NO | Snapshot |
| `subtotal` | DECIMAL(10,2) | NO | |
| `tipo_configuracion` | VARCHAR(50) | SI | |
| `nombre_diseno` | VARCHAR(100) | SI | Snapshot |
| `costo_diseno` | DECIMAL(10,2) | NO | Default 0 |
| `indicaciones` | TEXT | SI | Desde comentario o diseño personalizado |
| `diseno_torta_id` | INT | SI | SET NULL |
| `plantilla_diseno_id` | INT | SI | SET NULL |
| `diseno_personalizado_id` | INT | SI | SET NULL |
| `creado_en` | TIMESTAMP | NO | |

---

## 4. Endpoints

### 4.1 Crear pedido desde carrito
* **Metodo:** `POST`
* **Ruta:** `/api/v1/pedidos`
* **Autenticacion:** Sanctum
* **Roles autorizados:** CLIENTE

El body no envia items; se leen del carrito activo.

```json
{
  "fecha_entrega": "2026-10-01",
  "total_esperado": "35.00"
}
```

#### Validaciones
* `fecha_entrega`: `required|date_format:Y-m-d|after_or_equal:today`
* `total_esperado`: texto decimal canonico no negativo, dos posiciones, maximo `99999999.99`; obligatorio.

Carrito vacio: 400 `PED_CARRITO_VACIO`. Item inactivo o configuracion no disponible: 400 `PED_ITEM_NO_DISPONIBLE`. Stock insuficiente: 400 `PED_SIN_STOCK`. Precio cambiado: 400 `PED_PRECIO_CAMBIADO`. Capacidad de produccion excedida: 400 `PED_SIN_CAPACIDAD`. Total fuera del rango DECIMAL(10,2): 400 `PED_TOTAL_INVALIDO`. Las validaciones de body fallan con 422. Ante 400, el carrito permanece y no se descuenta stock; los precios vigentes quedan persistidos.

#### 201 Created
```json
{
  "success": true,
  "message": "Pedido creado. Pendiente de pago.",
  "data": {
    "id": 101,
    "usuario_id": 2,
    "fecha_entrega": "2026-10-01",
    "estado": "PENDIENTE",
    "subtotal": 35.00,
    "total": 35.00,
    "creado_en": "2026-09-13T16:30:00.000000Z"
  }
}
```

Tras crear, el cliente registra el pago (spec 07).

---

### 4.2 Listar pedidos del autenticado
* **Metodo:** `GET`
* **Ruta:** `/api/v1/pedidos`
* **Autenticacion:** Sanctum; solo CLIENTE.

Query: `estado`, `page`.

#### 200 OK
```json
{
  "success": true,
  "data": [
    {
      "id": 101,
      "fecha_entrega": "2026-10-01",
      "estado": "PENDIENTE",
      "total": 35.00,
      "creado_en": "2026-09-13T16:30:00.000000Z"
    }
  ],
  "meta": {
    "pagina_actual": 1,
    "por_pagina": 15,
    "total": 1,
    "total_paginas": 1
  }
}
```

---

### 4.3 Detalle de pedido
* **Metodo:** `GET`
* **Ruta:** `/api/v1/pedidos/{id}`

CLIENTE solo el propio. ADMIN cualquiera. 403 si no es dueño.

```json
{
  "success": true,
  "data": {
    "id": 101,
    "usuario_id": 2,
    "fecha_entrega": "2026-10-01",
    "estado": "PENDIENTE",
    "subtotal": 35.00,
    "total": 35.00,
    "items": [
      {
        "id": 1,
        "producto_id": 15,
        "nombre_producto": "Taza Magica",
        "cantidad": 2,
        "precio_unitario": 14.00,
        "subtotal": 28.00,
        "tipo_configuracion": "PLANTILLA",
        "nombre_diseno": "Floral rosa",
        "costo_diseno": 1.50,
        "indicaciones": null,
        "diseno_torta_id": null,
        "plantilla_diseno_id": 7,
        "diseno_personalizado_id": null
      }
    ],
    "pago": {
      "id": 54,
      "metodo": "TRANSFERENCIA",
      "estado": "PENDIENTE",
      "monto": 35.00
    }
  }
}
```

`pago` puede ser null si aun no se registro; si hay varios pagos, se muestra el de mayor ID.

---

### 4.4 Listar todos (ADMIN)
* **Metodo:** `GET`
* **Ruta:** `/api/v1/admin/pedidos`

Query: `estado`, `fecha_entrega`, `usuario_id`, `page`.

---

### 4.5 Cambiar estado (ADMIN)
* **Metodo:** `PATCH`
* **Ruta:** `/api/v1/admin/pedidos/{id}/estado`

```json
{
  "estado": "EN_PREPARACION"
}
```

#### Validaciones
* `estado`: `required|in:PENDIENTE,EN_PREPARACION,LISTO,ENTREGADO`

Salto, retroceso o repeticion de estado: 400 `PED_ESTADO_INVALIDO`. A `EN_PREPARACION` sin pago `APROBADO`: 400 `PED_PAGO_NO_APROBADO`. La notificacion se incorpora en Fase 11 (spec 10).

---

## 5. Criterios de Aceptacion
* [x] **TC-01:** POST sin `fecha_entrega`: 422.
* [x] **TC-02:** POST no acepta `direccion_envio` como campo requerido.
* [x] **TC-03:** Estado persistido es `PENDIENTE` (mayusculas, sin `pagado`).
* [x] **TC-04:** Detalle copia `nombre_producto` y `costo_diseno` del catalogo al momento de la compra.
* [x] **TC-05:** PATCH de `PENDIENTE` a `LISTO` (salto): 400.
* [x] **TC-06:** CLIENTE no accede a pedido ajeno (403).
* [x] **TC-07:** Precio cambiado persiste en carrito y requiere reconfirmacion; no crea pedido.
* [x] **TC-08:** Crear pedido descuenta stock de DETALLE, guarda snapshot y vacia carrito atomicamente.
* [x] **TC-09:** Dos pedidos concurrentes no exceden stock ni cupo de produccion.
