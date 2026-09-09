# Módulo 05: Carrito de Compras — Especificación Técnica (SDD)

* **Versión del contrato:** 1.0.0
* **Prefijo base:** `/api/v1/carrito`
* **Mecanismo:** Laravel Sanctum (Usuario autenticado)
* **Estado:** Aprobado para revisión

---

## 1. Propósito y Alcance
Permite al cliente acumular productos con sus personalizaciones seleccionadas, recalcular subtotales dinámicamente y preparar la orden para el checkout.

---

## 2. Reglas de Negocio
* **RN-CAR-01:** Cada usuario autenticado tiene un único carrito activo asociado en PostgreSQL.
* **RN-CAR-02:** Si se añade el mismo producto con idénticas personalizaciones, se incrementa la cantidad en lugar de crear un nuevo renglón.
* **RN-CAR-03:** Si se añade el mismo producto pero con diferentes personalizaciones (ej. talla M vs talla L), se genera un ítem independiente.
* **RN-CAR-04:** La cantidad solicitada no puede superar el stock disponible en inventario.

---

## 3. Endpoints

### 3.1 Consultar Carrito del Usuario
* **Método:** `GET`
* **Ruta:** `/api/v1/carrito`
* **Autenticación:** `Bearer <token>`

#### Respuesta 200 OK
```json
{
  "success": true,
  "data": {
    "carrito_id": 8,
    "items": [
      {
        "item_id": 14,
        "producto_id": 15,
        "nombre": "Taza Mágica Sublimada",
        "imagen": "http://192.168.1.50/storage/productos/taza_negra.jpg",
        "precio_unitario": 12.50,
        "costo_personalizaciones": 1.50,
        "precio_total_unitario": 14.00,
        "cantidad": 2,
        "subtotal": 28.00,
        "personalizaciones": [
          { "nombre": "Color Base", "valor": "Rojo Rubí", "adicional": 1.50 }
        ]
      }
    ],
    "subtotal_general": 28.00,
    "impuestos": 0.00,
    "total": 28.00
  }
}
```

---

### 3.2 Añadir Ítem al Carrito
* **Método:** `POST`
* **Ruta:** `/api/v1/carrito/items`
* **Autenticación:** `Bearer <token>`

#### Request Body
```json
{
  "producto_id": 15,
  "cantidad": 2,
  "personalizaciones": [
    {
      "opcion_id": 1,
      "valor_id": 102
    },
    {
      "opcion_id": 2,
      "texto": "Feliz Cumpleaños Mamá"
    }
  ]
}
```

#### Validaciones
* `producto_id`: `required|integer|exists:productos,id`
* `cantidad`: `required|integer|min:1`
* `personalizaciones`: `nullable|array`

#### Respuesta 201 Created
```json
{
  "success": true,
  "message": "Producto agregado al carrito con éxito."
}
```

---

### 3.3 Actualizar Cantidad de un Ítem
* **Método:** `PUT`
* **Ruta:** `/api/v1/carrito/items/{item_id}`
* **Autenticación:** `Bearer <token>`

#### Request Body
```json
{
  "cantidad": 3
}
```

#### Respuesta 200 OK
```json
{
  "success": true,
  "message": "Cantidad actualizada."
}
```

---

### 3.4 Eliminar Ítem del Carrito
* **Método:** `DELETE`
* **Ruta:** `/api/v1/carrito/items/{item_id}`
* **Autenticación:** `Bearer <token>`

#### Respuesta 200 OK
```json
{
  "success": true,
  "message": "Ítem eliminado del carrito."
}
```
