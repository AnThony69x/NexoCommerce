# Modulo 04: Productos y Personalizacion — Especificacion Tecnica (SDD)

* **Version del contrato:** 1.1.0
* **Fecha:** 2026-09-13
* **Prefijo base:** `/api/v1/productos`
* **Estado:** Aprobado para implementacion
* **Fuente de datos:** `productos`, `tortas`, `detalles`, `sublimaciones`, `disenos_torta`, `plantillas_diseno`, `disenos_personalizados`, `producto_multimedia`
* **Responsables:** Backend Anthony / Web Nathalia / Movil Emilio / BD Melanie

---

## 1. Proposito y Alcance
Catalogo con tabla general `productos` y especializacion 1:1:

* `tortas` (`tamano`, `porciones`, `sabor`)
* `detalles` (`stock`)
* `sublimaciones` (`tipo_material`)

Personalizacion:

* Torta: `disenos_torta`
* Sublimacion: `plantillas_diseno` (admin) o `disenos_personalizados` (cliente)
* Detalle: sin diseño; controla inventario

No existen `slug`, `es_personalizable`, `stock` en `productos`, ni tablas `opciones_personalizacion` / `valores_personalizacion`.

El `tipo` en JSON es derivado: exactamente una especializacion por producto.

---

## 2. Reglas de Negocio e Invariantes
* **RN-PROD-01:** `precio_base >= 0`.
* **RN-PROD-02:** Todo producto pertenece a una `categoria_id`.
* **RN-PROD-03:** Un producto es TORTA, DETALLE o SUBLIMACION; nunca dos especializaciones a la vez.
* **RN-PROD-04:** Torta: `porciones > 0`; `sabor` obligatorio.
* **RN-PROD-05:** Detalle: `stock >= 0`. Sin stock no entra al carrito.
* **RN-PROD-06:** Sublimacion: al menos una `plantillas_diseno` activa antes de venderse (validacion de aplicacion).
* **RN-PROD-07:** Un producto tiene a lo sumo una imagen principal (`producto_multimedia.es_principal`).
* **RN-PROD-08:** `disenos_torta.costo_adicional >= 0` y `plantillas_diseno.costo_adicional >= 0`. Diseño estandar puede costar 0.
* **RN-PROD-09:** `disenos_personalizados` pertenecen a un CLIENTE (`usuario_id`) y a una sublimacion.
* **RN-PROD-10:** Lectura publica de catalogo activo. Escritura de productos/diseños/plantillas: ADMIN. Alta de diseño personalizado: CLIENTE autenticado.
* **RN-PROD-11:** Filtro por porciones de torta es query de aplicacion; no hay tabla de rangos de personas.

---

## 3. Modelo de Datos (PostgreSQL)

### Tabla: `productos`
| Campo | Tipo | Nulo | Descripcion |
| :--- | :--- | :--- | :--- |
| `id` | SERIAL | NO | PK |
| `categoria_id` | INT | NO | FK `categorias.id` |
| `nombre` | VARCHAR(150) | NO | |
| `descripcion` | TEXT | SI | |
| `precio_base` | DECIMAL(10,2) | NO | `>= 0` |
| `activo` | BOOLEAN | NO | Default TRUE |
| `creado_en` | TIMESTAMP | NO | |
| `actualizado_en` | TIMESTAMP | NO | |

### Tabla: `tortas`
| Campo | Tipo | Nulo | Descripcion |
| :--- | :--- | :--- | :--- |
| `producto_id` | INT | NO | PK/FK `productos.id` CASCADE |
| `tamano` | VARCHAR(50) | NO | |
| `porciones` | INT | NO | `> 0` |
| `sabor` | VARCHAR(100) | NO | |

### Tabla: `detalles`
| Campo | Tipo | Nulo | Descripcion |
| :--- | :--- | :--- | :--- |
| `producto_id` | INT | NO | PK/FK `productos.id` CASCADE |
| `stock` | INT | NO | Default 0, `>= 0` |

### Tabla: `sublimaciones`
| Campo | Tipo | Nulo | Descripcion |
| :--- | :--- | :--- | :--- |
| `producto_id` | INT | NO | PK/FK `productos.id` CASCADE |
| `tipo_material` | VARCHAR(100) | NO | |

### Tabla: `disenos_torta`
| Campo | Tipo | Nulo | Descripcion |
| :--- | :--- | :--- | :--- |
| `id` | SERIAL | NO | PK |
| `torta_id` | INT | NO | FK `tortas.producto_id` CASCADE |
| `nombre` | VARCHAR(100) | NO | |
| `descripcion` | TEXT | SI | |
| `costo_adicional` | DECIMAL(10,2) | NO | Default 0, `>= 0` |
| `multimedia_id` | INT | SI | FK `multimedia.id` |
| `activo` | BOOLEAN | NO | |
| `creado_en` | TIMESTAMP | NO | |
| `actualizado_en` | TIMESTAMP | NO | |

