# NexoCommerce — Especificación y Metodología SDD (API REST v1)

Este directorio contiene los contratos, especificaciones técnicas y estándares de la API REST de **NexoCommerce**, diseñados bajo la metodología **SDD (Spec-Driven Development / Desarrollo Dirigido por Especificaciones)**.

---

## 1. ¿Qué es SDD (Spec-Driven Development)?

En **NexoCommerce**, el desarrollo de la API sigue estrictamente el principio:

> **"Ningún endpoint se codifica en Laravel sin antes contar con su especificación técnica aprobada."**

### Flujo de trabajo SDD

```text
┌─────────────────────────────────────────────────────────────┐
│ 1. ESPECIFICACIÓN (Spec)                                    │
│    Redacción del contrato en docs/04-api/specs/              │
│    - Endpoints, payloads JSON, validaciones, códigos HTTP   │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. REVISIÓN Y ACUERDO (Frontend Web + App Móvil)            │
│    Nathalia (Web) y Emilio (Móvil) revisan y validan        │
│    que el contrato cubra sus necesidades de pantalla.       │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. PRUEBAS BASADAS EN LA SPEC (Test First / TDD)            │
│    Anthony escribe los tests de Feature en backend/tests/   │
│    esperando el payload y los códigos de la especificación. │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. IMPLEMENTACIÓN EN LARAVEL                                │
│    Dominio → Aplicación (Casos de Uso/DTOs) →                │
│    Infraestructura (Eloquent/PostgreSQL) → Http             │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. VERIFICACIÓN Y PUBLICACIÓN                               │
│    Pasan los tests automatizados y el contrato se publica   │
│    en OpenAPI/Swagger para consumo de los clientes.         │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Estándares Globales de la API REST

### 2.1 Prefijo y Versionamiento
Todas las rutas de la API utilizan prefijo de versión:
```text
/api/v1
```

### 2.2 Cabeceras Obligatorias
* `Accept: application/json` (Garantiza respuestas en JSON incluso ante excepciones de Laravel).
* `Content-Type: application/json` (Para peticiones con body `POST`, `PUT`, `PATCH`).
* `Authorization: Bearer <token_sanctum>` (Para rutas protegidas).

---

## 3. Formato Estándar de Respuestas (Envelope JSON)

Para asegurar consistencia en Web (React) y Móvil (Kotlin), toda respuesta de la API sigue esta estructura:

### 3.1 Respuesta Exitosa (200 OK, 201 Created)
```json
{
  "success": true,
  "message": "Operación realizada con éxito.",
  "data": {
    "id": 1,
    "nombre": "Camiseta Personalizada",
    "precio": 15.50
  }
}
```

### 3.2 Respuesta con Paginación (200 OK)
```json
{
  "success": true,
  "data": [
    { "id": 1, "nombre": "Producto A" },
    { "id": 2, "nombre": "Producto B" }
  ],
  "meta": {
    "pagina_actual": 1,
    "por_pagina": 15,
    "total": 45,
    "total_paginas": 3
  }
}
```

### 3.3 Respuesta de Error de Validación (422 Unprocessable Content)
```json
{
  "success": false,
  "message": "Los datos proporcionados no son válidos.",
  "errors": {
    "email": [
      "El campo email es obligatorio.",
      "El email ya se encuentra registrado."
    ],
    "password": [
      "La contraseña debe contener al menos 8 caracteres."
    ]
  }
}
```

### 3.4 Respuestas de Error General (400, 401, 403, 404, 500)
```json
{
  "success": false,
  "message": "No tienes autorización para acceder a este recurso.",
  "codigo_error": "AUTH_UNAUTHORIZED"
}
```

---

## 4. Códigos de Estado HTTP Convencionales

| Código | Significado | Uso en NexoCommerce |
| :--- | :--- | :--- |
| **200 OK** | Éxito general | Consultas (`GET`), actualizaciones (`PUT`/`PATCH`), listados. |
| **201 Created** | Recurso creado | Creación de pedidos, registros, productos, tokens (`POST`). |
| **204 No Content** | Sin contenido | Eliminación exitosa de un recurso (`DELETE`). |
| **400 Bad Request** | Petición incorrecta | Lógica de negocio inválida (ej. stock insuficiente, cupón vencido). |
| **401 Unauthorized** | No autenticado | Token ausente, inválido o expirado. |
| **403 Forbidden** | Acceso prohibido | El usuario no tiene rol o permisos suficientes (ej. cliente intentando crear producto). |
| **404 Not Found** | No encontrado | ID de pedido, producto o usuario inexistente. |
| **422 Unprocessable** | Error de validación | Formulario o JSON con datos que no cumplen las reglas de la solicitud. |
| **500 Internal Error** | Error del servidor | Error no controlado (base de datos caída, fallo de infraestructura). |

---

## 5. Índice de Especificaciones por Módulo

Las especificaciones detalladas de cada módulo se encuentran en la carpeta [specs/](file:///c:/Users/antho/Documents/Proyectos/NexoCommerce/docs/04-api/specs):

* [00. Plantilla Base de Especificación](file:///c:/Users/antho/Documents/Proyectos/NexoCommerce/docs/04-api/specs/00-plantilla-modulo.spec.md)
* [01. Autenticación y Tokens](file:///c:/Users/antho/Documents/Proyectos/NexoCommerce/docs/04-api/specs/01-autenticacion.spec.md)
* [02. Usuarios y Roles](file:///c:/Users/antho/Documents/Proyectos/NexoCommerce/docs/04-api/specs/02-usuarios.spec.md)
* [03. Categorías](file:///c:/Users/antho/Documents/Proyectos/NexoCommerce/docs/04-api/specs/03-categorias.spec.md)
* [04. Productos y Personalización](file:///c:/Users/antho/Documents/Proyectos/NexoCommerce/docs/04-api/specs/04-productos.spec.md)
* [05. Carrito de Compras](file:///c:/Users/antho/Documents/Proyectos/NexoCommerce/docs/04-api/specs/05-carrito.spec.md)
* [06. Pedidos](file:///c:/Users/antho/Documents/Proyectos/NexoCommerce/docs/04-api/specs/06-pedidos.spec.md)
* [07. Pagos y Comprobantes](file:///c:/Users/antho/Documents/Proyectos/NexoCommerce/docs/04-api/specs/07-pagos.spec.md)
* [08. Multimedia y Servidor de Archivos](file:///c:/Users/antho/Documents/Proyectos/NexoCommerce/docs/04-api/specs/08-multimedia.spec.md)
* [09. Tiendas y Parámetros Globales](file:///c:/Users/antho/Documents/Proyectos/NexoCommerce/docs/04-api/specs/09-tiendas.spec.md)
* [10. Notificaciones](file:///c:/Users/antho/Documents/Proyectos/NexoCommerce/docs/04-api/specs/10-notificaciones.spec.md)

---

## 6. Checklist de Desarrollo

Para seguir el avance ordenado del backend paso a paso, consulta el documento:
👉 **[CHECKLIST_DESARROLLO.md](file:///c:/Users/antho/Documents/Proyectos/NexoCommerce/docs/04-api/CHECKLIST_DESARROLLO.md)**
