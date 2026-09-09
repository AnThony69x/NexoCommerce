# Matriz de Trazabilidad RF → Base de Datos

## NexoCommerce — Dulces Aesca

**Responsable:** Melanie
**Área:** Base de Datos y Lógica de Negocio
**Estado:** En desarrollo
**Versión:** 1.0

---

## 1. Objetivo

Esta matriz establece la trazabilidad entre los requisitos funcionales y no funcionales de NexoCommerce y los elementos de la base de datos necesarios para soportarlos.

Su propósito es servir como puente entre:

```text
Requisito
    ↓
Regla de negocio
    ↓
Entidad
    ↓
Tabla
    ↓
Restricción / relación / índice
    ↓
Implementación en Base de Datos
```

La matriz permite identificar qué responsabilidades corresponden directamente a la base de datos y cuáles deben ser implementadas mediante la lógica de negocio del Backend o mediante el Frontend.

La matriz deberá actualizarse cuando cambien los requisitos, las decisiones de diseño o el esquema de la base de datos.

---

# 2. Criterio de trazabilidad

Para cada requisito se identifican:

* **Tablas involucradas:** entidades persistentes relacionadas con el requisito.
* **Soporte requerido:** información que la BD debe almacenar o garantizar.
* **Reglas relacionadas:** reglas que pueden requerir restricciones de BD, validaciones del Backend o comportamiento del Frontend.
* **Responsabilidad:** indica dónde se encuentra principalmente la lógica.
* **Estado:** situación actual de la especificación frente al diseño de BD.

### Estados

* 🟢 **Definido:** existe una definición clara del soporte requerido.
* 🟡 **En desarrollo:** requiere implementación o validación.
* 🟠 **En investigación:** existe una decisión pendiente.
* 🔴 **Pendiente:** requiere definición antes de continuar.

---

# 3. Requisitos Funcionales

## RF-01 — Autenticación de Usuarios

**Módulo:** Gestión de Seguridad
**Actores:** Cliente, Administrador

### Tablas involucradas

* `usuarios`
* `roles`
* `cuentas_oauth`
* `verificaciones_correo`

### Soporte requerido

| Tabla                   | Responsabilidad                                                                     |
| ----------------------- | ----------------------------------------------------------------------------------- |
| `usuarios`              | Almacenar la información de las cuentas, credenciales, estado y datos de seguridad. |
| `roles`                 | Definir los roles disponibles en el sistema.                                        |
| `cuentas_oauth`         | Asociar una cuenta local con un proveedor OAuth.                                    |
| `verificaciones_correo` | Registrar códigos y estados de verificación del correo.                             |

### Reglas relacionadas

* El correo debe ser único.
* La contraseña debe almacenarse como hash.
* Debe existir una relación entre usuario y rol.
* Debe registrarse el número de intentos fallidos.
* Debe poder registrarse el momento hasta el cual una cuenta permanece bloqueada.
* Las cuentas OAuth deben mantenerse separadas de las credenciales locales.

### Responsabilidad

**BD:** persistencia, unicidad, relaciones y estado de seguridad.
**Backend:** autenticación, generación de tokens, validación de contraseña y bloqueo temporal.
**Frontend:** formularios y mensajes al usuario.

**Estado:** 🟠 En investigación por OAuth.

---

# RF-02 — Registro de Nuevos Clientes

**Módulo:** Gestión de Seguridad
**Actor:** Cliente visitante

### Tablas involucradas

* `usuarios`
* `roles`
* `verificaciones_correo`

### Soporte requerido

La BD debe permitir almacenar los datos personales y de contacto del cliente, asociarlo al rol correspondiente y registrar la verificación del correo.

### Reglas relacionadas

* El correo debe ser único.
* Debe almacenarse el teléfono.
* Debe registrarse la aceptación de términos y condiciones.
* Debe conservarse la versión de términos aceptada.
* Debe registrarse la fecha de aceptación.
* El estado de verificación debe poder almacenarse.

### Responsabilidad

**BD:** persistencia, unicidad y relaciones.
**Backend:** validación del formato, envío de correo y proceso de registro.
**Frontend:** formulario y aceptación de términos.

**Estado:** 🟡 En desarrollo.

---

# RF-03 — Publicación y Gestión del Feed de Novedades