### Tabla: `plantillas_diseno`
Igual estructura que `disenos_torta`, con `sublimacion_id` FK `sublimaciones.producto_id`.

### Tabla: `disenos_personalizados`
| Campo | Tipo | Nulo | Descripcion |
| :--- | :--- | :--- | :--- |
| `id` | SERIAL | NO | PK |
| `usuario_id` | INT | NO | FK `usuarios.id` RESTRICT |
| `sublimacion_id` | INT | NO | FK `sublimaciones.producto_id` RESTRICT |
| `multimedia_id` | INT | NO | FK `multimedia.id` RESTRICT |
| `indicaciones` | TEXT | SI | |
| `creado_en` | TIMESTAMP | NO | |
| `actualizado_en` | TIMESTAMP | NO | |

### Tabla: `producto_multimedia`
| Campo | Tipo | Nulo | Descripcion |
| :--- | :--- | :--- | :--- |
| `producto_id` | INT | NO | PK compuesta |
| `multimedia_id` | INT | NO | PK compuesta |
| `orden` | INT | NO | `>= 0` |
| `es_principal` | BOOLEAN | NO | Una sola TRUE por producto |

---

## 4. Endpoints

### 4.1 Listar productos (publico)
* **Metodo:** `GET`
* **Ruta:** `/api/v1/productos`
* **Autenticacion:** Ninguna

#### Query
| Parametro | Tipo | Descripcion |
| :--- | :--- | :--- |
| `categoria_id` | integer | |
| `tipo` | string | `TORTA`, `DETALLE`, `SUBLIMACION` |
| `buscar` | string | nombre/descripcion |
| `precio_min` / `precio_max` | numeric | sobre `precio_base` |
| `porciones_min` / `porciones_max` | integer | solo TORTA |
| `sabor` | string | solo TORTA |
| `ordenar` | string | `precio_asc`, `precio_desc`, `recientes` |
| `page` | integer | |

#### 200 OK
```json
{
  "success": true,
  "data": [
    {
      "id": 15,
      "tipo": "SUBLIMACION",
      "nombre": "Taza Magica",
      "descripcion": "Taza de ceramica 11oz.",
      "precio_base": 12.50,
      "activo": true,
      "categoria": { "id": 4, "nombre": "Tazas y Termos" },
      "imagen_principal": {
        "id": 10,
        "ruta_archivo": "productos/taza.webp",
        "url": "http://192.168.1.50/storage/productos/taza.webp",
        "es_principal": true
      },
      "torta": null,
      "detalle": null,
      "sublimacion": { "tipo_material": "Ceramica" }
    }
  ],
  "meta": {
    "pagina_actual": 1,
    "por_pagina": 12,
    "total": 1,
    "total_paginas": 1
  }
}
```

En DETALLE incluir `"detalle": { "stock": 25 }`. En TORTA incluir `"torta": { "tamano": "Mediana", "porciones": 12, "sabor": "Chocolate" }`.

---

### 4.2 Detalle de producto (publico)
* **Metodo:** `GET`
* **Ruta:** `/api/v1/productos/{id}`

#### 200 OK (TORTA)
```json
{
  "success": true,
  "data": {
    "id": 8,
    "tipo": "TORTA",
    "nombre": "Torta Chocolate 12 porciones",
    "descripcion": "Bizcocho de chocolate.",
    "precio_base": 25.00,
    "activo": true,
    "categoria_id": 2,
    "imagenes": [
      {
        "id": 21,
        "ruta_archivo": "productos/torta.webp",
        "url": "http://192.168.1.50/storage/productos/torta.webp",
        "orden": 0,
        "es_principal": true
      }
    ],
    "torta": {
      "tamano": "Mediana",
      "porciones": 12,
      "sabor": "Chocolate",
      "disenos": [
        {
          "id": 3,
          "nombre": "Flores de crema",
          "descripcion": null,
          "costo_adicional": 5.00,
          "multimedia_id": 22,
          "activo": true
        }
      ]
    },
    "detalle": null,
    "sublimacion": null
  }
}
```

Si `tipo = SUBLIMACION`, `sublimacion.plantillas` lista `plantillas_diseno` activas. El cliente no recibe diseños personalizados ajenos.

---

### 4.3 Crear producto (ADMIN)
* **Metodo:** `POST`
* **Ruta:** `/api/v1/admin/productos`
* **Autenticacion:** Sanctum
* **Roles autorizados:** ADMIN

El body incluye `tipo` y el objeto de especializacion correspondiente. Transaccion: inserta `productos` + tabla 1:1 + `producto_multimedia` opcional.

