# Roadmap y Guia Unica de Desarrollo - Backend NexoCommerce

Guia de implementacion del backend a cargo de Anthony.

Metodologia: **SDD (Spec-Driven Development)** y **Clean Architecture** (Dominio, Aplicacion, Infraestructura, Http).

Fuente de verdad de datos: [`database/database.sql`](../database/database.sql) (25 tablas PostgreSQL).
Contratos HTTP: [`docs/04-api/`](../docs/04-api/) version **1.1.0**.
OpenAPI: [`docs/04-api/openapi/openapi.yaml`](../docs/04-api/openapi/openapi.yaml).

Ningun endpoint se implementa si contradice el SQL o la spec correspondiente.

Este backend es **API REST pura**. No hay Blade, Vite, Tailwind, sesiones web ni vistas. Web (Nathalia) y Movil (Emilio) son clientes HTTP de `/api/v1`.

---

## Flujo de trabajo obligatorio (cada entrega)

El agente y el responsable siguen este orden. No se salta ningun paso.

1. **Leer bitacora** [`docs/09-bitacora/bitacora-backend.md`](../docs/09-bitacora/bitacora-backend.md): ultimo cambio registrado.
2. **Leer este ROADMAP**: siguiente tarea abierta `[ ]` de la fase en curso.
3. **Leer la spec SDD** en `docs/04-api/specs/` (y el SQL si hay persistencia). Sin spec, no hay codigo.
4. **Codificar** solo endpoints JSON bajo `/api/v1` (Clean Architecture / DDD).
5. **Probar** unitarias e integracion hasta verde.
6. **Marcar ROADMAP** `[x]` con fecha y hora.
7. **Apuntar bitacora** (fecha, fase, tarea, mensaje de commit, Anthony).
8. **Entregar a Anthony UN mensaje de commit** (Conventional Commits) para que el lo lea, ejecute y suba. El agente **no** ejecuta `git commit` ni `git push`. Un commit por entrega.

---

## Convenciones obligatorias

* JSON = columnas SQL (`nombre_completo`, `correo`, `categoria_padre_id`, `creado_en`). Prohibido alias Laravel (`name`, `email`, `created_at`) en el envelope publico.
* Roles: `ADMIN`, `CLIENTE`.
* Pedido: `PENDIENTE` → `EN_PREPARACION` → `LISTO` → `ENTREGADO`.
* Pago metodo: `PASARELA` | `TRANSFERENCIA`. Pago estado: `PENDIENTE` | `APROBADO` | `RECHAZADO`.
* Tipo de producto (derivado 1:1): `TORTA` | `DETALLE` | `SUBLIMACION`.
* Tokens Sanctum: tabla Laravel `personal_access_tokens` (no es una de las 25 tablas de negocio).
* Migraciones deben reproducir el SQL (nombres, CHECK, indices parciales, seeds de `roles` y `configuracion_tienda`).

---

## Regla de Oro SDD (Definicion de Terminado por Modulo)

Antes de marcar cualquier modulo como completado, debe cumplir con los 8 puntos:

1. [ ] **Spec**: Especificacion 1.1.0 aprobada en `../docs/04-api/specs/<modulo>.spec.md`.
2. [ ] **Migracion**: Tablas PostgreSQL del SQL (llaves, CHECK, indices) creadas y ejecutadas.
3. [ ] **Dominio**: Entidad pura y Contrato de Repositorio (Interface) en PHP nativo sin dependencias de Laravel.
4. [ ] **Aplicacion**: Casos de Uso de accion unica y DTOs fuertemente tipados.
5. [ ] **Infraestructura**: Modelo Eloquent y Repositorio Eloquent (tabla SQL real, no `users`).
6. [ ] **Http**: FormRequests y API Resources con envelope JSON.
7. [ ] **Rutas**: Endpoints bajo `/api/v1/...` con middleware Sanctum y `VerificarRol`.
8. [ ] **Pruebas**: Unitarias e Integracion (HTTP contra PostgreSQL) en verde.

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
- [x] Alinear contratos SDD `docs/04-api` (specs 01-12 y OpenAPI 1.1.0) con `database/database.sql` (Completado: 2026-09-13 11:30)
- [x] Fijar flujo SDD de API REST pura: bitacora → roadmap → spec → codigo → pruebas → bitacora → un commit para Anthony (Completado: 2026-09-13 12:37)
- [ ] Configurar variables de entorno `.env` para conexion con PostgreSQL central (Laptop 4 - Melanie)
- [ ] Portar `database/database.sql` a migraciones Laravel (25 tablas, indices, CHECK, seeds `ADMIN`/`CLIENTE` y tienda Dulces Aesca)
- [ ] Desactivar/omitir migraciones default de Laravel que creen `users` como tabla de negocio
- [ ] Crear `Dockerfile` para contenedor del backend
- [ ] Crear `docker-compose.yml` para ejecutar las dos instancias locales (`backend-1:8001` y `backend-2:8002`)
- [ ] Verificar conexion remota con PostgreSQL y endpoint `/up`

