# Roadmap y Guia Unica de Desarrollo - Backend NexoCommerce

Esta es la guia definitiva y centralizada para el desarrollo del backend de NexoCommerce a cargo de Anthony.

Metodologia: **SDD (Spec-Driven Development)** y **Clean Architecture** (Dominio, Aplicacion, Infraestructura, Http).

---

## Regla de Oro SDD (Definicion de Terminado por Modulo)

Antes de marcar cualquier modulo como completado, debe cumplir con los 8 puntos:

1. [ ] **Spec**: Especificacion tecnica aprobada en `../docs/04-api/specs/<modulo>.spec.md`.
2. [ ] **Migracion**: Migracion PostgreSQL creada y ejecutada con llaves e indices.
3. [ ] **Dominio**: Entidad pura y Contrato de Repositorio (Interface) en PHP nativo sin dependencias de Laravel.
4. [ ] **Aplicacion**: Casos de Uso de accion unica y DTOs fuertemente tipados.
5. [ ] **Infraestructura**: Modelo Eloquent y Repositorio Eloquent implementados.
6. [ ] **Http**: FormRequests con validacion estricta y API Resources con formato JSON envelope.
7. [ ] **Rutas**: Endpoints registrados bajo `/api/v1/...` con sus respectivos middlewares.
8. [ ] **Pruebas**: Pruebas Unitarias (aisladas) y de Integracion (HTTP contra PostgreSQL) pasando en verde.

---

## FASE 0: Configuracion Base e Infraestructura

Estado: En progreso

- [x] Inicializar proyecto Laravel 11/13 en `backend/` (Completado: 2026-09-07 23:15)
- [x] Estructurar capas desacopladas (`app/Dominio/`, `app/Aplicacion/`, `app/Infraestructura/`, `app/Http/`) (Completado: 2026-09-07 23:30)
- [x] Instalar y configurar `laravel/sanctum` para autenticacion API por tokens (Completado: 2026-09-07 23:30)
- [x] Instalar y configurar `laravel/boost` con MCP para asistencia tecnica en desarrollo (Completado: 2026-09-07 23:55)
- [x] Configurar directrices locales (`.agents/rules/`, `.agents/skills/`, `AGENTS.md`, `CLAUDE.md`) (Completado: 2026-09-08 00:05)
- [x] Depurar y excluir del repositorio carpetas redundantes de IA generadas por Boost (Completado: 2026-09-08 00:13)
- [x] Configurar CORS en `config/cors.php` para admitir peticiones de Frontend Web (React/Vite) y App Movil (Completado: 2026-09-08 00:26)
- [x] Configurar excepciones globales en `bootstrap/app.php` para asegurar que todo error retorne envelope JSON (Completado: 2026-09-08 00:26)
- [x] Eliminar capa web tradicional y configurar endpoints JSON de diagnostico y grupos v1 (Completado: 2026-09-08 00:26)
- [x] Crear y aprobar pruebas automatizadas de integracion de configuracion API (Completado: 2026-09-08 00:26)
- [ ] Configurar variables de entorno `.env` para conexion con PostgreSQL central (Laptop 4 - Melanie)
- [ ] Crear `Dockerfile` para contenedor del backend
- [ ] Crear `docker-compose.yml` para ejecutar las dos instancias locales (`backend-1:8001` y `backend-2:8002`)
- [ ] Verificar conexion remota con PostgreSQL y endpoint `/up`

---

## FASE 1: Modulo de Autenticacion y Usuarios

Estado: Pendiente
Dependencias: Fase 0
Especificaciones:
- [01-autenticacion.spec.md](../docs/04-api/specs/01-autenticacion.spec.md)
- [02-usuarios.spec.md](../docs/04-api/specs/02-usuarios.spec.md)

### Tareas de Autenticacion (`/api/v1/auth`)
- [ ] Migracion de tabla `users` y `personal_access_tokens`
- [ ] Dominio: Entidad `Usuario`, `UsuarioRepositorio` (Interface)
- [ ] Aplicacion: Casos de uso `RegistrarCliente`, `IniciarSesion`, `CerrarSesion`, `ObtenerPerfil` y DTOs
- [ ] Infraestructura: `UsuarioModelo` (Eloquent), `UsuarioRepositorioEloquent`
- [ ] Http:
  - `POST /api/v1/auth/registro` (FormRequest con validacion de email unico y password confirmado)
  - `POST /api/v1/auth/login` (Emision de token Bearer Sanctum)
  - `POST /api/v1/auth/logout` (Revocacion de token actual)
  - `GET /api/v1/auth/perfil` (Datos del usuario autenticado)