**Módulo:** Gestión de Contenido / Catálogo
**Actor:** Administrador

### Tablas involucradas

* `publicaciones`
* `publicacion_multimedia`
* `multimedia`
* `categorias`
* `productos`
* `usuarios`

### Soporte requerido

La BD debe permitir:

* Registrar publicaciones.
* Asociar publicaciones con el administrador que las creó.
* Asociar opcionalmente una publicación con una categoría.
* Asociar opcionalmente una publicación con un producto.
* Asociar múltiples imágenes a una publicación.
* Mantener el orden de las imágenes.

### Reglas relacionadas

* Una publicación debe tener al menos una imagen.
* Una publicación puede ser informativa sin estar asociada a un producto.
* El orden de las imágenes debe poder conservarse.

### Responsabilidad

**BD:** relaciones y persistencia.
**Backend:** validación de cantidad y tamaño de archivos.
**Frontend:** presentación del feed.

**Estado:** 🟡 En desarrollo.

---

# RF-04 — Gestión de Categorías Principales de Productos

**Módulo:** Catálogo
**Actor:** Administrador

### Tablas involucradas

* `categorias`
* `productos`
* `multimedia`

### Soporte requerido

La BD debe permitir:

* Registrar categorías.
* Registrar subcategorías mediante una relación jerárquica.
* Asociar productos con categorías.
* Asociar una imagen representativa.
* Activar o desactivar categorías.

### Reglas relacionadas

* Una categoría puede tener una categoría padre.
* No deben eliminarse categorías que tengan productos activos.
* Las categorías desactivadas deben conservar su información histórica.

### Responsabilidad

**BD:** jerarquía, relaciones y estado.
**Backend:** validación de eliminación/desactivación.
**Frontend:** administración y presentación.

**Estado:** 🟢 Definido.

---

# RF-05 — Cotización y Recomendación de Tortas según Número de Personas

**Módulo:** Repostería
**Actor:** Cliente

### Tablas involucradas

* `productos`
* `tortas`
* `rangos_personas`
* `rango_persona_torta`
* `categorias`

### Soporte requerido

La BD debe almacenar la información necesaria para relacionar las tortas con los rangos de personas.

### Decisión actual del equipo

Los rangos de personas se utilizarán principalmente como **criterio de filtrado y recomendación desde el Frontend/Backend** y no como un módulo de configuración administrativa.

El modelo de datos conservará los rangos y sus relaciones para permitir realizar las consultas correspondientes.

### Reglas relacionadas

* El número de personas debe ser mayor que cero.
* Una torta puede estar relacionada con uno o varios rangos.
* El número de personas se utilizará para realizar recomendaciones.
* El precio mostrado es referencial.
* El sabor de la torta se considera un dato obligatorio de la configuración de tortas.
* Si el número de personas excede los rangos disponibles, la lógica de negocio deberá determinar una alternativa.

### Responsabilidad

**BD:** almacenamiento de rangos, tortas y relaciones.
**Backend:** cálculo/recomendación y reglas de negocio.
**Frontend:** filtros y presentación de recomendaciones.

### Observación

El requisito original indica que los rangos son configurables por el administrador. Esta definición **debe contrastarse con la decisión actual del equipo**, que establece que serán utilizados como filtros.

**Estado:** 🟠 Requiere registrar formalmente la decisión.

---

# RF-06 — Selección y Cobro Adicional de Diseño de Torta

**Módulo:** Repostería
**Actores:** Cliente, Administrador

### Tablas involucradas

* `productos`
* `tortas`
* `disenos_torta`
* `multimedia`
* `carritos`
* `detalles_carrito`
* `pedidos`
* `detalles_pedido`

### Soporte requerido

La BD debe permitir:

* Registrar diseños de tortas.
* Registrar el costo adicional.
* Asociar el diseño con una imagen.
* Seleccionar un diseño durante la configuración de un producto.
* Conservar el diseño seleccionado en el carrito.
* Conservar el diseño seleccionado en el pedido.

### Reglas relacionadas

* El costo adicional debe ser mayor o igual a cero.
* Un producto configurado no debe utilizar simultáneamente varias configuraciones incompatibles.
* El precio final debe considerar el precio base y los costos adicionales.
* Debe existir una alternativa de diseño estándar sin costo adicional.