---

## FASE 1: Autenticacion y Usuarios

Estado: Pendiente
Dependencias: Fase 0 (migraciones de `roles`, `usuarios`, `cuentas_oauth`, `verificaciones_correo`)
Especificaciones:
- [01-autenticacion.spec.md](../docs/04-api/specs/01-autenticacion.spec.md)
- [02-usuarios.spec.md](../docs/04-api/specs/02-usuarios.spec.md)

Tablas: `roles`, `usuarios`, `cuentas_oauth`, `verificaciones_correo` + Sanctum `personal_access_tokens`.

### Autenticacion (`/api/v1/auth`)
- [ ] Dominio: `Usuario`, `CuentaOAuth`, `VerificacionCorreo`, `UsuarioRepositorio`
- [ ] Aplicacion: `RegistrarCliente`, `IniciarSesion`, `CerrarSesion`, `ObtenerPerfil`, `VerificarCorreo`, `ReenviarVerificacion`, `AutenticarOAuth`
- [ ] Infraestructura: modelos Eloquent sobre `usuarios` (no `users`)
- [ ] Reglas: 5 intentos → `bloqueado_hasta` 15 min (429); registro con rol `CLIENTE`; `terminos_aceptados`; OAuth `GOOGLE`/`FACEBOOK`
- [ ] Http:
  - `POST /api/v1/auth/registro`
  - `POST /api/v1/auth/login` (campo `correo`, no `email`)
  - `POST /api/v1/auth/logout`
  - `GET /api/v1/auth/perfil`
  - `POST /api/v1/auth/verificar-correo`
  - `POST /api/v1/auth/reenviar-verificacion`
  - `POST /api/v1/auth/oauth`
- [ ] Pruebas: correo duplicado 422, login 401, bloqueo 429, OAuth proveedor invalido 422

### Usuarios y roles (`/api/v1/usuarios`)
- [ ] Middleware `VerificarRol` (`ADMIN` | `CLIENTE`)
- [ ] Http:
  - `GET /api/v1/admin/usuarios` (filtros `rol`, `buscar`, `activo`)
  - `PATCH /api/v1/admin/usuarios/{id}` (rol/activo; no eliminar el ultimo ADMIN)
  - `PUT /api/v1/usuarios/perfil` (`nombre_completo`, `telefono`)
  - `PUT /api/v1/usuarios/cambiar-password`
- [ ] Pruebas: CLIENTE en ruta admin → 403

---

## FASE 2: Multimedia

Estado: Pendiente
Dependencias: Fase 1
Especificacion: [08-multimedia.spec.md](../docs/04-api/specs/08-multimedia.spec.md)

Tablas: `multimedia`.
Nota: se implementa antes del catalogo porque categorias, productos, diseños y comprobantes usan `multimedia.id`.

- [ ] Cliente de almacenamiento en `Infraestructura/Almacenamiento/` (Laptop 5)
- [ ] Aplicacion: `SubirArchivoMultimedia`, `DesactivarMultimedia`
- [ ] Http:
  - `POST /api/v1/multimedia` (multipart; respuesta **con `id`**)
  - `GET /api/v1/multimedia/{id}`
  - `DELETE /api/v1/multimedia/{id}` (`activo = false`)
- [ ] Validaciones: mimes jpeg/png/jpg/webp/pdf, max 5120 KB, `destino` in productos, comprobantes, personalizaciones, tienda, categorias, publicaciones, disenos
- [ ] Pruebas: rechazo >5MB, persistencia de `subido_por_id`, JSON con `tamano_bytes` y `tipo_mime`

