# Especificación de Requisitos de Software
Responsable de los RF y RNF lider del proyecto: Emilio Cardenas

**Plataforma E-commerce — Repostería, Detalles y Sublimación**

Requisitos Funcionales (RF) y Requisitos No Funcionales (RNF)

Fuente: [Requisitos_Funcionales_y_No_Funcionales.pdf](./Requisitos_Funcionales_y_No_Funcionales.pdf)

**Alineacion SDD (2026-09-23):** RF-01 y RF-02 quedan alineados al contrato aprobado en `docs/04-api/specs/01-autenticacion.spec.md` y `02-usuarios.spec.md` (implementados en Fase 1). Si el negocio cambia una regla, primero se actualiza la spec y luego el codigo.

El presente documento describe los requisitos funcionales y no funcionales identificados para el desarrollo de una plataforma de comercio electrónico destinada a un negocio actualmente gestionado a través de redes sociales y pedidos coordinados manualmente por WhatsApp. La plataforma contempla tres categorías principales de producto (Repostería, Detalles y Sublimación), un módulo de publicaciones tipo feed, gestión de pedidos y agenda de entregas, y procesamiento/verificación de pagos.

## Contenido

- [1. Requisitos Funcionales (RF)](#1-requisitos-funcionales-rf)
  - [RF-01: Autenticación de Usuarios](#rf-01-autenticación-de-usuarios)
  - [RF-02: Registro de Nuevos Clientes](#rf-02-registro-de-nuevos-clientes)
  - [RF-03: Publicación y Gestión del Feed de Novedades](#rf-03-publicación-y-gestión-del-feed-de-novedades)
  - [RF-04: Gestión de Categorías Principales de Productos](#rf-04-gestión-de-categorías-principales-de-productos)
  - [RF-05: Cotización y Recomendación de Tortas según Número de Personas (Repostería)](#rf-05-cotización-y-recomendación-de-tortas-según-número-de-personas-repostería)
  - [RF-06: Selección y Cobro Adicional de Diseño de Torta (Repostería)](#rf-06-selección-y-cobro-adicional-de-diseño-de-torta-repostería)
  - [RF-07: Gestión del Catálogo de Productos de Detalles (Ficha tipo Marketplace)](#rf-07-gestión-del-catálogo-de-productos-de-detalles-ficha-tipo-marketplace)
  - [RF-08: Solicitud de Pedido de Producto de Detalles](#rf-08-solicitud-de-pedido-de-producto-de-detalles)
  - [RF-09: Gestión del Catálogo de Productos de Sublimación](#rf-09-gestión-del-catálogo-de-productos-de-sublimación)
  - [RF-10: Carga de Diseño Personalizado para Sublimación](#rf-10-carga-de-diseño-personalizado-para-sublimación)
  - [RF-11: Selección de Diseño desde Plantilla para Sublimación](#rf-11-selección-de-diseño-desde-plantilla-para-sublimación)
  - [RF-12: Gestión del Carrito de Compras](#rf-12-gestión-del-carrito-de-compras)
  - [RF-13: Registro y Agenda de Pedidos (Panel del Administrador)](#rf-13-registro-y-agenda-de-pedidos-panel-del-administrador)
  - [RF-14: Procesamiento y Verificación de Pagos](#rf-14-procesamiento-y-verificación-de-pagos)
  - [RF-15: Notificaciones de Estado de Pedido](#rf-15-notificaciones-de-estado-de-pedido)
  - [RF-16: Gestión de Contenido Multimedia (Imágenes, Diseños y Plantillas)](#rf-16-gestión-de-contenido-multimedia-imágenes-diseños-y-plantillas)
- [2. Requisitos No Funcionales (RNF)](#2-requisitos-no-funcionales-rnf)
  - [RNF-01: Tiempo de Respuesta de la Plataforma](#rnf-01-tiempo-de-respuesta-de-la-plataforma)
  - [RNF-02: Seguridad en el Procesamiento de Pagos](#rnf-02-seguridad-en-el-procesamiento-de-pagos)
  - [RNF-03: Seguridad de Acceso y Datos de Usuario](#rnf-03-seguridad-de-acceso-y-datos-de-usuario)
  - [RNF-04: Disponibilidad del Sistema](#rnf-04-disponibilidad-del-sistema)
  - [RNF-05: Usabilidad de la Interfaz](#rnf-05-usabilidad-de-la-interfaz)
  - [RNF-06: Compatibilidad Multiplataforma y Responsividad](#rnf-06-compatibilidad-multiplataforma-y-responsividad)
  - [RNF-07: Escalabilidad del Catálogo y Almacenamiento](#rnf-07-escalabilidad-del-catálogo-y-almacenamiento)
  - [RNF-08: Mantenibilidad del Software](#rnf-08-mantenibilidad-del-software)
  - [RNF-09: Respaldo y Recuperación de Información](#rnf-09-respaldo-y-recuperación-de-información)

---

## 1. Requisitos Funcionales (RF)

### RF-01: Autenticación de Usuarios

> **Contrato SDD:** [`01-autenticacion.spec.md`](../04-api/specs/01-autenticacion.spec.md) · [`02-usuarios.spec.md`](../04-api/specs/02-usuarios.spec.md)

| Campo | Detalle |
| :--- | :--- |
| Categoría / Módulo | Gestión de Seguridad |
| Actor(es) Involucrado(s) | Cliente (`CLIENTE`), Administrador (`ADMIN`) |
| Descripción Detallada | El sistema debe permitir inicio de sesión con correo y contraseña, y con OAuth de Google. El mismo endpoint autentica a todos los roles; la autorización (privilegios de gestión) se aplica según `roles.nombre`. Tokens: Laravel Sanctum (Bearer). |
| Datos de Entrada (Inputs) | Correo (obligatorio); contraseña (obligatorio, mínimo 8 caracteres); o payload OAuth (`proveedor`, `id_proveedor`, datos de perfil). |
| Datos de Salida (Outputs) | Token Bearer Sanctum y datos del usuario (`rol` incluido) para que el cliente (web/móvil) enrute al panel correspondiente. |
| Criterio de Aceptación / Verificación | Credenciales válidas autenticadas al 100%; inválidas rechazadas al 100%; tiempo de respuesta acorde a RNF-01 (&lt; 2 s promedio). |

**Reglas de Negocio**

- RN-01: La contraseña de entrada tiene mínimo 8 caracteres; se almacena hasheada. Cuentas solo OAuth pueden tener `password_hash` nulo. *(Alineado a RN-AUTH-03; no se exige mayúscula/número en el contrato API vigente.)*
- RN-02: Tras 5 intentos fallidos, la cuenta se bloquea 15 minutos (`bloqueado_hasta`). Login en ese intervalo responde 429. *(RN-AUTH-06)*
- RN-03: Roles del sistema: `ADMIN` y `CLIENTE`. Puede haber más de un `ADMIN`; no se permite dejar el sistema sin ningún `ADMIN` activo. *(RN-USR-01, RN-USR-04. No existe el rol «Personal autorizado».)*
- RN-04: Usuario con `activo = false` no puede autenticarse (403). *(RN-AUTH-10)*

**Flujo Principal (Paso a Paso)**

1. El usuario ingresa a la pantalla de inicio de sesión.
2. Ingresa credenciales o selecciona inicio de sesión con Google (OAuth).
3. El sistema valida las credenciales (o vincula/crea cuenta OAuth según RN-AUTH-09).
4. El sistema emite un token Bearer y retorna el perfil con `rol`.
5. En caso de error, el sistema responde con el envelope JSON y `codigo_error` correspondiente.

### RF-02: Registro de Nuevos Clientes

> **Contrato SDD:** [`01-autenticacion.spec.md`](../04-api/specs/01-autenticacion.spec.md) §4.1 · verificación §4.5–4.6

| Campo | Detalle |
| :--- | :--- |
| Categoría / Módulo | Gestión de Seguridad |
| Actor(es) Involucrado(s) | Cliente (visitante) |
| Descripción Detallada | El sistema debe permitir que un visitante cree una cuenta con rol `CLIENTE`, proporcionando datos personales y de contacto, aceptación de términos, y recibiendo un código de verificación por correo. |
| Datos de Entrada (Inputs) | Nombre completo (obligatorio); correo (obligatorio, formato válido, único); contraseña (obligatorio, mín. 8, con confirmación); teléfono/WhatsApp (opcional, máx. 20); `terminos_aceptados` (obligatorio, true); `version_terminos` (obligatorio). |
| Datos de Salida (Outputs) | Cuenta creada (`correo_verificado = false`), registro en `verificaciones_correo`, correo con código de 6 dígitos, y token Bearer para uso inmediato de la API. |
| Criterio de Aceptación / Verificación | El 100% de los registros con datos válidos se completan (201); el 100% de correos duplicados se rechazan (422 sobre `correo`). |

**Reglas de Negocio**

- RN-01: El correo electrónico debe ser único en el sistema. *(RN-AUTH-01)*
- RN-02: El teléfono es opcional (`nullable`). Si se envía, máximo 20 caracteres. *(Formato país-específico Ecuador +593 queda como mejora futura; no forma parte del contrato API v1.1.)*
- RN-03: El cliente debe aceptar términos y condiciones (`terminos_aceptados = true` + `version_terminos`) antes de completar el registro. *(RN-AUTH-04)*
- RN-04: Todo registro público asigna rol `CLIENTE`. *(RN-AUTH-02)*
- RN-05: Tras el registro se crea `verificaciones_correo` (código + `expira_en` 24 h) y se envía el código al correo del usuario. *(RN-AUTH-05)*

**Flujo Principal (Paso a Paso)**

1. El cliente accede a «Crear cuenta».
2. Completa el formulario (incluye aceptación de términos).
3. El sistema valida unicidad del correo y reglas de contraseña.
4. El sistema crea el usuario, inserta el código de verificación y envía el correo.
5. La API responde 201 con token; el cliente puede verificar el correo con `POST /auth/verificar-correo` cuando reciba el código.

### RF-03: Publicación y Gestión del Feed de Novedades

| Campo | Detalle |
| :--- | :--- |
| Categoría / Módulo | Gestión de Contenido / Catálogo |
| Actor(es) Involucrado(s) | Administrador |
| Descripción Detallada | El sistema debe permitir al administrador publicar en una sección tipo «feed» o «novedades» los productos, trabajos realizados y promociones, con imágenes, descripción y categoría asociada, replicando la dinámica de publicación actualmente usada en redes sociales. |
| Datos de Entrada (Inputs) | Título (texto, obligatorio); descripción (texto, obligatorio); imágenes (uno o varios archivos JPG/PNG, obligatorio mínimo 1); categoría asociada (selección, opcional). |
| Datos de Salida (Outputs) | Publicación visible en el feed público con miniaturas de imágenes y enlace a la categoría o producto relacionado. |
| Criterio de Aceptación / Verificación | Toda publicación válida debe visualizarse en el feed en menos de 5 segundos tras ser guardada, con las imágenes cargadas correctamente en todos los dispositivos. |

**Reglas de Negocio**

- RN-01: Cada publicación debe tener mínimo 1 y máximo 10 imágenes.
- RN-02: El tamaño máximo permitido por imagen es de 2 MB.
- RN-03: Las publicaciones pueden asociarse a un producto existente o ser solo informativas.

**Flujo Principal (Paso a Paso)**

1. El administrador accede al panel de «Publicaciones».
2. Completa el formulario con título, descripción e imágenes.
3. Selecciona la categoría asociada (opcional).
4. El sistema valida y publica el contenido.
5. El contenido se muestra en orden cronológico en el feed.

### RF-04: Gestión de Categorías Principales de Productos

| Campo | Detalle |
| :--- | :--- |
| Categoría / Módulo | Catálogo |
| Actor(es) Involucrado(s) | Administrador |
| Descripción Detallada | El sistema debe permitir administrar las tres categorías principales del negocio (Repostería, Detalles, Sublimación) y sus subcategorías, permitiendo activar/desactivar categorías y editar su información descriptiva. |
| Datos de Entrada (Inputs) | Nombre de categoría (texto); descripción (texto); imagen representativa (archivo); estado (activo/inactivo). |
| Datos de Salida (Outputs) | Listado de categorías disponibles, visible para el cliente en la página principal. |
| Criterio de Aceptación / Verificación | Los cambios en categorías deben reflejarse en el catálogo público en menos de 3 segundos, sin necesidad de recargar manualmente. |

**Reglas de Negocio**

- RN-01: No se pueden eliminar categorías con productos asociados activos, solo desactivarlas.
- RN-02: Cada categoría principal puede tener subcategorías (ej. Repostería → Tortas, Cupcakes, Postres).

**Flujo Principal (Paso a Paso)**

1. El administrador ingresa al módulo «Categorías».
2. Crea, edita o desactiva una categoría.
3. El sistema valida la información.
4. El sistema actualiza el catálogo visible al cliente.

### RF-05: Cotización y Recomendación de Tortas según Número de Personas (Repostería)

| Campo | Detalle |
| :--- | :--- |
| Categoría / Módulo | Repostería |
| Actor(es) Involucrado(s) | Cliente |
| Descripción Detallada | El sistema debe permitir al cliente indicar la cantidad de personas para las que requiere una torta y, en función de ese dato, recomendar automáticamente el tipo de torta, tamaño y número de porciones más adecuado, mostrando el precio referencial. |
| Datos de Entrada (Inputs) | Número de personas (numérico, obligatorio, mínimo 1); tipo de evento (opcional); sabor preferido (obligatorio). |
| Datos de Salida (Outputs) | Lista de recomendaciones (torta, tamaño, porciones estimadas, precio) ordenadas por afinidad al número de personas ingresado. |
| Criterio de Aceptación / Verificación | El sistema debe generar al menos una recomendación válida para el 100% de los rangos de personas configurados, en un tiempo inferior a 2 segundos. |

**Reglas de Negocio**

- RN-01: Cada rango de personas está asociado a un tamaño y número de porciones predefinidos, configurables por el administrador (ej. 1-10 personas = torta pequeña de 12 porciones).
- RN-02: Si el número de personas excede el máximo configurado, el sistema debe sugerir combinación de productos o contacto directo.
- RN-03: El precio mostrado es referencial y puede variar según el diseño elegido.

**Flujo Principal (Paso a Paso)**

1. El cliente ingresa al módulo «Repostería».
2. Ingresa la cantidad de personas y filtros opcionales.
3. El sistema calcula y muestra las recomendaciones.
4. El cliente selecciona una opción para continuar con el pedido.

### RF-06: Selección y Cobro Adicional de Diseño de Torta (Repostería)

| Campo | Detalle |
| :--- | :--- |
| Categoría / Módulo | Repostería |
| Actor(es) Involucrado(s) | Cliente, Administrador |
| Descripción Detallada | El sistema debe permitir al administrador subir un catálogo de diseños de tortas (imágenes) con su respectivo costo adicional, y al cliente seleccionar uno de dichos diseños al configurar su pedido, el cliente sube un diseño personalizado, sumando el costo del diseño al precio final. |
| Datos de Entrada (Inputs) | Imagen del diseño (archivo, obligatorio); nombre del diseño (texto); costo adicional (numérico, obligatorio, mayor o igual a 0), descripción o comentario por parte del cliente. |
| Datos de Salida (Outputs) | Galería de diseños disponibles con precio; diseño seleccionado añadido al resumen del pedido. |
| Criterio de Aceptación / Verificación | El precio final mostrado debe coincidir exactamente con la suma del precio base de la torta más el costo del diseño seleccionado, en el 100% de los casos. |

**Reglas de Negocio**

- RN-01: Un pedido de torta solo puede tener un diseño principal seleccionado.
- RN-02: si el cliente elige un diseño personalizado, indicarle que tiene un tiempo de espera y luego se le proporcionara el precio
- RN-03: El costo del diseño se suma automáticamente al subtotal del producto.

**Flujo Principal (Paso a Paso)**

1. El cliente selecciona una torta recomendada.
2. El sistema muestra la galería de diseños disponibles.
3. El cliente elige un diseño.
4. El sistema recalcula el precio total incluyendo el diseño.
5. El cliente confirma la configuración del producto.

### RF-07: Gestión del Catálogo de Productos de Detalles (Ficha tipo Marketplace)

| Campo | Detalle |
| :--- | :--- |
| Categoría / Módulo | Detalles |
| Actor(es) Involucrado(s) | Administrador |
| Descripción Detallada | El sistema debe permitir al administrador crear fichas de producto para la categoría «Detalles», cada una con múltiples fotografías, descripción, precio fijo y stock, similar a una ficha de producto de un marketplace, donde cada detalle es un producto único e independiente. |
| Datos de Entrada (Inputs) | Nombre del producto (texto, obligatorio); descripción (texto, obligatorio); galería de imágenes (mínimo 1, máximo 8); precio (numérico, obligatorio); stock disponible (numérico, opcional). |
| Datos de Salida (Outputs) | Ficha de producto publicada, visible en el catálogo de Detalles con galería de imágenes navegable. |
| Criterio de Aceptación / Verificación | El 100% de las fichas publicadas deben mostrar correctamente todas las imágenes cargadas y el precio, en menos de 3 segundos de carga. |

**Reglas de Negocio**

- RN-01: Cada producto de Detalles debe tener un precio fijo (no se cotiza como en Repostería).
- RN-02: Si el stock llega a 0, el producto se muestra como «Agotado» y no puede añadirse al carrito.
- RN-03: Las imágenes deben mantener relación de aspecto uniforme para la galería.

**Flujo Principal (Paso a Paso)**

1. El administrador crea un nuevo producto en «Detalles».
2. Sube imágenes, descripción y precio.
3. El sistema valida y publica la ficha.
4. El producto aparece disponible en el catálogo para los clientes.

### RF-08: Solicitud de Pedido de Producto de Detalles

| Campo | Detalle |
| :--- | :--- |
| Categoría / Módulo | Detalles |
| Actor(es) Involucrado(s) | Cliente |
| Descripción Detallada | El sistema debe permitir al cliente seleccionar un producto de la categoría Detalles, indicar la cantidad y agregarlo al carrito de compras para su posterior pago. |
| Datos de Entrada (Inputs) | Producto seleccionado (referencia); cantidad (numérico, obligatorio, mínimo 1); comentario adicional (texto, opcional). |
| Datos de Salida (Outputs) | Producto añadido al carrito con subtotal calculado. |
| Criterio de Aceptación / Verificación | El sistema debe impedir agregar cantidades mayores al stock disponible en el 100% de los casos y reflejar el subtotal correcto de inmediato. |

**Reglas de Negocio**

- RN-01: La cantidad solicitada no puede superar el stock disponible.
- RN-02: El precio unitario no puede ser modificado por el cliente.

**Flujo Principal (Paso a Paso)**

1. El cliente visualiza la ficha de un producto de Detalles.
2. Selecciona la cantidad deseada.
3. Presiona «Agregar al carrito».
4. El sistema valida el stock y agrega el producto.
5. El sistema actualiza el resumen del carrito.

### RF-09: Gestión del Catálogo de Productos de Sublimación

| Campo | Detalle |
| :--- | :--- |
| Categoría / Módulo | Sublimación |
| Actor(es) Involucrado(s) | Administrador |
| Descripción Detallada | El sistema debe permitir al administrador registrar los distintos productos sublimables (tazas, camisetas, cojines, etc.), incluyendo imágenes referenciales, precio base y las plantillas de diseño disponibles para cada producto. |
| Datos de Entrada (Inputs) | Nombre del producto (texto, obligatorio); tipo/material (selección); imagen referencial (archivo, obligatorio); precio base (numérico, obligatorio); plantillas asociadas (una o varias imágenes). |
| Datos de Salida (Outputs) | Producto de sublimación publicado en el catálogo con sus plantillas visibles. |
| Criterio de Aceptación / Verificación | El 100% de los productos publicados deben mostrar correctamente su imagen, precio base y al menos una plantilla asociada. |

**Reglas de Negocio**

- RN-01: Cada producto debe tener al menos una plantilla de diseño predefinida disponible.
- RN-02: El precio base no incluye diseño personalizado; este puede generar un costo adicional configurable.

**Flujo Principal (Paso a Paso)**

1. El administrador crea un nuevo producto de sublimación.
2. Sube imagen, precio base y plantillas.
3. El sistema valida y publica el producto.
4. El producto queda disponible para los clientes.

### RF-10: Carga de Diseño Personalizado para Sublimación

| Campo | Detalle |
| :--- | :--- |
| Categoría / Módulo | Sublimación |
| Actor(es) Involucrado(s) | Cliente |
| Descripción Detallada | El sistema debe permitir al cliente subir su propio diseño o imagen (logo, foto, arte personalizado) para aplicarlo sobre un producto de sublimación seleccionado, permitiéndole obtener una vista previa aproximada del resultado. |
| Datos de Entrada (Inputs) | Archivo de imagen (JPG/PNG, obligatorio, tamaño máximo configurable); producto sublimable seleccionado (referencia); indicaciones adicionales (texto, opcional). |
| Datos de Salida (Outputs) | Vista previa del producto con el diseño superpuesto; pedido personalizado añadido al carrito. |
| Criterio de Aceptación / Verificación | El sistema debe generar la vista previa en menos de 4 segundos y rechazar archivos que no cumplan el formato o tamaño permitido en el 100% de los casos. |

**Reglas de Negocio**

- RN-01: al momento de cargar la imagen se debe renderizar en un espacio en el cual debería estar el tamaño del objeto, (una taza tiene un tamaño 19x12 cm.
- RN-02: El archivo cargado debe tener una resolución mínima de 800x800 px para garantizar calidad de impresión.
- RN-03: El tamaño máximo de archivo permitido es de 10 MB.
- RN-04: La vista previa es referencial y no constituye el resultado final exacto de impresión.

**Flujo Principal (Paso a Paso)**

1. El cliente selecciona un producto de sublimación.
2. Elige la opción «Subir mi propio diseño».
3. Carga el archivo de imagen.
4. El sistema genera una vista previa superponiendo el diseño sobre el producto.
5. El cliente confirma y agrega el producto personalizado al carrito.

### RF-11: Selección de Diseño desde Plantilla para Sublimación

| Campo | Detalle |
| :--- | :--- |
| Categoría / Módulo | Sublimación |
| Actor(es) Involucrado(s) | Cliente |
| Descripción Detallada | El sistema debe permitir al cliente elegir uno de los diseños predefinidos (plantillas) asociados a un producto de sublimación, en lugar de subir uno propio, para agilizar el proceso de pedido. |
| Datos de Entrada (Inputs) | Producto sublimable seleccionado (referencia); plantilla elegida (referencia, obligatorio). |
| Datos de Salida (Outputs) | Producto configurado con la plantilla seleccionada, añadido al carrito. |
| Criterio de Aceptación / Verificación | El sistema debe mostrar únicamente las plantillas asociadas al producto seleccionado, sin errores, en el 100% de los casos. |

**Reglas de Negocio**

- RN-01: El cliente debe elegir entre «subir diseño propio» o «usar plantilla», no ambas opciones simultáneamente para un mismo producto.
- RN-02: Las plantillas no generan costo adicional salvo que el administrador lo configure expresamente.

**Flujo Principal (Paso a Paso)**

1. El cliente selecciona un producto de sublimación.
2. Elige la opción «Usar plantilla existente».
3. El sistema muestra las plantillas disponibles para ese producto.
4. El cliente selecciona una plantilla.
5. El sistema agrega el producto configurado al carrito.

### RF-12: Gestión del Carrito de Compras

| Campo | Detalle |
| :--- | :--- |
| Categoría / Módulo | Transversal / Carrito |
| Actor(es) Involucrado(s) | Cliente |
| Descripción Detallada | El sistema debe permitir al cliente visualizar, modificar cantidades, eliminar productos y ver el resumen total de su pedido antes de proceder al pago, incluyendo productos de las tres categorías (Repostería, Detalles, Sublimación). |
| Datos de Entrada (Inputs) | Acciones sobre productos en el carrito (modificar cantidad, eliminar). |
| Datos de Salida (Outputs) | Resumen del carrito con subtotales por producto, costos adicionales (diseños) y total general. |
| Criterio de Aceptación / Verificación | El total mostrado debe coincidir exactamente con la suma de los subtotales de todos los productos en el 100% de los casos, actualizándose en menos de 1 segundo. |

**Reglas de Negocio**

- RN-01: El carrito debe recalcular automáticamente el total ante cualquier modificación.
- RN-02: Los productos con stock agotado durante la sesión deben notificarse al cliente antes de continuar al pago.

**Flujo Principal (Paso a Paso)**

1. El cliente accede al carrito.
2. Revisa los productos añadidos.
3. Modifica cantidades o elimina productos si lo requiere.
4. El sistema recalcula el total.
5. El cliente confirma y procede al pago.

### RF-13: Registro y Agenda de Pedidos (Panel del Administrador)

| Campo | Detalle |
| :--- | :--- |
| Categoría / Módulo | Gestión de Pedidos |
| Actor(es) Involucrado(s) | Administrador |
| Descripción Detallada | El sistema debe permitir al administrador visualizar todos los pedidos realizados por los clientes, organizados por fecha de entrega/agendamiento, con su respectivo estado (pendiente, en preparación, listo, entregado), evitando la pérdida o confusión de pedidos que actualmente ocurre al gestionarlos manualmente por WhatsApp. |
| Datos de Entrada (Inputs) | Filtros de búsqueda (rango de fechas, estado, categoría, cliente). |
| Datos de Salida (Outputs) | Vista tipo calendario/lista de pedidos agendados con el detalle de cada uno (productos, cliente, fecha de entrega, estado, monto). |
| Criterio de Aceptación / Verificación | El sistema debe mostrar el 100% de los pedidos registrados sin duplicidades ni pérdidas, permitiendo identificar la fecha de entrega de cada uno de forma clara e inmediata. |

**Reglas de Negocio**

- RN-01: Todo pedido debe tener asociada una fecha de entrega obligatoria, definida por el cliente o el administrador.
- RN-02: No se pueden agendar pedidos que excedan la capacidad diaria de producción configurada por el administrador (ej. máximo de tortas por día).
- RN-03: El estado del pedido solo puede avanzar de forma secuencial (pendiente → en preparación → listo → entregado).

**Flujo Principal (Paso a Paso)**

1. El administrador accede al módulo «Pedidos».
2. Visualiza los pedidos en formato calendario o lista.
3. Filtra por fecha, estado o cliente.
4. Selecciona un pedido para ver el detalle o actualizar su estado.
5. El sistema guarda los cambios y notifica al cliente si corresponde.

### RF-14: Procesamiento y Verificación de Pagos

| Campo | Detalle |
| :--- | :--- |
| Categoría / Módulo | Pagos |
| Actor(es) Involucrado(s) | Cliente, Administrador |
| Descripción Detallada | El sistema debe permitir al cliente pagar su pedido mediante una pasarela de pago en línea (tarjeta de crédito/débito) o registrar un comprobante de transferencia/depósito para verificación manual por parte del administrador, dejando constancia del estado del pago en el pedido. |
| Datos de Entrada (Inputs) | Método de pago (selección: pasarela / transferencia); datos de tarjeta (gestionados por la pasarela, si aplica); comprobante de pago (archivo imagen/PDF, si aplica transferencia). |
| Datos de Salida (Outputs) | Confirmación de pago exitoso o pendiente de verificación; actualización del estado del pedido. |
| Criterio de Aceptación / Verificación | El sistema debe reflejar el estado correcto del pago (aprobado/pendiente/rechazado) en el 100% de los casos, y ningún dato sensible de tarjeta debe quedar almacenado en la base de datos propia. |

**Reglas de Negocio**

- RN-01: Un pedido no se considera «confirmado» hasta que el pago sea aprobado por la pasarela o verificado manualmente por el administrador.
- RN-02: Los datos de tarjeta nunca deben almacenarse en los servidores propios del sistema; deben ser gestionados directamente por la pasarela de pago certificada.
- RN-03: Los comprobantes de transferencia deben ser revisados por el administrador en un plazo máximo configurable (ej. 24 horas).

**Flujo Principal (Paso a Paso)**

1. El cliente confirma el pedido y accede al módulo de pago.
2. Selecciona el método de pago (pasarela o transferencia).
3. Si es pasarela, el sistema redirige y recibe la confirmación automática; si es transferencia, el cliente sube el comprobante.
4. El sistema actualiza el estado del pedido según el resultado del pago.
5. El sistema notifica al cliente y al administrador el resultado.

### RF-15: Notificaciones de Estado de Pedido

| Campo | Detalle |
| :--- | :--- |
| Categoría / Módulo | Transversal / Notificaciones |
| Actor(es) Involucrado(s) | Cliente, Administrador |
| Descripción Detallada | El sistema debe notificar automáticamente al cliente y al administrador ante cambios relevantes en el estado del pedido (confirmación, pago verificado, en preparación, listo para entrega), mediante correo electrónico y/o notificación dentro de la plataforma. |
| Datos de Entrada (Inputs) | Evento generado por el sistema (cambio de estado de pedido o de pago). |
| Datos de Salida (Outputs) | Correo electrónico o notificación en plataforma con el detalle del cambio. |
| Criterio de Aceptación / Verificación | El 100% de los cambios de estado relevantes deben generar una notificación correctamente entregada en un tiempo inferior a 1 minuto. |

**Reglas de Negocio**

- RN-01: Toda notificación debe enviarse en un plazo máximo de 1 minuto tras generado el evento.
- RN-02: El cliente debe poder consultar el historial de notificaciones dentro de su cuenta.

**Flujo Principal (Paso a Paso)**

1. Se genera un evento de cambio de estado en el sistema.
2. El sistema identifica al destinatario correspondiente.
3. El sistema genera y envía la notificación.
4. La notificación queda registrada en el historial del usuario.

### RF-16: Gestión de Contenido Multimedia (Imágenes, Diseños y Plantillas)

| Campo | Detalle |
| :--- | :--- |
| Categoría / Módulo | Transversal / Administración de Contenido |
| Actor(es) Involucrado(s) | Administrador |
| Descripción Detallada | El sistema debe proveer un panel centralizado donde el administrador pueda subir, editar y eliminar las imágenes de productos, diseños de tortas y plantillas de sublimación utilizadas en las distintas categorías del catálogo. |
| Datos de Entrada (Inputs) | Archivos de imagen (JPG/PNG); categoría/módulo de destino (selección); metadatos (nombre, descripción). |
| Datos de Salida (Outputs) | Repositorio de imágenes organizado y disponible para su uso en las distintas fichas de producto. |
| Criterio de Aceptación / Verificación | El sistema debe procesar y dejar disponible cualquier imagen válida en menos de 5 segundos, rechazando el 100% de los formatos no permitidos. |

**Reglas de Negocio**

- RN-01: Solo se permiten formatos JPG, PNG y WEBP.
- RN-02: El sistema debe comprimir automáticamente las imágenes que superen los 5 MB sin pérdida de calidad visual perceptible.
- RN-03: No se puede eliminar una imagen en uso activo en un producto publicado sin antes reemplazarla.

**Flujo Principal (Paso a Paso)**

1. El administrador accede al módulo «Multimedia».
2. Sube o selecciona las imágenes a gestionar.
3. Asigna la categoría y los metadatos correspondientes.
4. El sistema valida formato y tamaño.
5. El sistema almacena y hace disponible el archivo para su uso en el catálogo.

---

## 2. Requisitos No Funcionales (RNF)

### RNF-01: Tiempo de Respuesta de la Plataforma

| Campo | Detalle |
| :--- | :--- |
| Categoría (ISO/IEC 25010) | Rendimiento y Eficiencia de Comportamiento |
| Módulo(s) Afectado(s) | Transversal / Servidor Backend (API REST) |
| Prioridad | Alta (Must) |
| Especificación Formal | El sistema debe procesar y responder las peticiones HTTP/REST del catálogo, carrito y pedidos en tiempos óptimos, garantizando un tiempo de respuesta promedio inferior a 2.0 segundos bajo condiciones normales de carga. |
| Métrica Objetiva Cuantificable | Tiempo de respuesta promedio ≤ 2.0 s; percentil 95 (p95) ≤ 3.0 s bajo 50 usuarios concurrentes. |

**Escenario BDD (Dado / Cuando / Entonces)**

- Dado que la API REST está desplegada en el servidor de pruebas con el catálogo completo cargado,
- Cuando se simulan 50 usuarios concurrentes navegando el catálogo y agregando productos al carrito,
- Entonces el sistema debe responder con un tiempo medio inferior a 2.0 segundos y una tasa de error del 0%.

**Estrategia y Método de Validación (QA)**

- Técnica: Pruebas de carga y rendimiento (Load Testing).
- Herramienta: Apache JMeter / K6.
- Entorno: Servidor de Pruebas (Staging).

### RNF-02: Seguridad en el Procesamiento de Pagos

| Campo | Detalle |
| :--- | :--- |
| Categoría (ISO/IEC 25010) | Seguridad |
| Módulo(s) Afectado(s) | Módulo de Pagos |
| Prioridad | Alta (Must) |
| Especificación Formal | El sistema debe garantizar que toda transacción de pago se realice mediante una pasarela certificada PCI-DSS y que la comunicación entre cliente y servidor se cifre mediante HTTPS/TLS 1.2 o superior, sin almacenar datos sensibles de tarjetas en los servidores propios. |
| Métrica Objetiva Cuantificable | 100% de las conexiones bajo TLS 1.2 o superior; 0 datos de tarjeta almacenados en la base de datos propia; pasarela integrada con certificación PCI-DSS vigente. |

**Escenario BDD (Dado / Cuando / Entonces)**

- Dado que un cliente inicia el proceso de pago,
- Cuando ingresa los datos de su tarjeta en el formulario de la pasarela,
- Entonces los datos deben viajar cifrados directamente a la pasarela sin pasar ni almacenarse en el servidor propio del negocio.

**Estrategia y Método de Validación (QA)**

- Técnica: Análisis de tráfico y pruebas de penetración básicas.
- Herramienta: OWASP ZAP / Burp Suite.
- Entorno: Servidor de Pruebas (Staging).

### RNF-03: Seguridad de Acceso y Datos de Usuario

| Campo | Detalle |
| :--- | :--- |
| Categoría (ISO/IEC 25010) | Seguridad |
| Módulo(s) Afectado(s) | Transversal |
| Prioridad | Alta (Must) |
| Especificación Formal | El sistema debe cifrar las contraseñas de los usuarios mediante un algoritmo de hash seguro (bcrypt o equivalente) y proteger las sesiones activas mediante tokens con expiración configurable. |
| Métrica Objetiva Cuantificable | Contraseñas almacenadas con hash bcrypt (factor de costo ≥ 10); expiración de sesión por inactividad ≤ 60 minutos. |

**Escenario BDD (Dado / Cuando / Entonces)**

- Dado que un usuario registra su contraseña,
- Cuando el sistema la almacena en la base de datos,
- Entonces debe guardarse únicamente en formato hash, sin texto plano visible en ningún registro.

**Estrategia y Método de Validación (QA)**

- Técnica: Análisis estático de código y revisión de base de datos.
- Herramienta: SonarQube.
- Entorno: Servidor de Pruebas (Staging).

### RNF-04: Disponibilidad del Sistema

| Campo | Detalle |
| :--- | :--- |
| Categoría (ISO/IEC 25010) | Disponibilidad (Fiabilidad) |
| Módulo(s) Afectado(s) | Transversal / Infraestructura |
| Prioridad | Alta (Must) |
| Especificación Formal | El sistema debe mantenerse operativo y accesible para clientes y administrador con un porcentaje mínimo de disponibilidad (uptime), considerando que reemplaza la atención constante que actualmente se realiza por WhatsApp. |
| Métrica Objetiva Cuantificable | Uptime ≥ 99.0% mensual; tiempo de indisponibilidad programada notificado con 24 horas de anticipación. |

**Escenario BDD (Dado / Cuando / Entonces)**

- Dado que el sistema se encuentra en producción,
- Cuando se monitorea su disponibilidad durante un mes calendario,
- Entonces el tiempo total de inactividad no planificada no debe superar el 1% del tiempo total.

**Estrategia y Método de Validación (QA)**

- Técnica: Monitoreo continuo de disponibilidad (uptime monitoring).
- Herramienta: UptimeRobot / Pingdom.
- Entorno: Producción.

### RNF-05: Usabilidad de la Interfaz

| Campo | Detalle |
| :--- | :--- |
| Categoría (ISO/IEC 25010) | Usabilidad |
| Módulo(s) Afectado(s) | Transversal / Frontend |
| Prioridad | Alta (Must) |
| Especificación Formal | El sistema debe ofrecer una interfaz intuitiva y de fácil navegación para clientes acostumbrados a comprar por redes sociales, minimizando la curva de aprendizaje al realizar un pedido de principio a fin. |
| Métrica Objetiva Cuantificable | Puntaje SUS (System Usability Scale) ≥ 75/100; máximo 4 pasos para completar un pedido desde el catálogo hasta el pago. |

**Escenario BDD (Dado / Cuando / Entonces)**

- Dado que un cliente nuevo ingresa por primera vez a la plataforma,
- Cuando intenta completar un pedido de un producto sin ayuda externa,
- Entonces debe lograrlo en menos de 5 minutos y calificar la experiencia con un puntaje SUS igual o superior a 75.

**Estrategia y Método de Validación (QA)**

- Técnica: Encuesta SUS y pruebas de usuario.
- Herramienta: Formulario SUS / Google Forms.
- Entorno: Producción / Beta cerrada.

### RNF-06: Compatibilidad Multiplataforma y Responsividad

| Campo | Detalle |
| :--- | :--- |
| Categoría (ISO/IEC 25010) | Compatibilidad (Portabilidad) |
| Módulo(s) Afectado(s) | Transversal / Frontend |
| Prioridad | Alta (Must) |
| Especificación Formal | El sistema debe visualizarse y funcionar correctamente en los navegadores y dispositivos móviles más utilizados por los clientes actuales, principalmente smartphones, dado que la venta se originaba en redes sociales. |
| Métrica Objetiva Cuantificable | Compatibilidad funcional en Chrome, Safari y Edge (últimas 2 versiones); diseño responsive validado en resoluciones desde 360 px hasta 1920 px. |

**Escenario BDD (Dado / Cuando / Entonces)**

- Dado que un cliente accede desde un dispositivo móvil de gama media,
- Cuando navega el catálogo y realiza un pedido,
- Entonces todos los elementos deben visualizarse correctamente sin errores de diseño ni pérdida de funcionalidad.

**Estrategia y Método de Validación (QA)**

- Técnica: Pruebas multi-navegador y multi-dispositivo.
- Herramienta: BrowserStack.
- Entorno: Servidor de Pruebas (Staging).

### RNF-07: Escalabilidad del Catálogo y Almacenamiento

| Campo | Detalle |
| :--- | :--- |
| Categoría (ISO/IEC 25010) | Escalabilidad (Capacidad) |
| Módulo(s) Afectado(s) | Catálogo / Almacenamiento de Imágenes |
| Prioridad | Media (Should) |
| Especificación Formal | El sistema debe soportar el crecimiento progresivo del catálogo de productos, diseños y publicaciones (feed) sin degradar el rendimiento, considerando el uso intensivo de imágenes propio del negocio. |
| Métrica Objetiva Cuantificable | Soporte de al menos 5,000 productos/publicaciones e imágenes asociadas sin incremento superior al 20% en el tiempo de respuesta respecto a la línea base. |

**Escenario BDD (Dado / Cuando / Entonces)**

- Dado que el catálogo alcanza 5,000 publicaciones con imágenes asociadas,
- Cuando un cliente navega el feed y los catálogos por categoría,
- Entonces el tiempo de carga no debe incrementarse más de un 20% respecto al rendimiento con 500 publicaciones.

**Estrategia y Método de Validación (QA)**

- Técnica: Pruebas de carga con datos sintéticos crecientes.
- Herramienta: K6 / scripts de generación de datos.
- Entorno: Servidor de Pruebas (Staging).

### RNF-08: Mantenibilidad del Software

| Campo | Detalle |
| :--- | :--- |
| Categoría (ISO/IEC 25010) | Mantenibilidad |
| Módulo(s) Afectado(s) | Transversal / Código Fuente |
| Prioridad | Media (Should) |
| Especificación Formal | El código del sistema debe estructurarse de forma modular (separando los módulos de Repostería, Detalles, Sublimación, Pagos y Pedidos), facilitando la incorporación de nuevas categorías de producto o funcionalidades futuras sin afectar los módulos existentes. |
| Métrica Objetiva Cuantificable | Complejidad ciclomática promedio ≤ 10 por función; cobertura de pruebas unitarias ≥ 60% en módulos críticos (pagos, pedidos). |

**Escenario BDD (Dado / Cuando / Entonces)**

- Dado que se requiere agregar una nueva categoría de producto al catálogo,
- Cuando el equipo de desarrollo implementa el cambio,
- Entonces no debe requerir modificaciones en los módulos de Pagos o Pedidos ya existentes.

**Estrategia y Método de Validación (QA)**

- Técnica: Análisis estático de código.
- Herramienta: SonarQube.
- Entorno: Entorno de desarrollo / Integración Continua (CI).

### RNF-09: Respaldo y Recuperación de Información

| Campo | Detalle |
| :--- | :--- |
| Categoría (ISO/IEC 25010) | Fiabilidad |
| Módulo(s) Afectado(s) | Transversal / Base de Datos |
| Prioridad | Alta (Must) |
| Especificación Formal | El sistema debe generar respaldos periódicos automáticos de la base de datos (pedidos, clientes, catálogo) que permitan restaurar la información ante fallos, evitando la pérdida de pedidos y datos de clientes. |
| Métrica Objetiva Cuantificable | Respaldo automático diario; tiempo máximo de recuperación (RTO) ≤ 4 horas; punto de recuperación máximo (RPO) ≤ 24 horas. |

**Escenario BDD (Dado / Cuando / Entonces)**

- Dado que ocurre una falla crítica en el servidor de base de datos,
- Cuando el equipo técnico ejecuta el proceso de restauración desde el último respaldo,
- Entonces el sistema debe quedar operativo en un tiempo menor a 4 horas, con una pérdida de información no mayor a 24 horas.

**Estrategia y Método de Validación (QA)**

- Técnica: Simulación de recuperación ante desastres (disaster recovery drill).
- Herramienta: Scripts de backup / restore del proveedor de hosting.
- Entorno: Servidor de Pruebas (Staging).