### Responsabilidad

**BD:** persistencia de diseños y costos.
**Backend:** cálculo del precio y validación de configuración.
**Frontend:** selección del diseño.

**Estado:** 🟡 En desarrollo.

---

# RF-07 — Gestión del Catálogo de Productos de Detalles

**Módulo:** Detalles
**Actor:** Administrador

### Tablas involucradas

* `productos`
* `categorias`
* `detalles`
* `multimedia`
* `producto_multimedia`

### Soporte requerido

La BD debe permitir almacenar:

* Nombre.
* Descripción.
* Precio.
* Stock.
* Estado.
* Imágenes.
* Orden de imágenes.

### Reglas relacionadas

* El precio base debe ser mayor o igual a cero.
* El stock no puede ser negativo.
* Un producto sin stock no debe poder agregarse al carrito.
* Un producto puede tener múltiples imágenes.

### Responsabilidad

**BD:** persistencia, stock y relaciones.
**Backend:** validación de disponibilidad.
**Frontend:** presentación del catálogo.

**Estado:** 🟢 Definido.

---

# RF-08 — Solicitud de Pedido de Producto de Detalles

**Módulo:** Detalles
**Actor:** Cliente

### Tablas involucradas

* `productos`
* `detalles`
* `carritos`
* `detalles_carrito`

### Soporte requerido

La BD debe permitir:

* Asociar un producto a un carrito.
* Registrar cantidad.
* Registrar precio unitario.
* Registrar comentarios.
* Mantener la relación con el producto.

### Reglas relacionadas

* La cantidad debe ser mayor que cero.
* La cantidad solicitada no puede superar el stock.
* El cliente no puede modificar libremente el precio.
* El subtotal debe corresponder a cantidad × precio unitario.

### Responsabilidad

**BD:** almacenamiento y restricciones básicas.
**Backend:** validación de stock y cálculo del subtotal.
**Frontend:** selección de cantidad.

**Estado:** 🟢 Definido.

---

# RF-09 — Gestión del Catálogo de Productos de Sublimación

**Módulo:** Sublimación
**Actor:** Administrador

### Tablas involucradas

* `productos`
* `categorias`
* `sublimaciones`
* `multimedia`
* `producto_multimedia`
* `plantillas_diseno`

### Soporte requerido

La BD debe permitir:

* Registrar productos sublimables.
* Registrar tipo/material.
* Registrar precio base.
* Asociar imágenes.
* Asociar plantillas de diseño.
* Registrar costo adicional de una plantilla cuando corresponda.

### Reglas relacionadas

* Cada producto sublimable debe disponer de al menos una plantilla.
* El precio base no incluye necesariamente el costo de personalización.
* Las plantillas deben pertenecer al producto sublimable correspondiente.

### Responsabilidad

**BD:** estructura y relaciones.
**Backend:** validar que un producto publicado tenga al menos una plantilla.
**Frontend:** administración y visualización.

**Estado:** 🟡 En desarrollo.

---

# RF-10 — Carga de Diseño Personalizado para Sublimación

**Módulo:** Sublimación
**Actor:** Cliente

### Tablas involucradas

* `usuarios`
* `productos`
* `sublimaciones`
* `disenos_personalizados`
* `multimedia`
* `detalles_carrito`

### Soporte requerido

La BD debe permitir:

* Registrar el diseño personalizado.
* Asociarlo al usuario.
* Asociarlo al producto sublimable.
* Asociarlo al recurso multimedia.
* Registrar indicaciones adicionales.

### Reglas relacionadas

* El archivo debe cumplir las restricciones de formato y tamaño.
* La resolución mínima debe validarse antes de aceptar el archivo.
* La vista previa no necesita almacenarse como información estructural de la BD.
* El diseño personalizado debe poder asociarse a una configuración del carrito.

### Responsabilidad

**BD:** persistencia y relaciones.
**Backend:** validación del archivo y generación de vista previa.
**Frontend:** carga y visualización.

**Estado:** 🟡 En desarrollo.

---

# RF-11 — Selección de Diseño desde Plantilla para Sublimación

**Módulo:** Sublimación
**Actor:** Cliente

### Tablas involucradas