---

## FASE 3: Tienda (configuracion_tienda)

Estado: Pendiente
Dependencias: Fase 1
Especificacion: [09-tiendas.spec.md](../docs/04-api/specs/09-tiendas.spec.md)

Tablas: `configuracion_tienda` (seed Dulces Aesca y colores). No hay `lema`, `tipo_negocio` ni moneda.

- [ ] Dominio: `ConfiguracionTienda`, `ConfiguracionTiendaRepositorio`
- [ ] Aplicacion: `ObtenerConfiguracionTienda`, `ActualizarConfiguracionTienda`
- [ ] Http:
  - `GET /api/v1/tienda/configuracion` (publico)
  - `PUT /api/v1/admin/tienda/configuracion` (ADMIN; `nombre_tienda`, colores, `logo_url`, `favicon_url`, contacto)
- [ ] Pruebas: GET publico; CLIENTE en PUT → 403; PUT sin `color_primario` → 422

---

## FASE 4: Categorias

Estado: Pendiente
Dependencias: Fase 1, Fase 2 (si se asocia `imagen_id`)
Especificacion: [03-categorias.spec.md](../docs/04-api/specs/03-categorias.spec.md)

Tablas: `categorias` (`categoria_padre_id`, UNIQUE por padre, indice parcial de raiz). Sin `slug` ni `parent_id`.

- [ ] Dominio: `Categoria`, `CategoriaRepositorio`
- [ ] Aplicacion: `ListarArbolCategorias`, `CrearCategoria`, `ActualizarCategoria`, `DesactivarCategoria`
- [ ] Http:
  - `GET /api/v1/categorias`
  - `POST /api/v1/admin/categorias`
  - `PUT /api/v1/admin/categorias/{id}`
  - `DELETE /api/v1/admin/categorias/{id}` (`activo = false`; 400 si tiene productos activos)
- [ ] Pruebas: arbol con `categoria_padre_id`; nombre de raiz duplicado 422

---

## FASE 5: Productos y personalizacion

Estado: Pendiente
Dependencias: Fase 4
Especificacion: [04-productos.spec.md](../docs/04-api/specs/04-productos.spec.md)

Tablas: `productos`, `tortas`, `detalles`, `sublimaciones`, `disenos_torta`, `plantillas_diseno`, `disenos_personalizados`, `producto_multimedia`.

No existen `opciones_personalizacion`, `valores_personalizacion`, `slug` ni `stock` en `productos`. Stock solo en `detalles`.

- [ ] Dominio: `Producto` (tipo derivado), `Torta`, `Detalle`, `Sublimacion`, `DisenoTorta`, `PlantillaDiseno`, `DisenoPersonalizado`
- [ ] Aplicacion: `ListarProductos`, `ConsultarProducto`, `CrearProducto`, `ActualizarProducto`, `DesactivarProducto`, `CrearDisenoTorta`, `CrearPlantillaDiseno`, `CrearDisenoPersonalizado`
- [ ] Transaccion de alta: `productos` + exactamente una tabla 1:1 + `producto_multimedia` (una sola `es_principal`)
- [ ] Http:
  - `GET /api/v1/productos` (filtros `categoria_id`, `tipo`, `buscar`, precios, `porciones_*`, `sabor`)
  - `GET /api/v1/productos/{id}`
  - `POST /api/v1/admin/productos`
  - `PUT /api/v1/admin/productos/{id}` (tipo inmutable)
  - `DELETE /api/v1/admin/productos/{id}`
  - `POST /api/v1/admin/tortas/{producto_id}/disenos`
  - `POST /api/v1/admin/sublimaciones/{producto_id}/plantillas`
  - `GET|POST /api/v1/disenos-personalizados` (CLIENTE)
- [ ] Pruebas: TORTA sin `sabor` 422; dos imagenes principales 422; JSON sin `slug` ni personalizaciones genericas

---

## FASE 6: Publicaciones

Estado: Pendiente
Dependencias: Fase 2, Fase 4
Especificacion: [11-publicaciones.spec.md](../docs/04-api/specs/11-publicaciones.spec.md)

Tablas: `publicaciones`, `publicacion_multimedia`.

