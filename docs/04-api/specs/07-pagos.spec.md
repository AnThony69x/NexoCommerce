# Módulo 07: Pagos y Comprobantes — Especificación Técnica (SDD)

* **Versión del contrato:** 1.0.0
* **Prefijo base:** `/api/v1/pagos`
* **Mecanismo:** Laravel Sanctum
* **Estado:** Aprobado para revisión

---

## 1. Propósito y Alcance
Permitir a los clientes registrar y consultar los pagos de sus pedidos (mediante transferencia bancaria con carga de comprobante o pasarela simulada) y permitir a los administradores validar y autorizar los pagos.

---

## 2. Reglas de Negocio
* **RN-PAG-01:** Un pago debe estar asociado obligatoriamente a un `pedido_id` existente y en estado `pendiente`.
* **RN-PAG-02:** El monto del pago registrado debe coincidir con el total adeudado del pedido.
* **RN-PAG-03:** En pagos por transferencia, el cliente debe adjuntar la URL o archivo del comprobante de depósito/transferencia emitido por el servidor de archivos.
* **RN-PAG-04:** Cuando el administrador aprueba el pago, el pedido cambia automáticamente de estado `pendiente` a `pagado` y se notifica al cliente.

---

## 3. Endpoints

### 3.1 Registrar Pago (Cliente)
* **Método:** `POST`
* **Ruta:** `/api/v1/pagos`
* **Autenticación:** `Bearer <token>`

#### Request Body
```json
{
  "pedido_id": 101,
  "metodo_pago": "transferencia",
  "monto": 35.00,
  "numero_referencia": "TRANS-8874129",
  "comprobante_url": "http://192.168.1.50/storage/comprobantes/comp_101.jpg",
  "fecha_transferencia": "2026-09-08 10:15:00"
}
```

#### Validaciones
* `pedido_id`: `required|integer|exists:pedidos,id`
* `metodo_pago`: `required|in:transferencia,efectivo,tarjeta`
* `monto`: `required|numeric|min:0.01`
* `numero_referencia`: `nullable|string|max:100`
* `comprobante_url`: `required_if:metodo_pago,transferencia|url`

#### Respuesta 201 Created
```json
{
  "success": true,
  "message": "Comprobante de pago registrado exitosamente. En espera de verificación.",
  "data": {
    "pago_id": 54,
    "pedido_id": 101,
    "estado": "en_verificacion",
    "monto": 35.00
  }
}
```

---

### 3.2 Verificar/Aprobar Pago (Solo Administrador)
* **Método:** `PATCH`
* **Ruta:** `/api/v1/admin/pagos/{id}/verificar`
* **Autenticación:** `Bearer <token>` (Rol: `administrador`)

#### Request Body
```json
{
  "estado": "aprobado",
  "observaciones": "Transferencia acreditada en cuenta Banco Pichincha."
}
```

#### Validaciones
* `estado`: `required|in:aprobado,rechazado`
* `observaciones`: `nullable|string|max:255`

#### Respuesta 200 OK
```json
{
  "success": true,
  "message": "El pago ha sido aprobado y el pedido marcado como pagado.",
  "data": {
    "pago_id": 54,
    "pedido_id": 101,
    "nuevo_estado_pedido": "pagado"
  }
}
```