* `sublimaciones`
* `plantillas_diseno`
* `detalles_carrito`
* `detalles_pedido`

### Soporte requerido

La BD debe permitir:

* Asociar múltiples plantillas a un producto sublimable.
* Registrar el costo adicional de cada plantilla.
* Identificar la plantilla seleccionada en una configuración del carrito.
* Conservar la plantilla seleccionada en el pedido.

### Reglas relacionadas

* La plantilla seleccionada debe pertenecer al producto sublimable.
* No se debe utilizar simultáneamente una plantilla y un diseño personalizado para una misma configuración.
* El costo adicional puede ser cero.

### Responsabilidad

**BD:** relaciones y persistencia.
**Backend:** validación de compatibilidad y cálculo de precio.
**Frontend:** selección.

**Estado:** 🟡 En desarrollo.

---

# RF-12 — Gestión del Carrito de Compras

**Módulo:** Transversal / Carrito
**Actor:** Cliente

### Tablas involucradas

* `usuarios`
* `carritos`
* `detalles_carrito`
* `productos`
* `disenos_torta`
* `plantillas_diseno`
* `disenos_personalizados`

### Soporte requerido

La BD debe permitir:

* Asociar un carrito a un usuario.
* Mantener un carrito activo.
* Registrar múltiples productos.
* Registrar cantidades.
* Registrar precios unitarios.
* Registrar comentarios.
* Registrar configuraciones de diseño.
* Mantener productos de las tres categorías.

### Reglas relacionadas

* Un usuario debe tener como máximo un carrito activo.
* La cantidad debe ser mayor que cero.
* El precio unitario no puede ser negativo.
* Una configuración no puede tener simultáneamente diseño de torta, plantilla y diseño personalizado.
* El stock debe validarse antes del pago.

### Responsabilidad

**BD:** persistencia y restricciones.
**Backend:** cálculo de totales, validación de stock y reglas de configuración.
**Frontend:** interacción con el carrito.

**Estado:** 🟢 Definido.

---

# RF-13 — Registro y Agenda de Pedidos

**Módulo:** Gestión de Pedidos
**Actor:** Administrador

### Tablas involucradas

* `usuarios`
* `pedidos`
* `detalles_pedido`
* `productos`
* `categorias`
* `configuracion_produccion`

### Soporte requerido

La BD debe permitir:

* Registrar pedidos.
* Asociar pedidos a clientes.
* Registrar fecha de entrega.
* Registrar estado.
* Registrar subtotal y total.
* Registrar los productos incluidos.
* Conservar información histórica del producto en el pedido.
* Registrar configuraciones de producción.

### Reglas relacionadas

* La fecha de entrega es obligatoria.
* El estado debe pertenecer al conjunto permitido.
* Los estados definidos son:

  ```text
  PENDIENTE
      ↓
  EN_PREPARACION
      ↓
  LISTO
      ↓
  ENTREGADO
  ```
* La capacidad de producción debe considerarse antes de agendar pedidos.
* No debe perderse la información histórica del pedido.

### Responsabilidad

**BD:** persistencia, integridad y estados permitidos.
**Backend:** transición secuencial de estados y validación de capacidad.
**Frontend:** agenda y filtros.

**Estado:** 🟡 En desarrollo.

---

# RF-14 — Procesamiento y Verificación de Pagos

**Módulo:** Pagos
**Actores:** Cliente, Administrador

### Tablas involucradas

* `pedidos`
* `pagos`
* `comprobantes_pago`
* `multimedia`
* `usuarios`

### Métodos definidos

* PayPhone.
* Transferencia bancaria.

### Soporte requerido

La BD debe permitir:

* Registrar el método de pago.
* Registrar el estado del pago.
* Registrar el monto.
* Asociar el pago al pedido.
* Registrar la referencia de la pasarela.
* Registrar la fecha de pago.
* Asociar comprobantes de transferencia.
* Registrar quién revisó un comprobante.
* Registrar la fecha y comentario de revisión.

### Reglas relacionadas

* Un pedido no debe considerarse confirmado hasta que el pago sea aprobado.
* No deben almacenarse datos sensibles de tarjetas.
* La información de tarjeta debe ser gestionada por la pasarela.
* Las transferencias deben permitir registrar comprobantes.
* Los comprobantes deben poder ser revisados por el administrador.