- [ ] Pruebas Unitarias: Validaciones de entidad y reglas de login
- [ ] Pruebas de Integracion: Registro, login con credenciales invalidas (401), logout y acceso a perfil protegido

### Tareas de Usuarios y Roles (`/api/v1/usuarios`)
- [ ] Migracion de campo `rol` (`administrador`, `cliente`) y estado
- [ ] Middleware `VerificarRol` para control de acceso
- [ ] Http:
  - `GET /api/v1/admin/usuarios` (Listado paginado con filtro de rol - Solo Admin)
  - `PUT /api/v1/usuarios/perfil` (Actualizacion de datos propios)
  - `PUT /api/v1/usuarios/cambiar-password` (Verificacion obligatoria de password actual)
- [ ] Pruebas de Integracion: Validar autorizacion (403 Forbidden para clientes en rutas admin)

---

## FASE 2: Modulo de Tiendas y Parametrizacion Global

Estado: Pendiente
Dependencias: Fase 1
Especificacion: [09-tiendas.spec.md](../docs/04-api/specs/09-tiendas.spec.md)

- [ ] Migracion de tabla `tiendas` / `configuraciones` (nombre, logo, moneda, telefono, tipo_negocio)
- [ ] Dominio: Entidad `Tienda`, `TiendaRepositorio` (Interface)
- [ ] Aplicacion: Casos de uso `ObtenerConfiguracionTienda`, `ActualizarConfiguracionTienda`
- [ ] Infraestructura: `TiendaModelo`, `TiendaRepositorioEloquent`
- [ ] Http:
  - `GET /api/v1/tienda/configuracion` (Publica para Web y Movil al inicio de la aplicacion)
  - `PUT /api/v1/admin/tienda/configuracion` (Solo Administradores)
- [ ] Pruebas de Integracion: Consulta publica y restriccion de actualizacion a rol cliente

---

## FASE 3: Catalogo (Categorias, Subcategorias y Productos)

Estado: Pendiente
Dependencias: Fase 1
Especificaciones:
- [03-categorias.spec.md](../docs/04-api/specs/03-categorias.spec.md)
- [04-productos.spec.md](../docs/04-api/specs/04-productos.spec.md)

### 3.1 Categorias y Subcategorias (`/api/v1/categorias`)
- [ ] Migracion de tabla `categorias` (soporte jerarquico con `parent_id` nulo o referencial, slug unico)
- [ ] Dominio: Entidad `Categoria`, `CategoriaRepositorio` (Interface)
- [ ] Aplicacion: Casos de uso `ListarArbolCategorias`, `CrearCategoria`, `ActualizarCategoria`, `EliminarCategoria`
- [ ] Http:
  - `GET /api/v1/categorias` (Arbol jerarquico completo publico)
  - `POST /api/v1/admin/categorias` (Creacion - Solo Admin)
  - `PUT /api/v1/admin/categorias/{id}`
  - `DELETE /api/v1/admin/categorias/{id}` (Desactivacion logica si posee productos asociados)

### 3.2 Productos (`/api/v1/productos`)
- [ ] Migracion de tabla `productos` (nombre, slug, descripcion, precio_base, stock, categoria_id, activo, imagen_url)
- [ ] Dominio: Entidad `Producto`, `ProductoRepositorio` (Interface), validacion de stock no negativo
- [ ] Aplicacion: Casos de uso `ListarProductosPaginados`, `ConsultarDetalleProducto`, `CrearProducto`, `ActualizarProducto`
- [ ] Http:
  - `GET /api/v1/productos` (Paginado, filtros: `categoria_id`, `buscar`, `precio_min`, `precio_max`, ordenacion)
  - `GET /api/v1/productos/{id}` (Detalle completo)
  - `POST /api/v1/admin/productos`
  - `PUT /api/v1/admin/productos/{id}`
  - `DELETE /api/v1/admin/productos/{id}`