- [ ] Dominio: `Publicacion`
- [ ] Aplicacion: `ListarPublicaciones`, `CrearPublicacion`, `ActualizarPublicacion`, `DesactivarPublicacion`
- [ ] Http:
  - `GET /api/v1/publicaciones` (solo `activo = true`)
  - `GET /api/v1/publicaciones/{id}`
  - `POST /api/v1/admin/publicaciones`
  - `PUT /api/v1/admin/publicaciones/{id}`
  - `DELETE /api/v1/admin/publicaciones/{id}`
- [ ] Pruebas: categoria y producto opcionales; CLIENTE en POST admin → 403

---

## FASE 7: Produccion

Estado: Pendiente
Dependencias: Fase 4
Especificacion: [12-produccion.spec.md](../docs/04-api/specs/12-produccion.spec.md)

Tablas: `configuracion_produccion`. Se usa al crear pedidos (Fase 9).

- [ ] Dominio: `ConfiguracionProduccion`, calculo de `ocupado` / `disponible`
- [ ] Aplicacion: `ListarCupos`, `ConsultarDisponibilidad`, `CrearCupo`, `ActualizarCupo`
- [ ] Http:
  - `GET /api/v1/produccion/disponibilidad?fecha=`
  - `GET|POST /api/v1/admin/produccion`
  - `PUT|DELETE /api/v1/admin/produccion/{id}`
- [ ] Pruebas: `capacidad_maxima < 1` → 422; CLIENTE no crea cupos

---

## FASE 8: Carrito

Estado: Pendiente
Dependencias: Fase 5
Especificacion: [05-carrito.spec.md](../docs/04-api/specs/05-carrito.spec.md)

Tablas: `carritos`, `detalles_carrito`. Un carrito activo por usuario (indice parcial). A lo sumo una FK: `diseno_torta_id` XOR `plantilla_diseno_id` XOR `diseno_personalizado_id`.

- [ ] Dominio: `Carrito`, `DetalleCarrito`; precio calculado (`precio_base` + `costo_adicional`); el cliente no envia precio
- [ ] Aplicacion: `ObtenerCarrito`, `AgregarItem`, `ActualizarCantidad`, `EliminarItem`, `VaciarCarrito`
- [ ] Compatibilidad: TORTA → diseño de torta opcional; SUBLIMACION → plantilla o diseño personalizado (exactamente uno); DETALLE → sin diseño + stock
- [ ] Http:
  - `GET /api/v1/carrito`
  - `POST /api/v1/carrito/items`
  - `PUT /api/v1/carrito/items/{id}`
  - `DELETE /api/v1/carrito/items/{id}`
  - `DELETE /api/v1/carrito`
- [ ] Pruebas: cantidad > stock DETALLE → 400; dos FKs de diseño → 422; SUBLIMACION sin configuracion → 400

---

## FASE 9: Pedidos

Estado: Pendiente
Dependencias: Fase 7, Fase 8
Especificacion: [06-pedidos.spec.md](../docs/04-api/specs/06-pedidos.spec.md)

Tablas: `pedidos`, `detalles_pedido`. Sin `direccion_envio`, `codigo`, `notas` ni `metodo_pago` en el pedido.

Maquina de estados: `PENDIENTE` → `EN_PREPARACION` → `LISTO` → `ENTREGADO` (sin saltos). No existen `pagado`, `enviado` ni `cancelado`.

- [ ] Dominio: `Pedido`, invariantes de secuencia y snapshot (`nombre_producto`, `costo_diseno`, `tipo_configuracion`)
- [ ] Aplicacion: `CrearPedidoDesdeCarrito`, `ListarPedidosUsuario`, `ConsultarPedido`, `ListarPedidosAdmin`, `CambiarEstadoPedido`
- [ ] Transaccion:
  1. Revalidar stock de DETALLE.
  2. Revalidar capacidad (Fase 7) para `fecha_entrega`.
  3. Insertar `pedidos` estado `PENDIENTE` y `detalles_pedido`.
  4. Vaciar `detalles_carrito`.