### OCR

Se contempla utilizar OCR para el procesamiento de comprobantes.

Quedan pendientes de investigación:

* Unicidad del número de comprobante.
* Validación de la cuenta de destino.
* Datos que serán extraídos mediante OCR.
* Reglas definitivas de validación.

### Responsabilidad

**BD:** registro del pago, estado y comprobantes.
**Backend:** integración con PayPhone, validación y procesamiento OCR.
**Frontend:** selección de método y carga de comprobante.

**Estado:** 🟠 En investigación.

---

# RF-15 — Notificaciones de Estado de Pedido

**Módulo:** Transversal / Notificaciones
**Actores:** Cliente, Administrador

### Tablas involucradas

* `notificaciones`
* `usuarios`
* `pedidos`
* `pagos`

### Soporte requerido

La BD debe permitir:

* Registrar notificaciones.
* Asociarlas a un usuario.
* Asociarlas opcionalmente a un pedido.
* Asociarlas opcionalmente a un pago.
* Registrar tipo, título y mensaje.
* Registrar si fue leída.
* Registrar fecha de lectura.
* Mantener historial.

### Reglas relacionadas

* Las notificaciones deben conservarse para consulta.
* Deben poder relacionarse con el evento que las originó.
* El envío dentro del plazo establecido debe gestionarse mediante Backend/servicios de notificación.

### Responsabilidad

**BD:** almacenamiento e historial.
**Backend:** generación y envío.
**Frontend:** visualización.

**Estado:** 🟡 En desarrollo.

---

# RF-16 — Gestión de Contenido Multimedia

**Módulo:** Administración de Contenido
**Actor:** Administrador

### Tablas involucradas

* `multimedia`
* `producto_multimedia`
* `publicacion_multimedia`
* `disenos_torta`
* `plantillas_diseno`
* `disenos_personalizados`
* `categorias`
* `usuarios`

### Soporte requerido

La BD debe permitir:

* Registrar archivos multimedia.
* Registrar nombre y ruta.
* Registrar tipo MIME.
* Registrar tamaño.
* Registrar dimensiones cuando corresponda.
* Asociar archivos con productos.
* Asociar archivos con publicaciones.
* Asociar archivos con diseños de tortas.
* Asociar archivos con plantillas.
* Asociar archivos con diseños personalizados.
* Registrar el usuario que realizó la carga.

### Reglas relacionadas

* Se permiten JPG, PNG y WEBP.
* Los archivos deben cumplir las restricciones de tamaño.
* Las dimensiones pueden almacenarse para validar resolución.
* Un recurso utilizado activamente no debe eliminarse sin considerar sus relaciones.

### Responsabilidad

**BD:** almacenamiento de metadatos y relaciones.
**Backend:** validación, compresión y gestión física de archivos.
**Almacenamiento externo:** conservación de los archivos.

**Estado:** 🟡 En desarrollo.

---

# 4. Requisitos No Funcionales relacionados con Base de Datos

## RNF-01 — Tiempo de Respuesta de la Plataforma

**Categoría:** Rendimiento y eficiencia
**Prioridad:** Alta

### Elementos BD relacionados

* Índices.
* Claves primarias.
* Claves foráneas.
* Consultas sobre `productos`.
* Consultas sobre `categorias`.
* Consultas sobre `carritos`.
* Consultas sobre `pedidos`.
* Consultas sobre `notificaciones`.

### Soporte requerido

La estructura de BD debe permitir consultas eficientes para catálogo, carrito y pedidos.

### Métricas

* Tiempo promedio ≤ 2 segundos.
* p95 ≤ 3 segundos bajo 50 usuarios concurrentes.

### Responsabilidad

**BD + Backend + Infraestructura.**

La validación definitiva corresponde a pruebas de rendimiento.

**Estado:** 🟡 Pendiente de validación.

---

# RNF-02 — Seguridad en el Procesamiento de Pagos

**Categoría:** Seguridad
**Prioridad:** Alta

### Elementos BD relacionados

* `pagos`
* `pedidos`

### Soporte requerido

La BD no debe almacenar información sensible de tarjetas.

Debe conservar únicamente información necesaria para identificar y consultar el estado de la transacción.

### Regla