#### Payload TORTA
```json
{
  "categoria_id": 2,
  "nombre": "Torta Chocolate 12 porciones",
  "descripcion": "Bizcocho de chocolate.",
  "precio_base": 25.00,
  "activo": true,
  "tipo": "TORTA",
  "torta": {
    "tamano": "Mediana",
    "porciones": 12,
    "sabor": "Chocolate"
  },
  "imagenes": [
    { "multimedia_id": 21, "orden": 0, "es_principal": true }
  ]
}
```

#### Payload DETALLE
```json
{
  "categoria_id": 5,
  "nombre": "Caja de cupcakes x6",
  "descripcion": null,
  "precio_base": 8.00,
  "activo": true,
  "tipo": "DETALLE",
  "detalle": { "stock": 40 }
}
```

#### Payload SUBLIMACION
```json
{
  "categoria_id": 4,
  "nombre": "Taza Magica",
  "descripcion": "11oz",
  "precio_base": 12.50,
  "activo": true,
  "tipo": "SUBLIMACION",
  "sublimacion": { "tipo_material": "Ceramica" }
}
```

#### Validaciones
* `categoria_id`: `required|integer|exists:categorias,id`
* `nombre`: `required|string|max:150`
* `descripcion`: `nullable|string`
* `precio_base`: `required|numeric|min:0`
* `activo`: `boolean`
* `tipo`: `required|in:TORTA,DETALLE,SUBLIMACION`
* `torta.tamano`: `required_if:tipo,TORTA|string|max:50`
* `torta.porciones`: `required_if:tipo,TORTA|integer|min:1`
* `torta.sabor`: `required_if:tipo,TORTA|string|max:100`
* `detalle.stock`: `required_if:tipo,DETALLE|integer|min:0`
* `sublimacion.tipo_material`: `required_if:tipo,SUBLIMACION|string|max:100`
* `imagenes.*.multimedia_id`: `required|integer|exists:multimedia,id`
* `imagenes.*.orden`: `integer|min:0`
* `imagenes.*.es_principal`: `boolean`

Mas de una `es_principal true`: 422. Tipo incompatible con objetos extra: 422.

#### 201 Created
Devuelve el detalle completo igual que GET `productos/{id}`.

---

### 4.4 Actualizar producto (ADMIN)
* **Metodo:** `PUT`
* **Ruta:** `/api/v1/admin/productos/{id}`

Mismos campos. No se cambia `tipo` (400 `PROD_TIPO_INMUTABLE`). Stock de DETALLE si se actualiza.

---

### 4.5 Desactivar producto (ADMIN)
* **Metodo:** `DELETE`
* **Ruta:** `/api/v1/admin/productos/{id}`

`activo = false`. No borra (FKs de carrito/pedido son RESTRICT).

---

### 4.6 Crear diseño de torta (ADMIN)
* **Metodo:** `POST`
* **Ruta:** `/api/v1/admin/tortas/{producto_id}/disenos`

```json
{
  "nombre": "Flores de crema",
  "descripcion": null,
  "costo_adicional": 5.00,
  "multimedia_id": 22,
  "activo": true
}
```

`producto_id` debe existir en `tortas`. PUT/DELETE analogos en `/api/v1/admin/disenos-torta/{id}` (DELETE = `activo = false`).

---

### 4.7 Crear plantilla de sublimacion (ADMIN)
* **Metodo:** `POST`
* **Ruta:** `/api/v1/admin/sublimaciones/{producto_id}/plantillas`

Mismo payload que diseño de torta. PUT/DELETE en `/api/v1/admin/plantillas-diseno/{id}`.

---

### 4.8 Crear diseño personalizado (CLIENTE)
* **Metodo:** `POST`
* **Ruta:** `/api/v1/disenos-personalizados`
* **Autenticacion:** Sanctum
* **Roles autorizados:** CLIENTE

El archivo se sube antes (spec 08) y se envia `multimedia_id`.

```json
{
  "sublimacion_id": 15,
  "multimedia_id": 44,
  "indicaciones": "Usar colores pastel"
}
```

#### Validaciones
* `sublimacion_id`: `required|integer|exists:sublimaciones,producto_id`
* `multimedia_id`: `required|integer|exists:multimedia,id`
* `indicaciones`: `nullable|string`

`usuario_id` = autenticado. 201 con el registro.

`GET /api/v1/disenos-personalizados` lista solo los del usuario autenticado.

---

## 5. Criterios de Aceptacion
* [ ] **TC-01:** Crear TORTA inserta `productos` + `tortas`; GET detalle incluye `torta.disenos`.
* [ ] **TC-02:** Crear sin `torta.sabor` responde 422.
* [ ] **TC-03:** JSON no incluye `slug` ni `personalizaciones` genericas.
* [ ] **TC-04:** Dos imagenes principales en el mismo producto: 422.
* [ ] **TC-05:** CLIENTE no puede POST `/admin/productos` (403).
* [ ] **TC-06:** Diseño personalizado guarda `usuario_id` del token.