- [ ] Pruebas Unitarias: Logica de stock y filtros
- [ ] Pruebas de Integracion: Listado con filtros combinados, creacion y validaciones 422

---

## FASE 4: Modulo de Personalizacion de Productos

Estado: Pendiente
Dependencias: Fase 3
Especificacion: [04-productos.spec.md](../docs/04-api/specs/04-productos.spec.md)

- [ ] Migracion de tablas:
  - `opciones_personalizacion` (producto_id, nombre, tipo: `texto_libre`, `seleccion`, `archivo_imagen`, es_obligatorio)
  - `valores_personalizacion` (opcion_id, valor, precio_adicional)
- [ ] Dominio: Entidad `Personalizacion`, reglas de cálculo de recargos por opcion
- [ ] Aplicacion: Casos de uso `AsignarPersonalizacionesAProducto`, `ConsultarPersonalizacionesDeProducto`
- [ ] Http:
  - `GET /api/v1/productos/{id}/personalizaciones`
  - `POST /api/v1/admin/productos/{id}/personalizaciones`
- [ ] Pruebas Unitarias: Calculo de costo total sumando opciones de personalizacion
- [ ] Pruebas de Integracion: Validacion de limites de caracteres y opciones obligatorias

---

## FASE 5: Modulo de Carrito de Compras

Estado: Pendiente
Dependencias: Fase 3, Fase 4
Especificacion: [05-carrito.spec.md](../docs/04-api/specs/05-carrito.spec.md)

- [ ] Migracion de tablas:
  - `carritos` (usuario_id, activo)
  - `carrito_items` (carrito_id, producto_id, cantidad, precio_unitario)
  - `carrito_item_personalizaciones` (carrito_item_id, opcion_id, valor_id, texto_personalizado, costo_adicional)
- [ ] Dominio: Entidad `Carrito`, `CarritoItem`, reglas de agrupacion de items identicos y calculo de totales
- [ ] Aplicacion: Casos de uso `ObtenerCarrito`, `AgregarItemCarrito`, `ActualizarCantidadItem`, `EliminarItemCarrito`, `VaciarCarrito`
- [ ] Http:
  - `GET /api/v1/carrito` (Detalle con subtotales e impuestos calculados)
  - `POST /api/v1/carrito/items` (Validacion previa de stock disponible)
  - `PUT /api/v1/carrito/items/{id}` (Actualizar cantidad)
  - `DELETE /api/v1/carrito/items/{id}`
  - `DELETE /api/v1/carrito`
- [ ] Pruebas Unitarias: Agrupacion de items con personalizaciones identicas vs distintas
- [ ] Pruebas de Integracion: Flujo completo de agregar, actualizar cantidad y verificar subtotales

---

## FASE 6: Modulo de Pedidos

Estado: Pendiente
Dependencias: Fase 5
Especificacion: [06-pedidos.spec.md](../docs/04-api/specs/06-pedidos.spec.md)

- [ ] Migracion de tablas:
  - `pedidos` (codigo, usuario_id, total, estado, direccion_envio, telefono_contacto, metodo_pago, notas)
  - `pedido_detalles` (pedido_id, producto_id, cantidad, precio_unitario, subtotal, datos_personalizacion)
- [ ] Dominio:
  - Entidad `Pedido`, maquina de estados: `pendiente` -> `pagado` -> `en_preparacion` -> `enviado` -> `entregado` (o `cancelado`)
  - Regla: Solo pedidos en `pendiente` pueden cancelarse
- [ ] Aplicacion: Casos de uso `CrearPedidoDesdeCarrito`, `ConsultarPedidosUsuario`, `ConsultarDetallePedido`, `ActualizarEstadoPedido`
- [ ] Transaccion Atomica en Base de Datos:
  1. Verificar stock actual de cada item.
  2. Descontar inventario en PostgreSQL.
  3. Crear registro de pedido y detalles.
  4. Vaciar carrito del usuario.
- [ ] Http:
  - `POST /api/v1/pedidos`
  - `GET /api/v1/pedidos` (Pedidos del cliente autenticado)
  - `GET /api/v1/pedidos/{id}`
  - `GET /api/v1/admin/pedidos` (Gestion global para administradores con filtro por estado)
  - `PATCH /api/v1/admin/pedidos/{id}/estado` (Cambio de estado - Solo Admin)