```text
Cliente
   ↓
Pasarela certificada
   ↓
Resultado de pago
   ↓
Backend
   ↓
Base de Datos
```

### Responsabilidad

**Pasarela + Backend + Infraestructura + BD.**

**Estado:** 🟡 En desarrollo.

---

# RNF-03 — Seguridad de Acceso y Datos de Usuario

**Categoría:** Seguridad
**Prioridad:** Alta

### Elementos BD relacionados

* `usuarios`
* `roles`
* `cuentas_oauth`
* `verificaciones_correo`

### Soporte requerido

La BD debe almacenar únicamente el hash de la contraseña.

El campo:

```text
usuarios.password_hash
```

debe almacenar el resultado de un algoritmo seguro de hash.

También debe conservarse información relacionada con:

* Intentos fallidos.
* Bloqueo temporal.
* Estado activo.
* Verificación del correo.

### Responsabilidad

**Backend:** hashing y gestión de sesiones/tokens.
**BD:** almacenamiento seguro del hash y estados relacionados.

**Estado:** 🟡 En desarrollo.

---

# RNF-04 — Disponibilidad del Sistema

**Categoría:** Disponibilidad
**Prioridad:** Alta

### Elementos BD relacionados

* PostgreSQL.
* Persistencia de datos.
* Configuración de infraestructura.

### Soporte requerido

La BD debe ejecutarse sobre almacenamiento persistente y contar con mecanismos de recuperación.

### Métrica

* Uptime ≥ 99% mensual.

### Responsabilidad

Principalmente **Infraestructura**, con participación de Base de Datos.

**Estado:** 🟡 Pendiente de integración.

---

# RNF-05 — Usabilidad de la Interfaz

**Categoría:** Usabilidad
**Prioridad:** Alta

### Impacto en BD

No existe una implementación directa de este requisito en la BD.

La base de datos debe proporcionar información consistente para:

* Catálogo.
* Productos.
* Carrito.
* Pedidos.
* Pagos.

### Responsabilidad

Principalmente **Frontend + Backend**.

**Estado:** Informativo para BD.

---

# RNF-06 — Compatibilidad Multiplataforma y Responsividad

**Categoría:** Compatibilidad
**Prioridad:** Alta

### Impacto en BD

No existe una implementación directa en la BD.

El acceso a los datos debe realizarse mediante el Backend/API, independientemente del dispositivo utilizado.

### Responsabilidad

Principalmente **Frontend + Backend**.

**Estado:** Informativo para BD.

---

# RNF-07 — Escalabilidad del Catálogo y Almacenamiento

**Categoría:** Escalabilidad
**Prioridad:** Media

### Elementos BD relacionados

* `productos`
* `categorias`
* `publicaciones`
* `multimedia`
* `producto_multimedia`
* `publicacion_multimedia`
* `plantillas_diseno`
* `disenos_torta`

### Soporte requerido

La estructura debe permitir crecimiento del catálogo y de los recursos multimedia sin degradaciones importantes del rendimiento.

### Consideraciones

* Índices adecuados.
* Relaciones normalizadas.
* Separación de metadatos y archivos.
* Uso de almacenamiento externo para archivos multimedia.

### Métrica

Soportar al menos 5.000 productos/publicaciones e imágenes asociadas sin incremento superior al 20% respecto a la línea base.

### Responsabilidad

**BD + Backend + Infraestructura.**

**Estado:** 🟡 Pendiente de validación.

---

# RNF-08 — Mantenibilidad del Software

**Categoría:** Mantenibilidad
**Prioridad:** Media

### Impacto en BD

La estructura de datos debe mantener separación entre los diferentes tipos de producto y permitir incorporar nuevas funcionalidades sin afectar innecesariamente las existentes.

### Consideraciones

El modelo utiliza:

```text
PRODUCTOS
   ├── TORTAS
   ├── DETALLES
   └── SUBLIMACIONES
```

Esto permite mantener una entidad general para productos y entidades especializadas para cada categoría.

### Responsabilidad

**BD + Backend.**

**Estado:** 🟡 En desarrollo.

---

# RNF-09 — Respaldo y Recuperación de Información

**Categoría:** Fiabilidad
**Módulo:** Base de Datos
**Prioridad:** Alta

### Información crítica

