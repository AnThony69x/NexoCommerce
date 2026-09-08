# Módulo 10: Notificaciones — Especificación Técnica (SDD)

* **Versión del contrato:** 1.0.0
* **Prefijo base:** `/api/v1/notificaciones`
* **Mecanismo:** Laravel Sanctum
* **Estado:** Aprobado para revisión

---

## 1. Propósito y Alcance
Proporcionar a los usuarios (clientes y administradores) un buzón de alertas y notificaciones sobre eventos clave en la plataforma (estado de pedidos, validación de pagos, confirmaciones).

---

## 2. Reglas de Negocio
* **RN-NOT-01:** Los clientes reciben notificaciones cuando:
  1. Su pedido es creado exitosamente.
  2. Su pago ha sido verificado (aprobado o rechazado).
  3. Su pedido ha sido despachado/enviado.
* **RN-NOT-02:** Los administradores reciben notificaciones cuando:
  1. Se genera un nuevo pedido.
  2. Un cliente registra un nuevo comprobante de pago por verificar.

---

## 3. Endpoints

### 3.1 Listar Notificaciones del Usuario
* **Método:** `GET`
* **Ruta:** `/api/v1/notificaciones`
* **Autenticación:** `Bearer <token>`

#### Respuesta 200 OK
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "titulo": "Pago Verificado",
      "mensaje": "Tu comprobante para el pedido #PED-2026-00101 fue aprobado con éxito.",
      "leida": false,
      "tipo": "pago_aprobado",
      "referencia_id": 101,
      "fecha": "2026-09-08 11:20:00"
    }
  ],
  "meta": {
    "total_no_leidas": 1
  }
}
```

---

### 3.2 Marcar Notificación como Leída
* **Método:** `PATCH`
* **Ruta:** `/api/v1/notificaciones/{id}/leida`
* **Autenticación:** `Bearer <token>`

#### Respuesta 200 OK
```json
{
  "success": true,
  "message": "Notificación marcada como leída."
}
```
