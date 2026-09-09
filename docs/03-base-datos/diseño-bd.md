# DISEÑO DE LA BASE DE DATOS

## Plataforma E-commerce “Dulces Aesca”

**Esquema lógico — 25 tablas — Roles: ADMIN y CLIENTE**

Documento organizado para revisión académica y posterior implementación en Laravel.

---

# 1. Objetivo

La base de datos de **Dulces Aesca** está diseñada para gestionar las operaciones principales de una plataforma e-commerce orientada a productos de repostería, detalles y sublimación.

El modelo contempla usuarios, autenticación, catálogo de productos, categorías y subcategorías, personalización de productos, carrito de compras, pedidos, pagos, comprobantes, capacidad de producción, notificaciones y gestión centralizada de archivos multimedia.

La estructura está diseñada para funcionar como una **instalación independiente del sistema**, de manera que cada negocio pueda disponer posteriormente de su propia base de datos y configuración.

---

# 2. Alcance funcional

La base de datos contempla soporte para:

* Registro y autenticación de usuarios.
* Autenticación mediante cuentas externas OAuth.
* Gestión de clientes y administradores mediante roles.
* Verificación de correo electrónico.
* Bloqueo temporal por intentos fallidos de autenticación.
* Aceptación y control de versión de términos y condiciones.
* Gestión de categorías y subcategorías.
* Gestión del catálogo de productos.
* Productos de repostería, detalles y sublimación.
* Diseños para tortas.
* Plantillas para productos de sublimación.
* Diseños personalizados cargados por los clientes.
* Gestión centralizada de archivos multimedia.
* Publicaciones relacionadas con productos y categorías.
* Carrito de compras.
* Pedidos y conservación de información histórica.
* Gestión de capacidad de producción.
* Pagos mediante pasarela o transferencia.
* Gestión de comprobantes de pago.
* Notificaciones para los usuarios.
* Configuración propia de la tienda.

---

# 3. Roles del sistema

| Rol         | Descripción                                                           | Principales funciones                                                                                                      |
| ----------- | --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **ADMIN**   | Administra la plataforma.                                             | Usuarios, categorías, productos, diseños, plantillas, publicaciones, pedidos, pagos, producción y multimedia.              |
| **CLIENTE** | Utiliza la plataforma para realizar compras y personalizar productos. | Registro, inicio de sesión, selección de productos, personalización, carrito, pedidos, pagos y consulta de notificaciones. |

Los roles se almacenan en la tabla `roles` y se relacionan con los usuarios mediante `usuarios.rol_id`.

---

# 4. Vista general del modelo

```text
ROLES
  │
  └── USUARIOS
       ├── CUENTAS_OAUTH
       ├── VERIFICACIONES_CORREO
       ├── MULTIMEDIA
       ├── PUBLICACIONES
       ├── CARRITOS ── DETALLES_CARRITO
       ├── PEDIDOS ── DETALLES_PEDIDO
       │              └── PAGOS ── COMPROBANTES_PAGO
       ├── DISENOS_PERSONALIZADOS
       └── NOTIFICACIONES


CATEGORIAS
  ├── CATEGORIAS (subcategorías)
  ├── PRODUCTOS
  │    ├── TORTAS ── DISENOS_TORTA
  │    ├── DETALLES
  │    └── SUBLIMACIONES ── PLANTILLAS_DISENO
  ├── CONFIGURACION_PRODUCCION
  └── PUBLICACIONES


PRODUCTOS ── PRODUCTO_MULTIMEDIA ── MULTIMEDIA

PUBLICACIONES ── PUBLICACION_MULTIMEDIA ── MULTIMEDIA

SUBLIMACIONES ── DISENOS_PERSONALIZADOS

DETALLES_CARRITO
  ├── DISENOS_TORTA
  ├── PLANTILLAS_DISENO
  └── DISENOS_PERSONALIZADOS
```

---

# 5. Diccionario de datos

## 5.1 ROLES

Almacena los roles disponibles dentro del sistema.

| Campo    | Tipo / Clave     | Descripción                 | Observación     |
| -------- | ---------------- | --------------------------- | --------------- |
| `id`     | PK               | Identificador único del rol |                 |
| `nombre` | UNIQUE, NOT NULL | Nombre del rol              | ADMIN / CLIENTE |

**Relación:** `ROLES 1:N USUARIOS`

**Datos iniciales:**

* 1 → ADMIN
* 2 → CLIENTE

---

## 5.2 USUARIOS

Almacena la información de las personas que utilizan el sistema.

No se crea una tabla independiente `CLIENTES`; el tipo de usuario se determina mediante el rol asignado.

| Campo                   | Tipo / Clave              | Descripción                                    | Observación                       |
| ----------------------- | ------------------------- | ---------------------------------------------- | --------------------------------- |
| `id`                    | PK                        | Identificador único                            |                                   |
| `rol_id`                | FK → `roles.id`, NOT NULL | Rol asignado                                   |                                   |
| `nombre_completo`       | NOT NULL                  | Nombre completo                                |                                   |
| `correo`                | UNIQUE, NOT NULL          | Correo electrónico                             |                                   |
| `telefono`              |                           | Teléfono o WhatsApp                            |                                   |
| `password_hash`         |                           | Contraseña almacenada mediante hash            | Puede ser NULL para cuentas OAuth |
| `correo_verificado`     | NOT NULL                  | Estado de verificación                         |                                   |
| `intentos_fallidos`     | NOT NULL                  | Cantidad de intentos fallidos                  | No puede ser negativo             |
| `bloqueado_hasta`       |                           | Fecha y hora hasta la cual permanece bloqueado |                                   |
| `terminos_aceptados`    | NOT NULL                  | Indica aceptación de términos                  |                                   |
| `version_terminos`      |                           | Versión de términos aceptada                   |                                   |
| `terminos_aceptados_en` |                           | Fecha y hora de aceptación                     |                                   |
| `activo`                | NOT NULL                  | Estado del usuario                             |                                   |
| `creado_en`             | NOT NULL                  | Fecha de creación                              |                                   |
| `actualizado_en`        | NOT NULL                  | Última modificación                            |                                   |

