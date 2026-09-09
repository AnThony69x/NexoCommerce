# Módulo 09: Tienda y Configuración Parametrizable — Especificación Técnica (SDD)

* **Versión del contrato:** 1.0.0
* **Prefijo base:** `/api/v1/tienda`
* **Mecanismo:** Lectura pública / Edición administrador
* **Estado:** Aprobado para revisión

---

## 1. Propósito y Alcance
Permite que NexoCommerce sea un sistema **parametrizable y modular** capaz de adaptarse a cualquier negocio (Repostería, Detalles, Sublimación, Ropa, etc.) sin modificar el código base del backend, administrando datos generales de la tienda, moneda, redes de contacto y políticas.

---

## 2. Reglas de Negocio
* **RN-TND-01:** Los parámetros de la tienda son consumidos por el Frontend Web y la App Móvil al iniciar (splash screen / header).
* **RN-TND-02:** Solo el usuario con rol `administrador` puede alterar los parámetros de la tienda.

---

## 3. Endpoints

### 3.1 Obtener Configuración de la Tienda (Público)
* **Método:** `GET`
* **Ruta:** `/api/v1/tienda/configuracion`
* **Autenticación:** Ninguna

#### Respuesta 200 OK
```json
{
  "success": true,
  "data": {
    "nombre_comercial": "NexoCommerce Studio",
    "lema": "Personalización y detalles a tu medida",
    "tipo_negocio": "Sublimacion y Regalos",
    "moneda_simbolo": "$",
    "moneda_codigo": "USD",
    "telefono_whatsapp": "+593991234567",
    "email_contacto": "contacto@nexocommerce.com",
    "direccion_fisica": "Manta, Manabí, Ecuador",
    "logo_url": "http://192.168.1.50/storage/tienda/logo.png",
    "permite_pedidos": true
  }
}
```

---

### 3.2 Actualizar Configuración (Admin)
* **Método:** `PUT`
* **Ruta:** `/api/v1/admin/tienda/configuracion`
* **Autenticación:** `Bearer <token>` (Rol: `administrador`)

#### Request Body
```json
{
  "nombre_comercial": "NexoCommerce Pastelería Gourmet",
  "lema": "Dulces momentos para compartir",
  "tipo_negocio": "Reposteria",
  "telefono_whatsapp": "+593998765432"
}
```

#### Respuesta 200 OK
```json
{
  "success": true,
  "message": "Configuración de la tienda actualizada con éxito."
}
```