- [ ] No avanzar a `EN_PREPARACION` sin pago `APROBADO` (Fase 10).
- [ ] Http:
  - `POST /api/v1/pedidos` body `{ "fecha_entrega": "YYYY-MM-DD" }`
  - `GET /api/v1/pedidos`
  - `GET /api/v1/pedidos/{id}`
  - `GET /api/v1/admin/pedidos`
  - `PATCH /api/v1/admin/pedidos/{id}/estado`
- [ ] Pruebas: sin `fecha_entrega` 422; salto de estado 400; CLIENTE no ve pedido ajeno 403

---

## FASE 10: Pagos y comprobantes

Estado: Pendiente
Dependencias: Fase 2, Fase 9
Especificacion: [07-pagos.spec.md](../docs/04-api/specs/07-pagos.spec.md)

Tablas: `pagos`, `comprobantes_pago`. No hay `comprobante_url` ni metodos `efectivo`/`tarjeta`.

- [ ] Dominio: `Pago`, `ComprobantePago`; `monto` = `pedidos.total`
- [ ] Aplicacion: `RegistrarPago`, `ConsultarPagoPedido`, `VerificarPagoAdmin`
- [ ] TRANSFERENCIA: exige `multimedia_id` e inserta `comprobantes_pago`. PASARELA: `referencia_pasarela`.
- [ ] Aprobar pago **no** cambia `pedidos.estado` a un valor inexistente; deja `PENDIENTE` y habilita Fase 9.
- [ ] Http:
  - `POST /api/v1/pagos`
  - `GET /api/v1/pedidos/{pedido_id}/pago`
  - `PATCH /api/v1/admin/pagos/{id}/verificar` (`APROBADO` | `RECHAZADO`)
- [ ] Pruebas: metodo `tarjeta` 422; transferencia sin multimedia 422; monto distinto 400; pedido sigue `PENDIENTE` tras aprobar

---

## FASE 11: Notificaciones

Estado: Pendiente
Dependencias: Fase 9, Fase 10
Especificacion: [10-notificaciones.spec.md](../docs/04-api/specs/10-notificaciones.spec.md)

Tablas: `notificaciones` (`pedido_id`, `pago_id`; no `referencia_id`).

Tipos: `PEDIDO_CREADO`, `PEDIDO_EN_PREPARACION`, `PEDIDO_LISTO`, `PEDIDO_ENTREGADO`, `PAGO_REGISTRADO`, `PAGO_APROBADO`, `PAGO_RECHAZADO`.

- [ ] Dominio: eventos `PedidoCreado`, `PagoRegistrado`, `PagoVerificado`, `EstadoPedidoCambiado`
- [ ] Listeners que insertan filas para CLIENTE y ADMIN segun spec
- [ ] Http:
  - `GET /api/v1/notificaciones` (`meta.total_no_leidas`)
  - `PATCH /api/v1/notificaciones/{id}/leida`
  - `PATCH /api/v1/notificaciones/leer-todas`
- [ ] Pruebas: aprobar pago emite `PAGO_APROBADO` al dueño; marcar leida ajena → 403

---

## FASE 12: Pruebas de carga, balanceo y despliegue

Estado: Pendiente
Dependencias: Todas las anteriores

- [ ] Empaquetar backend en contenedor `Dockerfile` con extensiones PHP (`pdo_pgsql`, etc.)
- [ ] `docker-compose.yml`: `backend-1:8001` y `backend-2:8002`
- [ ] Coordinar con Michael (Laptop 1 - NGINX) upstream Round-Robin
- [ ] Coordinar con Melanie (Laptop 4 - PostgreSQL) conexion remota de ambas instancias
- [ ] Coordinar con Emilio (Laptop 5) rutas publicas de `multimedia.ruta_archivo`
- [ ] Resiliencia: detener `backend-1` y comprobar failover a `backend-2`
- [ ] Concurrencia Web + Movil contra el envelope JSON 1.1.0

---

## Mapa rapido spec → fase

| Spec | Fase |
| :--- | :--- |
| 01, 02 Autenticacion / Usuarios | 1 |
| 08 Multimedia | 2 |
| 09 Tienda | 3 |
| 03 Categorias | 4 |
| 04 Productos | 5 |
| 11 Publicaciones | 6 |
| 12 Produccion | 7 |
| 05 Carrito | 8 |
| 06 Pedidos | 9 |
| 07 Pagos | 10 |
| 10 Notificaciones | 11 |