**Relación:** `ROLES 1:N USUARIOS`

---

## 5.3 CUENTAS_OAUTH

Relaciona usuarios con cuentas externas de autenticación.

| Campo            | Tipo / Clave                 | Descripción                              | Observación       |
| ---------------- | ---------------------------- | ---------------------------------------- | ----------------- |
| `id`             | PK                           | Identificador                            |                   |
| `usuario_id`     | FK → `usuarios.id`, NOT NULL | Usuario asociado                         |                   |
| `proveedor`      | NOT NULL                     | Proveedor externo                        | GOOGLE / FACEBOOK |
| `id_proveedor`   | NOT NULL                     | Identificador de usuario en el proveedor |                   |
| `creado_en`      | NOT NULL                     | Fecha de creación                        |                   |
| `actualizado_en` | NOT NULL                     | Última modificación                      |                   |

**Restricciones:**

* La combinación `proveedor + id_proveedor` es única.
* Los proveedores permitidos actualmente son `GOOGLE` y `FACEBOOK`.

**Relación:** `USUARIOS 1:N CUENTAS_OAUTH`

---

## 5.4 VERIFICACIONES_CORREO

Almacena los códigos utilizados para verificar el correo electrónico de los usuarios.

| Campo        | Tipo / Clave                 | Descripción                       |
| ------------ | ---------------------------- | --------------------------------- |
| `id`         | PK                           | Identificador                     |
| `usuario_id` | FK → `usuarios.id`, NOT NULL | Usuario asociado                  |
| `codigo`     | NOT NULL                     | Código de verificación            |
| `expira_en`  | NOT NULL                     | Fecha y hora de expiración        |
| `usado_en`   |                              | Fecha y hora en que fue utilizado |
| `creado_en`  | NOT NULL                     | Fecha de creación                 |

**Relación:** `USUARIOS 1:N VERIFICACIONES_CORREO`

La generación, expiración y validación de códigos corresponde principalmente a la lógica de negocio.

---

## 5.5 MULTIMEDIA

Repositorio central de archivos multimedia utilizados por productos, diseños, publicaciones, categorías, comprobantes y otros elementos del sistema.

| Campo            | Tipo / Clave       | Descripción                         |
| ---------------- | ------------------ | ----------------------------------- |
| `id`             | PK                 | Identificador                       |
| `nombre_archivo` | NOT NULL           | Nombre del archivo                  |
| `ruta_archivo`   | NOT NULL           | Referencia o ruta de almacenamiento |
| `tipo_mime`      | NOT NULL           | Tipo MIME del archivo               |
| `tamano_bytes`   | NOT NULL           | Tamaño en bytes                     |
| `ancho`          |                    | Ancho de la imagen, cuando aplica   |
| `alto`           |                    | Alto de la imagen, cuando aplica    |
| `activo`         | NOT NULL           | Estado del archivo                  |
| `subido_por_id`  | FK → `usuarios.id` | Usuario que cargó el archivo        |
| `creado_en`      | NOT NULL           | Fecha de creación                   |
| `actualizado_en` | NOT NULL           | Última modificación                 |

**Restricciones:**

* `tamano_bytes >= 0`
* `ancho`, cuando existe, debe ser mayor que 0.
* `alto`, cuando existe, debe ser mayor que 0.

**Relación:** `USUARIOS 1:N MULTIMEDIA`

Los formatos permitidos, tamaños máximos, dimensiones mínimas y reglas de compresión son validados por la lógica de negocio.

---

## 5.6 CONFIGURACION_TIENDA

Almacena la configuración propia de una instalación del sistema.

Permite personalizar la identidad visual y datos comerciales de la tienda sin modificar el código fuente.

Los archivos correspondientes al logo y favicon pueden almacenarse en un servicio de almacenamiento de archivos; PostgreSQL conserva únicamente su referencia.

| Campo              | Tipo / Clave | Descripción                |
| ------------------ | ------------ | -------------------------- |
| `id`               | PK           | Identificador              |
| `nombre_tienda`    | NOT NULL     | Nombre de la tienda        |
| `logo_url`         |              | Referencia al logo         |
| `favicon_url`      |              | Referencia al favicon      |
| `color_primario`   | NOT NULL     | Color principal            |
| `color_secundario` | NOT NULL     | Color secundario           |
| `color_acento`     |              | Color de acento            |
| `color_fondo`      |              | Color de fondo             |
| `color_texto`      |              | Color del texto            |
| `telefono`         |              | Teléfono de contacto       |
| `correo`           |              | Correo de contacto         |
| `direccion`        |              | Dirección de la tienda     |
| `activo`           | NOT NULL     | Estado de la configuración |
| `creado_en`        | NOT NULL     | Fecha de creación          |
| `actualizado_en`   | NOT NULL     | Última modificación        |

**Configuración inicial:** Dulces Aesca.

---

