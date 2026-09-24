# NexoCommerce — Especificación y Metodología SDD (API REST v1)

Este directorio contiene los contratos de la API REST de **NexoCommerce**, alineados con el esquema PostgreSQL de [`database/database.sql`](../../database/database.sql) (25 tablas). Fuente de verdad de datos: ese SQL. Ningún endpoint se implementa en Laravel si contradice esas tablas.

Metodología: **SDD (Spec-Driven Development)**.

---

## 1. Flujo de trabajo SDD

```text
1. ESPECIFICACIÓN     Contrato en docs/04-api/specs/ (tablas, payloads, HTTP)
2. REVISIÓN           Frontend Web (Nathalia) y App Móvil (Emilio)
3. PRUEBAS            Tests de Feature según el contrato
4. IMPLEMENTACIÓN     Dominio → Aplicación → Infraestructura (Eloquent) → Http
5. PUBLICACIÓN        OpenAPI en docs/04-api/openapi/openapi.yaml
```

Regla: **ningún endpoint se codifica sin especificación aprobada.**

---

## 2. Estándares globales

### 2.1 Prefijo
```text
/api/v1
```

### 2.2 Cabeceras
* `Accept: application/json`
* `Content-Type: application/json` (POST, PUT, PATCH con body JSON)
* `Authorization: Bearer <token_sanctum>` (rutas protegidas)

### 2.3 Convención de campos JSON
Los nombres del JSON coinciden con las columnas de PostgreSQL (`nombre_completo`, `correo`, `categoria_padre_id`, `creado_en`). No se usan alias Laravel (`name`, `email`, `created_at`).

Roles y estados se exponen **exactamente** como en los `CHECK` / seeds del SQL:

| Concepto | Valores |
| :--- | :--- |
| Roles | `ADMIN`, `CLIENTE` |
| OAuth | Solo `GOOGLE` |
| Pedido | `PENDIENTE`, `EN_PREPARACION`, `LISTO`, `ENTREGADO` |
| Pago método | `PASARELA`, `TRANSFERENCIA` |
| Pago estado | `PENDIENTE`, `APROBADO`, `RECHAZADO` |
| Tipo de producto | `TORTA`, `DETALLE`, `SUBLIMACION` (derivado de la tabla especializada 1:1) |

Los tokens Sanctum viven en tablas de Laravel (`personal_access_tokens`), no en las 25 tablas de negocio.

---

## 3. Envelope JSON

### 3.1 Éxito (200, 201)
```json
{
  "success": true,
  "message": "Operacion realizada con exito.",
  "data": {}
}
```

### 3.2 Paginación (200)
```json
{
  "success": true,
  "data": [],
  "meta": {
    "pagina_actual": 1,
    "por_pagina": 15,
    "total": 45,
    "total_paginas": 3
  }
}
```

### 3.3 Validación (422)
```json
{
  "success": false,
  "message": "Los datos proporcionados no son validos.",
  "errors": {
    "correo": ["El correo ya se encuentra registrado."]
  }
}
```

### 3.4 Error de negocio o autorización (400, 401, 403, 404, 500)
```json
{
  "success": false,
  "message": "Descripcion del error.",
  "codigo_error": "CODIGO_OPCIONAL"
}
```

---

## 4. Códigos HTTP

| Código | Uso |
| :--- | :--- |
| **200** | GET, PUT, PATCH |
| **201** | POST que crea recurso |
| **204** | DELETE sin cuerpo |
| **400** | Regla de negocio (stock, capacidad, estado invalido) |
| **401** | Token ausente o invalido |
| **403** | Rol insuficiente o recurso ajeno |
| **404** | Recurso inexistente |
| **422** | Validacion de FormRequest |
| **429** | Cuenta bloqueada por intentos fallidos |
| **500** | Error no controlado |

---

## 5. Mapa tablas SQL → especificaciones

| Tablas PostgreSQL | Spec |
| :--- | :--- |
| `roles`, `usuarios`, `cuentas_oauth`, `verificaciones_correo` | 01, 02 |
| `categorias` | 03 |
| `productos`, `tortas`, `detalles`, `sublimaciones`, `disenos_torta`, `plantillas_diseno`, `disenos_personalizados`, `producto_multimedia` | 04 |
| `carritos`, `detalles_carrito` | 05 |
| `pedidos`, `detalles_pedido` | 06 |
| `pagos`, `comprobantes_pago` | 07 |
| `multimedia` | 08 |
| `configuracion_tienda` | 09 |
| `notificaciones` | 10 |
| `publicaciones`, `publicacion_multimedia` | 11 |
| `configuracion_produccion` | 12 |

---

## 6. Índice de especificaciones

* [00. Plantilla](specs/00-plantilla-modulo.spec.md)
* [01. Autenticacion](specs/01-autenticacion.spec.md)
* [02. Usuarios y roles](specs/02-usuarios.spec.md)
* [03. Categorias](specs/03-categorias.spec.md)
* [04. Productos y personalizacion](specs/04-productos.spec.md)
* [05. Carrito](specs/05-carrito.spec.md)
* [06. Pedidos](specs/06-pedidos.spec.md)
* [07. Pagos y comprobantes](specs/07-pagos.spec.md)
* [08. Multimedia](specs/08-multimedia.spec.md)
* [09. Tienda](specs/09-tiendas.spec.md)
* [10. Notificaciones](specs/10-notificaciones.spec.md)
* [11. Publicaciones](specs/11-publicaciones.spec.md)
* [12. Produccion](specs/12-produccion.spec.md)

Contrato unificado: [openapi/openapi.yaml](openapi/openapi.yaml)

Guia de implementacion del backend: [backend/ROADMAP.md](../../backend/ROADMAP.md)
