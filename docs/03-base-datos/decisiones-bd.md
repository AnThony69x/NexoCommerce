# Decisiones de Diseño de Base de Datos

## 1. Roles del sistema

### Situación

Los requisitos contemplaban diferentes tipos de usuarios.

### Decisión

La base de datos manejará inicialmente dos roles principales:

* `ADMIN`
* `CLIENTE`

### Justificación

No se requiere una tabla independiente de clientes ni un rol adicional para personal autorizado en la versión actual del sistema.

---

## 2. Tabla de clientes

### Decisión

No se creará una tabla `clientes` independiente.

### Justificación

Los clientes son usuarios del sistema y su tipo de usuario se determina mediante la relación con `roles`.

---

## 3. Productos especializados

### Decisión

Se utilizará una tabla general `productos` y tablas especializadas:

* `tortas`
* `detalles`
* `sublimaciones`

### Justificación

Permite compartir información común de los productos y mantener separados los atributos específicos de cada tipo.

---

## 4. Rangos de personas para tortas

### Situación

Inicialmente se contemplaron las tablas:

* `rangos_personas`
* `rango_persona_torta`

### Decisión

Estas tablas fueron eliminadas del modelo.

La cantidad de personas se utilizará como criterio de filtrado y recomendación en el frontend y no como un módulo configurable de la base de datos.

### Justificación

Se decidió simplificar el modelo y evitar almacenar como entidades independientes una funcionalidad que actualmente será manejada como criterio de búsqueda.

---

## 5. Sabor de las tortas

### Situación

Inicialmente el sabor podía considerarse opcional.

### Decisión

El campo `sabor` será obligatorio en `tortas`.

### Implementación

```sql
sabor VARCHAR(100) NOT NULL
```

### Justificación

El sabor forma parte de la información esencial de una torta dentro del catálogo.

---

## 6. Diseños de tortas

### Decisión

Cada diseño de torta estará asociado directamente con una torta mediante `disenos_torta.torta_id`.

### Justificación

Permite determinar qué diseños están disponibles para cada producto de tipo torta.

---

## 7. Diseño principal de un producto

### Decisión

Un producto podrá tener múltiples imágenes, pero solamente una podrá estar marcada como principal.

### Implementación

Se utiliza un índice único parcial sobre `producto_multimedia` para `es_principal = TRUE`.

### Justificación

La restricción garantiza la integridad de la información sin impedir que un producto tenga varias imágenes.

---

## 8. Métodos de pago

### Decisión

Los métodos de pago contemplados son:

* `PAYPHONE`
* `TRANSFERENCIA`

### Justificación

Son los mecanismos definidos para la versión actual del sistema.

---

## 9. Datos de tarjetas

### Decisión

La base de datos no almacenará información sensible de tarjetas.

### Justificación

El procesamiento del pago mediante PayPhone debe realizarse a través de la plataforma de pago correspondiente.

---

## 10. Validaciones de negocio

### Decisión

Las reglas que requieren cálculos o procesos complejos serán manejadas por la lógica de negocio y no únicamente mediante restricciones SQL.

### Ejemplos

* Validar stock antes de agregar un producto al carrito.
* Validar cantidad máxima de imágenes.
* Validar dimensiones y tamaño de imágenes.
* Controlar la secuencia de estados de un pedido.
* Validar capacidad de producción.
* Validar que un producto de sublimación tenga al menos una plantilla.
* Procesar y validar comprobantes mediante OCR.