## 5.7 CATEGORIAS

Permite almacenar categorías principales y subcategorías mediante una relación consigo misma.

| Campo                | Tipo / Clave         | Descripción            | Observación                      |
| -------------------- | -------------------- | ---------------------- | -------------------------------- |
| `id`                 | PK                   | Identificador          |                                  |
| `categoria_padre_id` | FK → `categorias.id` | Categoría superior     | NULL para categorías principales |
| `nombre`             | NOT NULL             | Nombre de la categoría |                                  |
| `descripcion`        |                      | Descripción            |                                  |
| `imagen_id`          | FK → `multimedia.id` | Imagen asociada        | Opcional                         |
| `activo`             | NOT NULL             | Estado                 |                                  |
| `creado_en`          | NOT NULL             | Fecha de creación      |                                  |
| `actualizado_en`     | NOT NULL             | Última modificación    |                                  |

**Relaciones:**

* `CATEGORIAS 1:N CATEGORIAS`
* `CATEGORIAS 1:N PRODUCTOS`
* `CATEGORIAS 1:N CONFIGURACION_PRODUCCION`
* `CATEGORIAS 1:N PUBLICACIONES`

**Ejemplos de categorías principales:**

* Repostería
* Detalles
* Sublimación

La cantidad de categorías principales y sus subcategorías corresponde a las reglas funcionales del sistema.

---

## 5.8 PRODUCTOS

Es la tabla general del catálogo.

Los productos específicos se especializan mediante las tablas `TORTAS`, `DETALLES` y `SUBLIMACIONES`.

| Campo            | Tipo / Clave                   | Descripción         |
| ---------------- | ------------------------------ | ------------------- |
| `id`             | PK                             | Identificador       |
| `categoria_id`   | FK → `categorias.id`, NOT NULL | Categoría           |
| `nombre`         | NOT NULL                       | Nombre del producto |
| `descripcion`    |                                | Descripción         |
| `precio_base`    | NOT NULL                       | Precio base         |
| `activo`         | NOT NULL                       | Estado              |
| `creado_en`      | NOT NULL                       | Fecha de creación   |
| `actualizado_en` | NOT NULL                       | Última modificación |

**Restricción:** `precio_base >= 0`

**Relación:** `CATEGORIAS 1:N PRODUCTOS`

---

## 5.9 TORTAS

Contiene información específica de los productos correspondientes a tortas.

| Campo         | Tipo / Clave            | Descripción           | Observación          |
| ------------- | ----------------------- | --------------------- | -------------------- |
| `producto_id` | PK, FK → `productos.id` | Producto asociado     |                      |
| `tamano`      | NOT NULL                | Tamaño de la torta    |                      |
| `porciones`   | NOT NULL                | Cantidad de porciones | Debe ser mayor que 0 |
| `sabor`       | NOT NULL                | Sabor de la torta     | Obligatorio          |

**Relación:** `PRODUCTOS 1:1 TORTAS`

**Nota:** El sabor forma parte de la información propia de la torta y actualmente es un campo obligatorio.

---

## 5.10 DETALLES

Contiene información específica de los productos pertenecientes a la categoría Detalles.

| Campo         | Tipo / Clave            | Descripción             |
| ------------- | ----------------------- | ----------------------- |
| `producto_id` | PK, FK → `productos.id` | Producto asociado       |
| `stock`       | NOT NULL                | Existencias disponibles |

**Restricción:** `stock >= 0`

**Relación:** `PRODUCTOS 1:1 DETALLES`

La validación de que la cantidad solicitada no supere el stock disponible corresponde a la lógica de negocio.

---

## 5.11 SUBLIMACIONES

Contiene información específica de los productos de sublimación.

| Campo           | Tipo / Clave            | Descripción           |
| --------------- | ----------------------- | --------------------- |
| `producto_id`   | PK, FK → `productos.id` | Producto asociado     |
| `tipo_material` | NOT NULL                | Material del producto |

**Relación:** `PRODUCTOS 1:1 SUBLIMACIONES`

**Ejemplos:** tazas, camisetas, cojines u otros productos personalizables.

---

## 5.12 DISENOS_TORTA

Almacena los diseños disponibles para las tortas.

Cada diseño pertenece directamente a una torta específica.

| Campo             | Tipo / Clave                        | Descripción         |
| ----------------- | ----------------------------------- | ------------------- |
| `id`              | PK                                  | Identificador       |
| `torta_id`        | FK → `tortas.producto_id`, NOT NULL | Torta asociada      |
| `nombre`          | NOT NULL                            | Nombre del diseño   |
| `descripcion`     |                                     | Descripción         |
| `costo_adicional` | NOT NULL                            | Costo adicional     |
| `multimedia_id`   | FK → `multimedia.id`                | Imagen del diseño   |
| `activo`          | NOT NULL                            | Estado              |
| `creado_en`       | NOT NULL                            | Fecha de creación   |
| `actualizado_en`  | NOT NULL                            | Última modificación |

**Restricción:** `costo_adicional >= 0`

**Relación:** `TORTAS 1:N DISENOS_TORTA`

El diseño estándar puede utilizar un costo adicional igual a `0.00`.

---

## 5.13 PLANTILLAS_DISENO

Almacena plantillas prediseñadas para productos de sublimación.

