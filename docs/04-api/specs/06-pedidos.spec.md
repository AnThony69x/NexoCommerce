# Módulo 06: Pedidos — Especificación Técnica (SDD)

* **Versión del contrato:** 1.0.0
* **Prefijo base:** `/api/v1/pedidos`
* **Mecanismo:** Laravel Sanctum
* **Estado:** Aprobado para implementación

---

## 1. Propósito y Alcance
Gestiona la creación de órdenes a partir del carrito de compra o compra directa, el cálculo de totales, la reserva de stock y el seguimiento del estado del pedido a lo largo de su ciclo de vida.

---

## 2. Reglas de Negocio
* **RN-PED-01:** Solo los usuarios autenticados pueden crear pedidos.
* **RN-PED-02:** Al crear un pedido, se debe verificar y bloquear el stock de cada producto en una transacción atómica de base de datos.
* **RN-PED-03:** El pedido inicia siempre en estado `pendiente`.
* **RN-PED-04:** El ciclo de estados es:
  `pendiente` → `pagado` → `en_preparacion` → `enviado` → `entregado` (o `cancelado`).
* **RN-PED-05:** Solo se puede cancelar un pedido si se encuentra en estado `pendiente` o `en_espera_pago`.

---

## 3. Endpoints

### 3.1 Crear Pedido
* **Método:** `POST`
* **Ruta:** `/api/v1/pedidos`
* **Autenticación:** `Bearer <token>`

#### Request Body
```json
{
  "direccion_envio": "Av. Circunvalación y Vía a San Mateo, Manta",
  "telefono_contacto": "0991234567",
  "metodo_pago": "transferencia",
  "notas": "Por favor entregar en horario de la tarde",
  "items": [
    {
      "producto_id": 15,
      "cantidad": 2,
      "personalizaciones": [
        {
          "opcion": "Texto personalizado",
          "valor": "Feliz Aniversario"
        }
      ]
    }
  ]
}
```

#### Validaciones
* `direccion_envio`: `required|string|max:255`
* `telefono_contacto`: `required|string|max:20`
* `metodo_pago`: `required|in:transferencia,efectivo,tarjeta`
* `items`: `required|array|min:1`
* `items.*.producto_id`: `required|integer|exists:productos,id`
* `items.*.cantidad`: `required|integer|min:1`

#### Respuesta 201 Created
```json
{
  "success": true,
  "message": "Pedido creado exitosamente.",
  "data": {
    "id": 101,
    "codigo": "PED-2026-00101",
    "total": 35.00,
    "estado": "pendiente",
    "fecha_creacion": "2026-09-08T04:30:00.000000Z"
  }
}
```

---

### 3.2 Listar Pedidos del Cliente Autenticado
* **Método:** `GET`
* **Ruta:** `/api/v1/pedidos`
* **Autenticación:** `Bearer <token>`

#### Respuesta 200 OK
```json
{
  "success": true,
  "data": [
    {
      "id": 101,
      "codigo": "PED-2026-00101",
      "total": 35.00,
      "estado": "pendiente",
      "fecha": "2026-09-08 04:30"
    }
  ]
}
```

---

### 3.3 Consultar Detalle de un Pedido
* **Método:** `GET`
* **Ruta:** `/api/v1/pedidos/{id}`
* **Autenticación:** `Bearer <token>`

#### Respuesta 200 OK
```json
{
  "success": true,
  "data": {
    "id": 101,
    "codigo": "PED-2026-00101",
    "total": 35.00,
    "estado": "pendiente",
    "direccion_envio": "Av. Circunvalación y Vía a San Mateo, Manta",
    "items": [
      {
        "producto_id": 15,
        "nombre": "Taza Mágica Sublimada",
        "precio_unitario": 17.50,
        "cantidad": 2,
        "subtotal": 35.00
      }
    ]
  }
}
```
