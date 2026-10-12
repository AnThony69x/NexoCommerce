# Modulo 05: Carrito de Compras — Especificacion Tecnica (SDD)

* **Version del contrato:** 1.1.1
* **Fecha:** 2026-09-24
* **Prefijo base:** `/api/v1/carrito`
* **Estado:** Aprobado para implementacion
* **Fuente de datos:** `carritos`, `detalles_carrito`
* **Responsables:** Backend Anthony / Web Nathalia / Movil Emilio / BD Melanie

---

## 1. Proposito y Alcance
Un carrito activo por usuario (`uq_carrito_activo_usuario`). Cada renglón es `detalles_carrito` con **como maximo una** configuracion: `diseno_torta_id` XOR `plantilla_diseno_id` XOR `diseno_personalizado_id`.

No existen `opcion_id`, `valor_id`, textos de personalizacion libre ni campo `impuestos` en SQL.

---

## 2. Reglas de Negocio e Invariantes
* **RN-CAR-01:** Un usuario tiene como maximo un `carritos.activo = true`.
* **RN-CAR-02:** `cantidad > 0`. `precio_unitario >= 0` y lo calcula el backend (`precio_base` + `costo_adicional` del diseño/plantilla). El cliente no envia precio.
* **RN-CAR-03:** CHECK `chk_carrito_configuracion`: a lo sumo una FK de diseño.
* **RN-CAR-04:** Compatibilidad (aplicacion):
  * TORTA: solo `diseno_torta_id` (opcional) y debe pertenecer a esa torta.
  * SUBLIMACION: exactamente una de `plantilla_diseno_id` o `diseno_personalizado_id`.
  * DETALLE: ninguna FK de diseño.
* **RN-CAR-05:** DETALLE: `cantidad` no supera `detalles.stock`. Stock 0: 400 `CAR_SIN_STOCK`.
* **RN-CAR-06:** Mismo `producto_id` + mismas FKs de diseño + mismo `comentario` incrementa `cantidad`; si cambia el diseño, nuevo renglón.
* **RN-CAR-07:** `diseno_personalizado_id` debe ser del usuario autenticado.
* **RN-CAR-08:** Solo el dueño opera su carrito activo.
* **RN-CAR-09:** GET y toda mutacion recalculan y persisten el precio vigente de los renglones, incluso si el producto o diseño deja de estar disponible. Cada item informa `precio_actualizado` y el carrito enumera los IDs cambiados en `precios_actualizados`.
* **RN-CAR-10:** Items no disponibles o con stock insuficiente permanecen visibles con `disponible = false` y `avisos`; no se eliminan automaticamente. El stock de DETALLE se comprueba contra la suma de todos los renglones del mismo producto.
* **RN-CAR-11:** Fase 9 vuelve a validar precio, disponibilidad y stock al crear el pedido; el carrito no reserva stock ni cobra.

---

## 3. Modelo de Datos (PostgreSQL)

### Tabla: `carritos`
| Campo | Tipo | Nulo | Descripcion |
| :--- | :--- | :--- | :--- |
| `id` | SERIAL | NO | PK |
| `usuario_id` | INT | NO | FK `usuarios.id` RESTRICT |
| `activo` | BOOLEAN | NO | Default TRUE |
| `creado_en` | TIMESTAMP | NO | |
| `actualizado_en` | TIMESTAMP | NO | |

### Tabla: `detalles_carrito`
| Campo | Tipo | Nulo | Descripcion |
| :--- | :--- | :--- | :--- |
| `id` | SERIAL | NO | PK |
| `carrito_id` | INT | NO | FK `carritos.id` CASCADE |
| `producto_id` | INT | NO | FK `productos.id` RESTRICT |
| `cantidad` | INT | NO | Default 1, `> 0` |
| `precio_unitario` | DECIMAL(10,2) | NO | Calculado |
| `comentario` | TEXT | SI | |
| `diseno_torta_id` | INT | SI | FK `disenos_torta.id` RESTRICT |
| `plantilla_diseno_id` | INT | SI | FK `plantillas_diseno.id` RESTRICT |
| `diseno_personalizado_id` | INT | SI | FK `disenos_personalizados.id` RESTRICT |
| `creado_en` | TIMESTAMP | NO | |
| `actualizado_en` | TIMESTAMP | NO | |

---

## 4. Endpoints

### 4.1 Consultar carrito
* **Metodo:** `GET`
* **Ruta:** `/api/v1/carrito`
* **Autenticacion:** Sanctum
* **Roles autorizados:** CLIENTE, ADMIN

Si no hay carrito activo, se crea vacio.

`costo_diseno` se deriva del diseño seleccionado. `subtotal` = `precio_unitario * cantidad`. `total` = suma de subtotales (sin impuestos; no hay columna).