| Campo             | Tipo / Clave                     | Descripción             |
| ----------------- | -------------------------------- | ----------------------- |
| `id`              | PK                               | Identificador           |
| `sublimacion_id`  | FK → `sublimaciones.producto_id` | Producto de sublimación |
| `nombre`          | NOT NULL                         | Nombre de la plantilla  |
| `descripcion`     |                                  | Descripción             |
| `costo_adicional` | NOT NULL                         | Costo adicional         |
| `multimedia_id`   | FK → `multimedia.id`             | Archivo de la plantilla |
| `activo`          | NOT NULL                         | Estado                  |
| `creado_en`       | NOT NULL                         | Fecha de creación       |
| `actualizado_en`  | NOT NULL                         | Última modificación     |

**Restricción:** `costo_adicional >= 0`

**Relación:** `SUBLIMACIONES 1:N PLANTILLAS_DISENO`

La existencia de al menos una plantilla por producto de sublimación se valida mediante lógica de negocio.

---

## 5.14 DISENOS_PERSONALIZADOS

Almacena los diseños personalizados cargados por los clientes.

| Campo            | Tipo / Clave                               | Descripción                 |
| ---------------- | ------------------------------------------ | --------------------------- |
| `id`             | PK                                         | Identificador               |
| `usuario_id`     | FK → `usuarios.id`, NOT NULL               | Cliente que carga el diseño |
| `sublimacion_id` | FK → `sublimaciones.producto_id`, NOT NULL | Producto de sublimación     |
| `multimedia_id`  | FK → `multimedia.id`, NOT NULL             | Archivo cargado             |
| `indicaciones`   |                                            | Indicaciones del cliente    |
| `creado_en`      | NOT NULL                                   | Fecha de creación           |
| `actualizado_en` | NOT NULL                                   | Última modificación         |

**Relaciones:**

* `USUARIOS 1:N DISENOS_PERSONALIZADOS`
* `SUBLIMACIONES 1:N DISENOS_PERSONALIZADOS`

---

## 5.15 PRODUCTO_MULTIMEDIA

Tabla intermedia que relaciona productos con sus archivos multimedia.

| Campo           | Tipo / Clave             | Descripción                      |
| --------------- | ------------------------ | -------------------------------- |
| `producto_id`   | PK, FK → `productos.id`  | Producto asociado                |
| `multimedia_id` | PK, FK → `multimedia.id` | Archivo asociado                 |
| `orden`         | NOT NULL                 | Orden de visualización           |
| `es_principal`  | NOT NULL                 | Indica si es la imagen principal |

**Restricción:**

* `orden >= 0`
* Un producto solo puede tener una imagen principal.

**Relación:** `PRODUCTOS N:M MULTIMEDIA`

La cantidad máxima de imágenes permitidas por producto se valida mediante lógica de negocio.

---

## 5.16 PUBLICACIONES

Almacena publicaciones creadas por el administrador.

Una publicación puede estar relacionada opcionalmente con una categoría y/o producto.

| Campo            | Tipo / Clave                 | Descripción           |
| ---------------- | ---------------------------- | --------------------- |
| `id`             | PK                           | Identificador         |
| `usuario_id`     | FK → `usuarios.id`, NOT NULL | Usuario autor         |
| `categoria_id`   | FK → `categorias.id`         | Categoría relacionada |
| `producto_id`    | FK → `productos.id`          | Producto relacionado  |
| `titulo`         | NOT NULL                     | Título                |
| `descripcion`    |                              | Contenido             |
| `activo`         | NOT NULL                     | Estado                |
| `creado_en`      | NOT NULL                     | Fecha de creación     |
| `actualizado_en` | NOT NULL                     | Última modificación   |

**Relaciones:**

* `USUARIOS 1:N PUBLICACIONES`
* `CATEGORIAS 1:N PUBLICACIONES`
* `PRODUCTOS 1:N PUBLICACIONES`

Las relaciones con categoría y producto son opcionales.

---

## 5.17 PUBLICACION_MULTIMEDIA

Tabla intermedia para asociar archivos multimedia a una publicación.

| Campo            | Tipo / Clave                | Descripción            |
| ---------------- | --------------------------- | ---------------------- |
| `publicacion_id` | PK, FK → `publicaciones.id` | Publicación            |
| `multimedia_id`  | PK, FK → `multimedia.id`    | Archivo                |
| `orden`          | NOT NULL                    | Orden de visualización |

**Restricción:** `orden >= 0`

**Relación:** `PUBLICACIONES N:M MULTIMEDIA`

La cantidad de imágenes permitidas por publicación se valida mediante lógica de negocio.

---

## 5.18 CARRITOS

Representa el carrito de compras de los clientes.

| Campo            | Tipo / Clave                 | Descripción         |
| ---------------- | ---------------------------- | ------------------- |
| `id`             | PK                           | Identificador       |
| `usuario_id`     | FK → `usuarios.id`, NOT NULL | Cliente propietario |
| `activo`         | NOT NULL                     | Estado del carrito  |
| `creado_en`      | NOT NULL                     | Fecha de creación   |
| `actualizado_en` | NOT NULL                     | Última modificación |

**Relación:** `USUARIOS 1:N CARRITOS`

**Restricción:** un usuario solo puede tener un carrito activo.

---

## 5.19 DETALLES_CARRITO

Contiene los productos agregados a un carrito.

