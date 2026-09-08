# Módulo 04: Productos y Personalización — Especificación Técnica (SDD)

* **Versión del contrato:** 1.0.0
* **Prefijo base:** `/api/v1/productos`
* **Mecanismo:** Lectura pública / Escritura admin
* **Estado:** Aprobado para revisión

---

## 1. Propósito y Alcance
Administrar el catálogo de productos disponibles en NexoCommerce y sus capacidades de personalización dinámica (textos, colores, tamaños, imágenes de diseño), tanto para la tienda web como para la app móvil.

---

## 2. Reglas de Negocio
* **RN-PROD-01:** El precio base del producto debe ser mayor o igual a cero.
* **RN-PROD-02:** El stock representa unidades disponibles; si `stock = 0`, el producto no puede ser añadido al carrito.
* **RN-PROD-03:** Cada producto puede tener múltiples opciones de personalización (ej. *Tamaño*, *Color*, *Frase grabada*).
* **RN-PROD-04:** Las opciones de personalización pueden tener un costo adicional que suma al precio base del producto.

---

## 3. Endpoints

### 3.1 Listar Productos (Público con filtros y paginación)
* **Método:** `GET`
* **Ruta:** `/api/v1/productos`
* **Autenticación:** Ninguna

#### Parámetros de Query
| Parámetro | Tipo | Descripción |
| :--- | :--- | :--- |
| `categoria_id` | integer | Filtrar por categoría |
| `buscar` | string | Término de búsqueda en nombre/descripción |
| `precio_min` | numeric | Precio mínimo |
| `precio_max` | numeric | Precio máximo |
| `ordenar` | string | `precio_asc`, `precio_desc`, `recientes` |
| `page` | integer | Página actual (default 1) |

#### Respuesta 200 OK
```json
{
  "success": true,
  "data": [
    {
      "id": 15,
      "nombre": "Taza Mágica Sublimada",
      "slug": "taza-magica-sublimada",
      "descripcion": "Taza de cerámica que revela diseño con líquido caliente.",
      "precio_base": 12.50,
      "stock": 25,
      "categoria": {
        "id": 4,
        "nombre": "Tazas y Termos"
      },
      "imagenes": [
        {
          "id": 10,
          "url": "http://192.168.1.50/storage/productos/taza_negra.jpg",
          "es_principal": true
        }
      ],
      "es_personalizable": true
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

---

### 3.2 Detalle de Producto con Opciones de Personalización
* **Método:** `GET`
* **Ruta:** `/api/v1/productos/{id}`
* **Autenticación:** Ninguna

#### Respuesta 200 OK
```json
{
  "success": true,
  "data": {
    "id": 15,
    "nombre": "Taza Mágica Sublimada",
    "descripcion": "Taza cerámica de 11oz personalizable.",
    "precio_base": 12.50,
    "stock": 25,
    "categoria_id": 4,
    "imagenes": [
      "http://192.168.1.50/storage/productos/taza_negra.jpg"
    ],
    "personalizaciones": [
      {
        "id": 1,
        "nombre": "Color Base",
        "tipo": "seleccion",
        "es_obligatorio": true,
        "valores": [
          { "id": 101, "valor": "Negro Mate", "precio_adicional": 0.00 },
          { "id": 102, "valor": "Rojo Rubí", "precio_adicional": 1.50 }
        ]
      },
      {
        "id": 2,
        "nombre": "Texto o Dedicatoria",
        "tipo": "texto_libre",
        "es_obligatorio": false,
        "limite_caracteres": 50,
        "precio_adicional": 0.00
      },
      {
        "id": 3,
        "nombre": "Diseño o Foto Propia",
        "tipo": "archivo_imagen",
        "es_obligatorio": false,
        "precio_adicional": 2.00
      }
    ]
  }
}
```

---

### 3.3 Crear Producto (Admin)
* **Método:** `POST`
* **Ruta:** `/api/v1/admin/productos`
* **Autenticación:** `Bearer <token>` (Rol: `administrador`)

#### Request Body
```json
{
  "categoria_id": 4,
  "nombre": "Taza Mágica Sublimada",
  "descripcion": "Taza de 11oz",
  "precio_base": 12.50,
  "stock": 50,
  "es_personalizable": true
}
```