#### 200 OK
```json
{
  "success": true,
  "data": {
    "id": 8,
    "usuario_id": 2,
    "activo": true,
    "items": [
      {
        "id": 14,
        "producto_id": 15,
        "nombre": "Taza Magica",
        "tipo": "SUBLIMACION",
        "imagen_principal_url": "http://192.168.1.50:8001/api/v1/multimedia/publico/productos/taza.webp",
        "cantidad": 2,
        "precio_unitario": 14.00,
        "comentario": null,
        "diseno_torta_id": null,
        "plantilla_diseno_id": 7,
        "diseno_personalizado_id": null,
        "configuracion": {
          "tipo": "PLANTILLA",
          "id": 7,
          "nombre": "Floral rosa",
          "costo_adicional": 1.50
        },
        "subtotal": 28.00,
        "precio_actualizado": false,
        "disponible": true,
        "avisos": []
      }
    ],
    "subtotal": 28.00,
    "total": 28.00,
    "precios_actualizados": []
  }
}
```

---

### 4.2 Añadir item
* **Metodo:** `POST`
* **Ruta:** `/api/v1/carrito/items`
* **Autenticacion:** Sanctum

#### Payload (sublimacion con plantilla)
```json
{
  "producto_id": 15,
  "cantidad": 2,
  "comentario": null,
  "plantilla_diseno_id": 7
}
```

#### Payload (torta)
```json
{
  "producto_id": 8,
  "cantidad": 1,
  "comentario": "Entregar sin globos",
  "diseno_torta_id": 3
}
```

#### Payload (detalle)
```json
{
  "producto_id": 20,
  "cantidad": 3
}
```

#### Payload (sublimacion personalizada)
```json
{
  "producto_id": 15,
  "cantidad": 1,
  "diseno_personalizado_id": 44
}
```

#### Validaciones
* `producto_id`: `required|integer|exists:productos,id`
* `cantidad`: `required|integer|min:1`
* `comentario`: `nullable|string`
* `diseno_torta_id`: `nullable|integer|exists:disenos_torta,id`
* `plantilla_diseno_id`: `nullable|integer|exists:plantillas_diseno,id`
* `diseno_personalizado_id`: `nullable|integer|exists:disenos_personalizados,id`

Producto inactivo: 400. Mas de una FK de diseño: 422. Combinacion incompatible con el tipo: 400 `CAR_CONFIGURACION_INVALIDA`.

#### 201 Created
Devuelve el envelope habitual con `data` igual al carrito completo de GET y mensaje `Producto agregado al carrito.`. El precio enviado por el cliente se ignora.

---

### 4.3 Actualizar cantidad
* **Metodo:** `PUT`
* **Ruta:** `/api/v1/carrito/items/{id}`

```json
{ "cantidad": 3 }
```

`cantidad`: `required|integer|min:1`. Item de otro usuario: 403. Stock insuficiente: 400. Devuelve el carrito completo actualizado.

---

### 4.4 Eliminar item
* **Metodo:** `DELETE`
* **Ruta:** `/api/v1/carrito/items/{id}`

200 con mensaje y carrito completo. Borra el renglón (`ON DELETE CASCADE` desde carrito no aplica aqui; se borra el detalle).

---

### 4.5 Vaciar carrito
* **Metodo:** `DELETE`
* **Ruta:** `/api/v1/carrito`

Elimina los `detalles_carrito` del carrito activo. El carrito permanece `activo = true`. Responde 200 con mensaje y carrito completo.

---

## 5. Criterios de Aceptacion
* [ ] **TC-01:** Segundo carrito activo para el mismo usuario viola el indice unico (el backend reutiliza el existente).
* [ ] **TC-02:** DETALLE con cantidad > stock: 400.
* [ ] **TC-03:** SUBLIMACION sin plantilla ni diseño personalizado: 400.
* [ ] **TC-04:** Enviar `diseno_torta_id` y `plantilla_diseno_id` juntos: 422.
* [ ] **TC-05:** `precio_unitario` ignorado si el cliente lo manda; se recalcula.

## 6. Avisos y precio vigente

`avisos` puede contener `PRODUCTO_INACTIVO`, `CONFIGURACION_INVALIDA`, `DISENO_NO_DISPONIBLE`, `PLANTILLA_NO_DISPONIBLE` o `STOCK_INSUFICIENTE`. `disponible` es verdadero solo si la lista esta vacia. `precio_actualizado` indica cambio persistido durante la solicitud; `precios_actualizados` contiene los IDs afectados. Los importes siguen el precio vigente aun cuando un item no pueda pedirse. POST y PUT rechazan producto/configuracion no disponible; GET y DELETE conservan visibilidad de items afectados. Todas las operaciones se serializan por usuario.