- [ ] Pruebas Unitarias: Invariantes de estado de pedido y calculo de total
- [ ] Pruebas de Integracion: Creacion atomica con rollback ante fallo y validacion de descuento de stock

---

## FASE 7: Modulo de Pagos y Comprobantes

Estado: Pendiente
Dependencias: Fase 6
Especificacion: [07-pagos.spec.md](../docs/04-api/specs/07-pagos.spec.md)

- [ ] Migracion de tabla `pagos` (pedido_id, metodo_pago, monto, numero_referencia, comprobante_url, estado, fecha_verificacion)
- [ ] Dominio: Entidad `Pago`, validacion de que el monto coincida con el total del pedido
- [ ] Aplicacion: Casos de uso `RegistrarPagoTransferencia`, `ConsultarPagoPedido`, `VerificarPagoAdmin`
- [ ] Http:
  - `POST /api/v1/pagos` (Cliente registra pago y envia URL de comprobante)
  - `GET /api/v1/pagos/{pedido_id}` (Consultar estado del pago)
  - `PATCH /api/v1/admin/pagos/{id}/verificar` (Admin aprueba o rechaza; si aprueba, cambia estado del pedido a `pagado`)
- [ ] Pruebas de Integracion: Registro de pago, validacion de monto y actualizacion en cascada del estado del pedido

---

## FASE 8: Modulo Multimedia e Integracion con Servidor de Archivos

Estado: Pendiente
Dependencias: Laptop 5 (Emilio - Servidor de Archivos Linux)
Especificacion: [08-multimedia.spec.md](../docs/04-api/specs/08-multimedia.spec.md)

- [ ] Configurar cliente de almacenamiento en `Infraestructura/Almacenamiento/` para transferir archivos a Laptop 5
- [ ] Aplicacion: Caso de uso `SubirArchivoMultimedia`
- [ ] Http:
  - `POST /api/v1/multimedia/subir` (multipart/form-data)
- [ ] Validaciones estrictas:
  - Formatos permitidos: `jpeg`, `png`, `jpg`, `webp`, `pdf`
  - Tamano maximo: 5 MB (5120 KB)
  - Carpetas destino: `productos`, `comprobantes`, `personalizaciones`, `tienda`
- [ ] Pruebas de Integracion: Rechazo de archivos mayores a 5MB, rechazo de formatos no permitidos y retorno de URL valida

---

## FASE 9: Modulo de Notificaciones del Sistema

Estado: Pendiente
Dependencias: Fase 6, Fase 7
Especificacion: [10-notificaciones.spec.md](../docs/04-api/specs/10-notificaciones.spec.md)

- [ ] Migracion de tabla `notificaciones` (usuario_id, titulo, mensaje, leida, tipo, referencia_id)
- [ ] Dominio: Eventos de dominio (`PedidoCreado`, `PagoAprobado`, `PedidoEnviado`)
- [ ] Aplicacion: Listeners que persisten la notificacion para el usuario o administrador correspondiente
- [ ] Http:
  - `GET /api/v1/notificaciones` (Listado de notificaciones con contador de no leidas)
  - `PATCH /api/v1/notificaciones/{id}/leida` (Marcar como leida)
- [ ] Pruebas de Integracion: Verificacion de emision de notificacion al aprobar un pago

---

## FASE 10: Pruebas de Carga, Balanceo y Despliegue Distribuido

Estado: Pendiente
Dependencias: Todas las anteriores

- [ ] Empaquetar backend en contenedor `Dockerfile` con extensiones de PHP (`pdo_pgsql`, etc.)
- [ ] Configurar `docker-compose.yml` para levantar las dos instancias:
  - `backend-1` en puerto `8001`
  - `backend-2` en puerto `8002`
- [ ] Coordinar con Michael (Laptop 1 - NGINX) el upstream de balanceo Round-Robin
- [ ] Coordinar con Melanie (Laptop 4 - PostgreSQL) la conexion remota simultanea de ambas instancias
- [ ] Pruebas de resiliencia: detener el contenedor `backend-1` y comprobar que NGINX redirige el trafico a `backend-2` sin cortes
- [ ] Pruebas de concurrencia con solicitudes simultaneas desde Frontend Web y App Movil