| Campo                     | Tipo / Clave                     | Descripción                    |
| ------------------------- | -------------------------------- | ------------------------------ |
| `id`                      | PK                               | Identificador                  |
| `carrito_id`              | FK → `carritos.id`, NOT NULL     | Carrito                        |
| `producto_id`             | FK → `productos.id`, NOT NULL    | Producto                       |
| `cantidad`                | NOT NULL                         | Cantidad solicitada            |
| `precio_unitario`         | NOT NULL                         | Precio utilizado en el carrito |
| `comentario`              |                                  | Comentario del cliente         |
| `diseno_torta_id`         | FK → `disenos_torta.id`          | Diseño de torta                |
| `plantilla_diseno_id`     | FK → `plantillas_diseno.id`      | Plantilla de sublimación       |
| `diseno_personalizado_id` | FK → `disenos_personalizados.id` | Diseño personalizado           |
| `creado_en`               | NOT NULL                         | Fecha de creación              |
| `actualizado_en`          | NOT NULL                         | Última modificación            |

**Restricciones:**

* `cantidad > 0`
* `precio_unitario >= 0`
* No se pueden utilizar simultáneamente `diseno_torta_id`, `plantilla_diseno_id` y `diseno_personalizado_id`.

**Relaciones:**

* `CARRITOS 1:N DETALLES_CARRITO`
* `PRODUCTOS 1:N DETALLES_CARRITO`

La compatibilidad entre el producto y el tipo de configuración seleccionada se valida mediante lógica de negocio.

---

## 5.20 PEDIDOS

Representa una compra realizada por un cliente.

| Campo            | Tipo / Clave                 | Descripción         |
| ---------------- | ---------------------------- | ------------------- |
| `id`             | PK                           | Identificador       |
| `usuario_id`     | FK → `usuarios.id`, NOT NULL | Cliente             |
| `fecha_entrega`  | NOT NULL                     | Fecha solicitada    |
| `estado`         | NOT NULL                     | Estado del pedido   |
| `subtotal`       | NOT NULL                     | Subtotal            |
| `total`          | NOT NULL                     | Total               |
| `creado_en`      | NOT NULL                     | Fecha de creación   |
| `actualizado_en` | NOT NULL                     | Última modificación |

**Estados permitidos:**

```text
PENDIENTE
     ↓
EN_PREPARACION
     ↓
LISTO
     ↓
ENTREGADO
```

**Relación:** `USUARIOS 1:N PEDIDOS`

La validación de que los estados no se salten corresponde a la lógica de negocio.

---

## 5.21 DETALLES_PEDIDO

Almacena los productos que forman parte de un pedido y conserva información histórica.

| Campo                     | Tipo / Clave                     | Descripción                 |
| ------------------------- | -------------------------------- | --------------------------- |
| `id`                      | PK                               | Identificador               |
| `pedido_id`               | FK → `pedidos.id`                | Pedido                      |
| `producto_id`             | FK → `productos.id`              | Producto                    |
| `nombre_producto`         | NOT NULL                         | Nombre histórico            |
| `cantidad`                | NOT NULL                         | Cantidad                    |
| `precio_unitario`         | NOT NULL                         | Precio histórico            |
| `subtotal`                | NOT NULL                         | Subtotal                    |
| `tipo_configuracion`      |                                  | Tipo de configuración       |
| `nombre_diseno`           |                                  | Nombre histórico del diseño |
| `costo_diseno`            | NOT NULL                         | Costo histórico del diseño  |
| `indicaciones`            |                                  | Indicaciones                |
| `diseno_torta_id`         | FK → `disenos_torta.id`          | Diseño de torta             |
| `plantilla_diseno_id`     | FK → `plantillas_diseno.id`      | Plantilla                   |
| `diseno_personalizado_id` | FK → `disenos_personalizados.id` | Diseño personalizado        |
| `creado_en`               | NOT NULL                         | Fecha de creación           |

**Restricciones:**

* `cantidad > 0`
* `precio_unitario >= 0`
* `subtotal >= 0`
* `costo_diseno >= 0`
* Solo una configuración puede estar asociada simultáneamente.

**Relaciones:**

* `PEDIDOS 1:N DETALLES_PEDIDO`
* `PRODUCTOS 1:N DETALLES_PEDIDO`

La información histórica permite conservar el nombre, precio y configuración utilizada aunque el catálogo cambie posteriormente.

---

## 5.22 CONFIGURACION_PRODUCCION

Permite establecer la capacidad máxima de producción para una fecha determinada.

| Campo              | Tipo / Clave         | Descripción                 |
| ------------------ | -------------------- | --------------------------- |
| `id`               | PK                   | Identificador               |
| `fecha`            | NOT NULL             | Fecha de producción/entrega |
| `categoria_id`     | FK → `categorias.id` | Categoría a la que aplica   |
| `capacidad_maxima` | NOT NULL             | Capacidad máxima            |
| `activo`           | NOT NULL             | Estado                      |
| `creado_en`        | NOT NULL             | Fecha de creación           |
| `actualizado_en`   | NOT NULL             | Última modificación         |

**Restricción:** `capacidad_maxima > 0`

**Relación:** `CATEGORIAS 1:N CONFIGURACION_PRODUCCION`

La comprobación de capacidad disponible al momento de registrar un pedido corresponde a la lógica de negocio.

---

## 5.23 PAGOS

Registra los pagos asociados a los pedidos.

| Campo                 | Tipo / Clave      | Descripción         | Observación                      |
| --------------------- | ----------------- | ------------------- | -------------------------------- |
| `id`                  | PK                | Identificador       |                                  |
| `pedido_id`           | FK → `pedidos.id` | Pedido asociado     |                                  |
| `metodo`              | NOT NULL          | Método de pago      | PASARELA / TRANSFERENCIA         |
| `estado`              | NOT NULL          | Estado del pago     | PENDIENTE / APROBADO / RECHAZADO |
| `monto`               | NOT NULL          | Monto pagado        |                                  |
| `referencia_pasarela` |                   | Referencia externa  | Para pagos mediante pasarela     |
| `fecha_pago`          |                   | Fecha del pago      |                                  |
| `creado_en`           | NOT NULL          | Fecha de creación   |                                  |
| `actualizado_en`      | NOT NULL          | Última modificación |                                  |

