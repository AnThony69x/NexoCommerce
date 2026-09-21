# Modulo 06: Pedidos — Especificacion Tecnica (SDD)

* **Version del contrato:** 1.1.0
* **Fecha:** 2026-09-13
* **Prefijo base:** `/api/v1/pedidos`
* **Estado:** Aprobado para implementacion
* **Fuente de datos:** `pedidos`, `detalles_pedido`
* **Responsables:** Backend Anthony / Web Nathalia / Movil Emilio / BD Melanie

---

## 1. Proposito y Alcance
Crear pedidos desde el carrito activo. `fecha_entrega` es obligatoria. No hay `direccion_envio`, `codigo`, `telefono_contacto`, `notas` ni `metodo_pago` en `pedidos` (el metodo vive en `pagos`). Los detalles guardan snapshot: `nombre_producto`, precios, `tipo_configuracion`, `nombre_diseno`, `costo_diseno`, `indicaciones`.

Maquina de estados SQL:

```text
PENDIENTE → EN_PREPARACION → LISTO → ENTREGADO
```

No existen estados `pagado`, `enviado`, `cancelado` ni `en_espera_pago`.

---

## 2. Reglas de Negocio e Invariantes
* **RN-PED-01:** Solo usuarios autenticados. CLIENTE crea y ve los propios. ADMIN lista todos y cambia estado.
* **RN-PED-02:** Alta en transaccion: revalidar stock de DETALLE, revalidar capacidad (spec 12), copiar items del carrito a `detalles_pedido`, calcular `subtotal`/`total`, estado inicial `PENDIENTE`, vaciar `detalles_carrito`.
* **RN-PED-03:** `fecha_entrega` NOT NULL. No se aceptan fechas pasadas (aplicacion).
* **RN-PED-04:** Secuencia de estados sin saltos. Solo ADMIN hace PATCH de estado.
* **RN-PED-05:** No avanzar a `EN_PREPARACION` si el pedido no tiene un `pagos` en `APROBADO` (spec 07).
* **RN-PED-06:** `subtotal >= 0`, `total >= 0`. `total` = suma de `detalles_pedido.subtotal`.
* **RN-PED-07:** CHECK de configuracion en detalle: a lo sumo una FK de diseño. Snapshot `tipo_configuracion`: `DISENO_TORTA` | `PLANTILLA` | `DISENO_PERSONALIZADO` | null.
* **RN-PED-08:** No hay cancelacion en SQL. Un PENDIENTE sin pago aprobado permanece PENDIENTE.
* **RN-PED-09:** FKs de producto en detalle son RESTRICT; el historial conserva el nombre aunque el catalogo cambie.

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
  "fecha_entrega": "2026-09-20"
}
```

#### Validaciones
* `fecha_entrega`: `required|date|after_or_equal:today`

Carrito vacio: 400 `PED_CARRITO_VACIO`. Stock insuficiente: 400 `PED_SIN_STOCK`. Capacidad de produccion excedida: 400 `PED_SIN_CAPACIDAD`.

#### 201 Created
```json
{
  "success": true,
  "message": "Pedido creado. Pendiente de pago.",
  "data": {
    "id": 101,
    "usuario_id": 2,
    "fecha_entrega": "2026-09-20",
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
* **Autenticacion:** Sanctum

Query: `estado`, `page`.

#### 200 OK
```json
{
  "success": true,
  "data": [
    {
      "id": 101,
      "fecha_entrega": "2026-09-20",
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
    "fecha_entrega": "2026-09-20",
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

`pago` puede ser null si aun no se registro.

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

Salto de estado: 400 `PED_ESTADO_INVALIDO`. A `EN_PREPARACION` sin pago `APROBADO`: 400 `PED_PAGO_NO_APROBADO`. Dispara notificacion (spec 10).

---

## 5. Criterios de Aceptacion
* [ ] **TC-01:** POST sin `fecha_entrega`: 422.
* [ ] **TC-02:** POST no acepta `direccion_envio` como campo requerido.
* [ ] **TC-03:** Estado persistido es `PENDIENTE` (mayusculas, sin `pagado`).
* [ ] **TC-04:** Detalle copia `nombre_producto` y `costo_diseno` del catalogo al momento de la compra.
* [ ] **TC-05:** PATCH de `PENDIENTE` a `LISTO` (salto): 400.
* [ ] **TC-06:** CLIENTE no accede a pedido ajeno (403).