* `usuarios`
* `roles`
* `productos`
* `categorias`
* `carritos`
* `pedidos`
* `detalles_pedido`
* `pagos`
* `comprobantes_pago`
* `notificaciones`
* Configuración del sistema.

### Soporte requerido

La infraestructura debe permitir generar respaldos periódicos de PostgreSQL y restaurarlos ante fallos.

### Métricas

* Respaldo automático diario.
* **RPO ≤ 24 horas.**
* **RTO ≤ 4 horas.**

### Responsabilidad

**Base de Datos + Infraestructura.**

**Estado:** 🟡 Pendiente de implementación y pruebas.

---

# 5. Matriz resumen RF → BD

| Requisito | Módulo               | Tablas principales                                                                 | Estado |
| --------- | -------------------- | ---------------------------------------------------------------------------------- | ------ |
| RF-01     | Seguridad            | `usuarios`, `roles`, `cuentas_oauth`, `verificaciones_correo`                      | 🟠     |
| RF-02     | Registro             | `usuarios`, `roles`, `verificaciones_correo`                                       | 🟡     |
| RF-03     | Feed                 | `publicaciones`, `publicacion_multimedia`, `multimedia`, `productos`, `categorias` | 🟡     |
| RF-04     | Categorías           | `categorias`, `productos`, `multimedia`                                            | 🟢     |
| RF-05     | Repostería           | `tortas`, `rangos_personas`, `rango_persona_torta`, `productos`                    | 🟠     |
| RF-06     | Diseños de torta     | `tortas`, `disenos_torta`, `multimedia`, `detalles_carrito`, `detalles_pedido`     | 🟡     |
| RF-07     | Detalles             | `productos`, `detalles`, `producto_multimedia`, `multimedia`                       | 🟢     |
| RF-08     | Carrito              | `carritos`, `detalles_carrito`, `productos`, `detalles`                            | 🟢     |
| RF-09     | Sublimación          | `productos`, `sublimaciones`, `plantillas_diseno`, `multimedia`                    | 🟡     |
| RF-10     | Diseño personalizado | `disenos_personalizados`, `multimedia`, `sublimaciones`, `usuarios`                | 🟡     |
| RF-11     | Plantillas           | `plantillas_diseno`, `sublimaciones`, `detalles_carrito`, `detalles_pedido`        | 🟡     |
| RF-12     | Carrito              | `carritos`, `detalles_carrito`, `productos`                                        | 🟢     |
| RF-13     | Pedidos              | `pedidos`, `detalles_pedido`, `configuracion_produccion`, `productos`              | 🟡     |
| RF-14     | Pagos                | `pagos`, `comprobantes_pago`, `pedidos`, `multimedia`                              | 🟠     |
| RF-15     | Notificaciones       | `notificaciones`, `usuarios`, `pedidos`, `pagos`                                   | 🟡     |
| RF-16     | Multimedia           | `multimedia`, tablas de asociación                                                 | 🟡     |

---

# 6. Matriz resumen RNF → BD

| Requisito | Impacto en BD     | Elementos principales           | Estado |
| --------- | ----------------- | ------------------------------- | ------ |
| RNF-01    | Directo           | Índices, relaciones, consultas  | 🟡     |
| RNF-02    | Directo           | `pagos`, `pedidos`              | 🟡     |
| RNF-03    | Directo           | `usuarios`, `roles`, seguridad  | 🟡     |
| RNF-04    | Infraestructura   | PostgreSQL, persistencia        | 🟡     |
| RNF-05    | Indirecto         | Datos de catálogo y pedidos     | 🟢     |
| RNF-06    | Indirecto         | Acceso mediante API             | 🟢     |
| RNF-07    | Directo           | Índices, multimedia, relaciones | 🟡     |
| RNF-08    | Directo/indirecto | Modelo de entidades             | 🟡     |
| RNF-09    | Directo           | PostgreSQL, backups y restore   | 🟡     |

---

# 7. Decisiones de diseño identificadas

Durante la elaboración de esta matriz se identifican las siguientes decisiones que deberán mantenerse alineadas con el diseño final:

### 7.1 Sabor de torta

El sabor de la torta se considera un dato obligatorio.

La implementación exacta del atributo deberá definirse durante la revisión del esquema.