**Relación:** `PEDIDOS 1:N PAGOS`

### Métodos de pago

La base de datos utiliza el concepto general:

```text
PASARELA
TRANSFERENCIA
```

`PASARELA` permite mantener el modelo independiente del proveedor específico que finalmente se utilice. Por ejemplo, la integración podría realizarse mediante PayPhone u otra pasarela compatible.

No se almacenan datos sensibles de tarjetas en la base de datos propia.

---

## 5.24 COMPROBANTES_PAGO

Almacena los comprobantes asociados principalmente a pagos mediante transferencia.

| Campo                 | Tipo / Clave         | Descripción                  |
| --------------------- | -------------------- | ---------------------------- |
| `id`                  | PK                   | Identificador                |
| `pago_id`             | FK → `pagos.id`      | Pago asociado                |
| `multimedia_id`       | FK → `multimedia.id` | Archivo del comprobante      |
| `revisado_por_id`     | FK → `usuarios.id`   | Administrador que revisó     |
| `fecha_revision`      |                      | Fecha de revisión            |
| `comentario_revision` |                      | Comentario del administrador |
| `creado_en`           | NOT NULL             | Fecha de creación            |

**Relaciones:**

* `PAGOS 1:N COMPROBANTES_PAGO`
* `USUARIOS 1:N COMPROBANTES_PAGO`

La revisión, validación del comprobante y aprobación del pago corresponden a la lógica de negocio.

---

## 5.25 NOTIFICACIONES

Almacena las notificaciones generadas para los usuarios.

| Campo           | Tipo / Clave       | Descripción          |
| --------------- | ------------------ | -------------------- |
| `id`            | PK                 | Identificador        |
| `usuario_id`    | FK → `usuarios.id` | Usuario destinatario |
| `pedido_id`     | FK → `pedidos.id`  | Pedido relacionado   |
| `pago_id`       | FK → `pagos.id`    | Pago relacionado     |
| `tipo`          | NOT NULL           | Tipo de notificación |
| `titulo`        | NOT NULL           | Título               |
| `mensaje`       | NOT NULL           | Mensaje              |
| `leida`         | NOT NULL           | Estado de lectura    |
| `fecha_lectura` |                    | Fecha de lectura     |
| `creado_en`     | NOT NULL           | Fecha de creación    |

Las referencias a pedido y pago son opcionales.

**Relaciones:**

* `USUARIOS 1:N NOTIFICACIONES`
* `PEDIDOS 1:N NOTIFICACIONES`
* `PAGOS 1:N NOTIFICACIONES`

---

# 6. Relaciones generales y cardinalidades

| Tabla origen  | Cardinalidad | Tabla destino            |
| ------------- | -----------: | ------------------------ |
| ROLES         |          1:N | USUARIOS                 |
| USUARIOS      |          1:N | CUENTAS_OAUTH            |
| USUARIOS      |          1:N | VERIFICACIONES_CORREO    |
| USUARIOS      |          1:N | MULTIMEDIA               |
| USUARIOS      |          1:N | PUBLICACIONES            |
| USUARIOS      |          1:N | CARRITOS                 |
| USUARIOS      |          1:N | PEDIDOS                  |
| USUARIOS      |          1:N | DISENOS_PERSONALIZADOS   |
| USUARIOS      |          1:N | COMPROBANTES_PAGO        |
| USUARIOS      |          1:N | NOTIFICACIONES           |
| CATEGORIAS    |          1:N | CATEGORIAS               |
| CATEGORIAS    |          1:N | PRODUCTOS                |
| CATEGORIAS    |          1:N | CONFIGURACION_PRODUCCION |
| CATEGORIAS    |          1:N | PUBLICACIONES            |
| PRODUCTOS     |          1:1 | TORTAS                   |
| PRODUCTOS     |          1:1 | DETALLES                 |
| PRODUCTOS     |          1:1 | SUBLIMACIONES            |
| TORTAS        |          1:N | DISENOS_TORTA            |
| SUBLIMACIONES |          1:N | PLANTILLAS_DISENO        |
| SUBLIMACIONES |          1:N | DISENOS_PERSONALIZADOS   |
| PRODUCTOS     |          N:M | MULTIMEDIA               |
| PUBLICACIONES |          N:M | MULTIMEDIA               |
| CARRITOS      |          1:N | DETALLES_CARRITO         |
| PRODUCTOS     |          1:N | DETALLES_CARRITO         |
| PEDIDOS       |          1:N | DETALLES_PEDIDO          |
| PRODUCTOS     |          1:N | DETALLES_PEDIDO          |
| PEDIDOS       |          1:N | PAGOS                    |
| PAGOS         |          1:N | COMPROBANTES_PAGO        |
| PEDIDOS       |          1:N | NOTIFICACIONES           |
| PAGOS         |          1:N | NOTIFICACIONES           |

---

# 7. Reglas de negocio importantes

## Usuarios

* Solo existen los roles `ADMIN` y `CLIENTE`.
* El correo electrónico debe ser único.
* Las contraseñas deben almacenarse mediante hash.
* Después de 5 intentos fallidos, la cuenta debe bloquearse durante 15 minutos.
* El cliente debe aceptar los términos y condiciones.
* El correo electrónico debe ser verificado antes de utilizar determinadas funcionalidades.
* La autenticación mediante OAuth puede utilizar proveedores externos autorizados.

## Categorías

* Existen categorías principales para Repostería, Detalles y Sublimación.
* Las categorías pueden tener subcategorías.
* Las categorías principales no pueden tener nombres repetidos.
* Una categoría que tenga productos activos no debe eliminarse; debe desactivarse.

## Productos

* Todos los productos pertenecen a una categoría.
* Los productos específicos se especializan mediante `TORTAS`, `DETALLES` o `SUBLIMACIONES`.
* Los productos pueden estar activos o inactivos.
* El precio base no puede ser negativo.

## Tortas

* Cada torta debe registrar tamaño, cantidad de porciones y sabor.
* El sabor de la torta es obligatorio.
* Una torta puede tener uno o varios diseños.
* Los diseños pueden generar un costo adicional.
* El diseño estándar puede tener costo adicional igual a cero.
* La recomendación de tortas según cantidad de personas se maneja como una funcionalidad de consulta o filtrado y no requiere una tabla independiente de rangos de personas.

## Detalles

* Los productos de detalles mantienen stock.
* La cantidad agregada al carrito no puede superar el stock disponible.
* Un producto sin stock no puede agregarse al carrito.

## Sublimación

* Los productos de sublimación pueden disponer de plantillas prediseñadas.
* El cliente puede seleccionar una plantilla o cargar un diseño personalizado.
* No se permite utilizar simultáneamente una plantilla y un diseño personalizado para el mismo detalle de carrito o pedido.
* Los diseños personalizados deben cumplir las restricciones establecidas para archivos.

## Multimedia

* Los archivos se gestionan mediante una tabla centralizada.
* Los formatos permitidos y tamaños máximos se validan mediante lógica de negocio.
* Las imágenes personalizadas deben cumplir las dimensiones mínimas establecidas por los requisitos.
* Un producto solo puede tener una imagen marcada como principal.
* Los archivos utilizados por registros existentes deben manejarse mediante desactivación o reemplazo cuando corresponda.

## Carrito

* Puede contener productos de las diferentes categorías.
* El subtotal y total deben recalcularse automáticamente.
* Los costos adicionales de diseños deben considerarse en el cálculo.
* El cliente no puede modificar manualmente el precio establecido por el sistema.
* Antes de confirmar el pedido debe verificarse nuevamente la disponibilidad.
* Un usuario solo puede tener un carrito activo.

## Pedidos

* La fecha de entrega es obligatoria.
* Debe comprobarse la capacidad de producción antes de aceptar un pedido.
* Los precios y nombres de los productos deben conservarse como información histórica.
* Los estados deben seguir la secuencia:

```text
PENDIENTE
    ↓
EN_PREPARACION
    ↓
LISTO
    ↓
ENTREGADO
```

* No se deben permitir saltos de estado.

## Pagos

* Se permite pago mediante una pasarela de pago o transferencia.
* La base de datos utiliza `PASARELA` como categoría general para el proveedor externo.
* Los comprobantes de transferencia deben ser revisados por un administrador.
* El pedido solo debe considerarse confirmado cuando el pago correspondiente haya sido aprobado o verificado.
* No se almacenan datos de tarjetas en la base de datos propia.
* La integración específica con la pasarela de pago corresponde al backend.

## Notificaciones

* Se generan notificaciones relacionadas con cambios de estado de pedidos.
* Se generan notificaciones relacionadas con estados de pagos.
* Se pueden generar notificaciones por confirmaciones y cambios importantes realizados por el administrador.
* Las notificaciones pueden marcarse como leídas.

---

# 8. Resumen de las 25 tablas

| N.º | Tabla                    |
| --: | ------------------------ |
|   1 | ROLES                    |
|   2 | USUARIOS                 |
|   3 | CUENTAS_OAUTH            |
|   4 | VERIFICACIONES_CORREO    |
|   5 | MULTIMEDIA               |
|   6 | CONFIGURACION_TIENDA     |
|   7 | CATEGORIAS               |
|   8 | PRODUCTOS                |
|   9 | TORTAS                   |
|  10 | DETALLES                 |
|  11 | SUBLIMACIONES            |
|  12 | DISENOS_TORTA            |
|  13 | PLANTILLAS_DISENO        |
|  14 | DISENOS_PERSONALIZADOS   |
|  15 | PRODUCTO_MULTIMEDIA      |
|  16 | PUBLICACIONES            |
|  17 | PUBLICACION_MULTIMEDIA   |
|  18 | CARRITOS                 |
|  19 | DETALLES_CARRITO         |
|  20 | PEDIDOS                  |
|  21 | DETALLES_PEDIDO          |
|  22 | CONFIGURACION_PRODUCCION |
|  23 | PAGOS                    |
|  24 | COMPROBANTES_PAGO        |
|  25 | NOTIFICACIONES           |

---

# 9. Decisiones tomadas para el diseño

1. Solo existen dos roles: `ADMIN` y `CLIENTE`.

2. No se crea una tabla independiente `CLIENTES`; los clientes son usuarios con rol `CLIENTE`.

3. No se utiliza una tabla `PERSONAL_AUTORIZADO`.

4. No se crea una tabla de direcciones, debido a que los requisitos actuales no establecen un módulo independiente para gestión de direcciones.