### 7.2 Rangos de personas

Los rangos de personas se utilizarán para filtrado y recomendación.

No se considera, por el momento, un módulo administrativo independiente para que el usuario administrador configure dichos rangos.

### 7.3 OAuth

Se mantiene el soporte para Google/Facebook debido a que forma parte del requisito original.

La implementación definitiva queda pendiente de investigación y decisión del equipo.

### 7.4 Pagos

Los métodos contemplados para la plataforma son:

* PayPhone.
* Transferencia bancaria.

La BD no almacenará datos sensibles de tarjetas.

### 7.5 OCR de comprobantes

Se contempla utilizar OCR para procesar comprobantes de transferencia.

Quedan pendientes de definición:

* Unicidad del número de comprobante.
* Validación de cuenta de destino.
* Campos extraídos mediante OCR.
* Reglas de aceptación/rechazo.

---

# 8. Observaciones para la revisión del esquema

Esta sección **no modifica el `database.sql`**. Únicamente registra puntos que deberán comprobarse durante la siguiente etapa.

### 8.1 Sabor de torta

El requisito actualizado establece que el sabor debe ser obligatorio, por lo que deberá comprobarse que exista un mecanismo adecuado para almacenarlo.

### 8.2 Relación entre tortas y diseños

Deberá comprobarse cómo se relaciona un diseño de torta con la torta a la que puede aplicarse.

### 8.3 Plantillas de sublimación

El requisito establece que cada producto de sublimación publicado debe disponer de al menos una plantilla.

Deberá determinarse dónde y cómo se garantiza esta regla.

### 8.4 Configuración de diseños

Debe verificarse que una configuración de producto no pueda utilizar simultáneamente opciones incompatibles:

```text
Diseño de torta
       O
Plantilla de sublimación
       O
Diseño personalizado
```

La regla ya tiene restricciones básicas en carrito y pedido, pero deberá revisarse su comportamiento completo.

### 8.5 Stock

Debe comprobarse que las reglas de stock correspondan únicamente a productos de Detalles y que la validación de disponibilidad se realice correctamente desde la lógica de negocio.

### 8.6 Estados de pedidos

Debe revisarse cómo se garantizará la transición secuencial:

```text
PENDIENTE
    ↓
EN_PREPARACION
    ↓
LISTO
    ↓
ENTREGADO
```

La restricción `CHECK` garantiza valores válidos, pero la transición secuencial corresponde principalmente a la lógica de negocio.

### 8.7 Capacidad de producción

Debe verificarse cómo se relacionará `configuracion_produccion` con los pedidos y cómo se calculará la capacidad disponible.

### 8.8 Pagos

Debe revisarse la cardinalidad entre `pedidos` y `pagos`, así como las reglas para pagos aprobados, rechazados y pendientes.

### 8.9 Comprobantes

La unicidad del número de comprobante y la validación de la cuenta de destino quedan pendientes de investigación.

### 8.10 Multimedia

Debe comprobarse que las relaciones multimedia permitan cumplir RF-03, RF-06, RF-09, RF-10, RF-11 y RF-16 sin duplicar innecesariamente la información.

---

# 9. Trazabilidad general

La relación entre los requisitos y la base de datos se establece de la siguiente manera:

```text
REQUISITOS
    │
    ├── RF-01 ──┐
    ├── RF-02 ──┤
    ├── RF-03 ──┤
    ├── RF-04 ──┤
    ├── RF-05 ──┤
    ├── RF-06 ──┤
    ├── RF-07 ──┤
    ├── RF-08 ──┤
    ├── RF-09 ──┤
    ├── RF-10 ──┤
    ├── RF-11 ──┤
    ├── RF-12 ──┤
    ├── RF-13 ──┤
    ├── RF-14 ──┤
    ├── RF-15 ──┤
    └── RF-16 ──┘
          │
          ▼
    DISEÑO DE BD
          │
          ▼
     database.sql
```

La matriz constituye el documento de trazabilidad entre los requisitos y el diseño de base de datos. El archivo `database.sql` representa la implementación técnica del diseño y será revisado posteriormente contra esta matriz.

---

## Estado del documento

**Versión:** 1.0
**Estado:** En desarrollo
**Responsable:** Melanie
**Última revisión:** Septiembre 2026