5. La autenticación mediante sesiones, tokens y mecanismos de seguridad será gestionada principalmente por Laravel y la capa de aplicación.

6. La autenticación OAuth se representa mediante `CUENTAS_OAUTH`, permitiendo mantener separada la información del proveedor externo.

7. Los productos se manejan mediante una tabla general `PRODUCTOS` y tablas especializadas para tortas, detalles y sublimaciones.

8. Los archivos multimedia se centralizan en `MULTIMEDIA`.

9. Las relaciones muchos a muchos utilizan tablas intermedias, como `PRODUCTO_MULTIMEDIA` y `PUBLICACION_MULTIMEDIA`.

10. Los pedidos conservan información histórica de productos, nombres, precios y configuraciones utilizadas.

11. Los diseños de torta se relacionan directamente con una torta mediante `DISENOS_TORTA.torta_id`.

12. El sabor de la torta se almacena directamente en `TORTAS` y es obligatorio.

13. Los rangos de personas no se almacenan como entidades configurables en la base de datos; la recomendación por cantidad de personas se maneja como una funcionalidad de consulta o filtrado.

14. Los métodos de pago utilizan `PASARELA` como categoría general en lugar de acoplar la base de datos a un proveedor específico.

15. Las reglas que requieren validaciones complejas se implementarán mediante la lógica de negocio del backend.

16. El esquema contempla una tabla `CONFIGURACION_TIENDA` para almacenar la configuración propia de cada instalación.

17. El diseño actual corresponde al esquema lógico y estructural de PostgreSQL; la implementación mediante migraciones, modelos, servicios y controladores corresponde posteriormente a Laravel.

---

# 10. Reglas que corresponden a la lógica de negocio

No todas las reglas funcionales deben convertirse en restricciones SQL. Las siguientes serán validadas principalmente por el backend:

* Bloqueo después de 5 intentos fallidos durante 15 minutos.
* Validación de contraseña.
* Verificación de correo.
* Aceptación de términos.
* Compatibilidad entre categoría y tipo de producto.
* Cantidad máxima de imágenes.
* Tamaño máximo de archivos.
* Formatos de archivo permitidos.
* Dimensiones mínimas de diseños personalizados.
* Cantidad máxima de productos en determinadas condiciones.
* Validación de stock antes de agregar al carrito.
* Revalidación del stock antes de confirmar el pedido.
* Compatibilidad entre producto y configuración seleccionada.
* Existencia de al menos una plantilla para productos de sublimación.
* Prohibición de utilizar simultáneamente plantilla y diseño personalizado.
* Cálculo de subtotal y total.
* Validación de capacidad de producción.
* Secuencia de estados de los pedidos.
* Revisión y aprobación de comprobantes.
* Validación mediante OCR.
* Integración con la pasarela de pago.
* Envío de notificaciones por correo.
* Reglas de reemplazo de archivos multimedia en uso.

La base de datos proporciona las claves, relaciones, restricciones, índices y estructuras necesarias para soportar estas reglas.

---

# 11. Consideraciones de integridad y restricciones

El esquema utiliza restricciones de PostgreSQL para proteger la integridad de los datos, incluyendo:

* Claves primarias.
* Claves foráneas.
* Restricciones `NOT NULL`.
* Restricciones `UNIQUE`.
* Restricciones `CHECK`.
* Índices para consultas frecuentes.
* Índices únicos parciales para reglas específicas.

Entre las reglas directamente respaldadas por la base de datos se encuentran:

* Correos de usuario únicos.
* Identificadores OAuth únicos por proveedor.
* Precios y costos no negativos.
* Stock no negativo.
* Cantidad de productos mayor que cero.
* Estados de pedido válidos.
* Estados de pago válidos.
* Un único carrito activo por usuario.
* Una única imagen principal por producto.
* No utilizar simultáneamente diferentes tipos de configuración en un detalle de carrito o pedido.

---

# 12. Índices principales

Se incluyen índices para mejorar el acceso a información utilizada frecuentemente:

* Usuarios por rol.
* Productos por categoría.
* Productos por estado activo.
* Categorías por categoría padre.
* Pedidos por usuario.
* Pedidos por fecha de entrega.
* Pedidos por estado.
* Pagos por pedido.
* Notificaciones por usuario.
* Multimedia por usuario que realizó la carga.

Estos índices buscan apoyar el rendimiento de las consultas habituales del sistema.

---

# 13. Configuración inicial de la instalación

La instalación inicial contempla:

**Tienda:**

```text
Dulces Aesca
```

**Roles:**

```text
ADMIN
CLIENTE
```

La configuración visual inicial contempla colores de la tienda y referencias para logo y favicon.

La información específica de cada instalación puede modificarse posteriormente sin alterar la estructura general de la base de datos.

---

# 14. Conclusión

El esquema propuesto permite cubrir los principales requerimientos funcionales de la plataforma e-commerce **Dulces Aesca**, manteniendo separadas las responsabilidades relacionadas con usuarios, autenticación, catálogo, categorías, personalización, multimedia, carrito, pedidos, pagos, producción y notificaciones.

La versión actual está compuesta por **25 tablas**, alineadas con el esquema SQL vigente.

Las decisiones tomadas permiten mantener un modelo flexible, especialmente en aspectos como la integración con pasarelas de pago, almacenamiento de archivos multimedia y aplicación de reglas complejas mediante la lógica de negocio.

La estructura está preparada para una posterior implementación en Laravel mediante migraciones, modelos, relaciones, servicios y demás componentes de la aplicación.
