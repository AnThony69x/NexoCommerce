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

- [x] Inicializar proyecto Laravel 13 en `backend/` (Completado: 2026-09-07 23:15; stack verificado 2026-09-17: Laravel 13.30.1 / PHP 8.5.10)
- [x] Estructurar capas desacopladas (`app/Dominio/`, `app/Aplicacion/`, `app/Infraestructura/`, `app/Http/`) (Completado: 2026-09-07 23:30)
- [x] Versionar el esqueleto de capas con `.gitkeep` para que Git conserve las carpetas vacias tras un clone (Completado: 2026-09-20 18:20)
- [x] Alinear el esqueleto: `Dominio`/`Aplicacion`/`Infraestructura` en espanol (subcarpetas incluidas) y `Http` en ingles (`Controllers`, `Requests`, `Resources`, `Middleware`) (Completado: 2026-09-20 18:26)
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
- [x] Configurar `.env` temporal contra PostgreSQL de Supabase (session pooler, `DB_CONNECTION=pgsql`, `DB_SSLMODE=require`). Destino final: Laptop 4 (Completado: 2026-09-20 21:08)
- [x] Confirmar API REST pura: sin `routes/web.php`, sin Vite/Tailwind, JSON forzoso (`PrefersJsonResponses`), Sanctum stateless (Completado: 2026-09-20 21:12)
- [ ] Configurar variables de entorno `.env` para conexion con PostgreSQL central (Laptop 4 - Melanie)
      Temporal (desarrollo): se usa PostgreSQL de Supabase (`DB_CONNECTION=pgsql`, session pooler, `DB_SSLMODE=require`). El schema es el mismo. Cuando Melanie levante el servidor, solo cambian host, puerto, usuario y password.
- [x] Portar `database/database.sql` a migraciones Laravel (25 tablas, indices, CHECK, seeds `ADMIN`/`CLIENTE` y tienda Dulces Aesca) (Completado: 2026-09-20 21:22)
- [x] Desactivar/omitir migraciones default de Laravel que creen `users` como tabla de negocio (Completado: 2026-09-20 21:22)
- [x] Crear `Dockerfile` para contenedor del backend (Completado: 2026-09-20 21:31)
- [x] Crear `docker-compose.yml` para ejecutar las dos instancias locales (`backend-1:8001` y `backend-2:8002`) (Completado: 2026-09-20 21:31)
- [x] Verificar conexion remota con PostgreSQL y endpoint `/up` (Completado: 2026-09-20 21:31)

---

## FASE 1: Autenticacion y Usuarios

Estado: Completado (2026-09-22 21:10)
Dependencias: Fase 0 (migraciones de `roles`, `usuarios`, `cuentas_oauth`, `verificaciones_correo`)
Especificaciones:
- [01-autenticacion.spec.md](../docs/04-api/specs/01-autenticacion.spec.md)
- [02-usuarios.spec.md](../docs/04-api/specs/02-usuarios.spec.md)

Tablas: `roles`, `usuarios`, `cuentas_oauth`, `verificaciones_correo` + Sanctum `personal_access_tokens`.

### Autenticacion (`/api/v1/auth`)
- [x] Dominio: `Usuario`, `CuentaOAuth`, `VerificacionCorreo`, `UsuarioRepositorio` (Completado: 2026-09-22 20:30)
- [x] Aplicacion: `RegistrarCliente`, `IniciarSesion`, `CerrarSesion`, `ObtenerPerfil`, `VerificarCorreo`, `ReenviarVerificacion`, `AutenticarOAuth` (Completado: 2026-09-22 20:30)
- [x] Infraestructura: modelos Eloquent sobre `usuarios` (no `users`) (Completado: 2026-09-22 20:30)
- [x] Reglas: 5 intentos → `bloqueado_hasta` 15 min (429); registro con rol `CLIENTE`; `terminos_aceptados`; OAuth solo `GOOGLE` (Completado: 2026-09-22 20:30; Facebook retirado 2026-09-23)
- [x] Infraestructura correo: `NotificacionServiceInterface` + Mailtrap; codigo de verificacion enviado en registro y reenvio (Completado: 2026-09-22)
- [x] Http:
  - `POST /api/v1/auth/registro`
  - `POST /api/v1/auth/login` (campo `correo`, no `email`)
  - `POST /api/v1/auth/logout`
  - `GET /api/v1/auth/perfil`
  - `POST /api/v1/auth/verificar-correo`
  - `POST /api/v1/auth/reenviar-verificacion`
  - `POST /api/v1/auth/oauth`
  (Completado: 2026-09-22 20:45)
- [x] Pruebas: correo duplicado 422, login 401, bloqueo 429, OAuth proveedor invalido 422 (Completado: 2026-09-22 21:05 — 45/45 verde)

### Usuarios y roles (`/api/v1/usuarios`)
- [x] Middleware `VerificarRol` (`ADMIN` | `CLIENTE`) (Completado: 2026-09-22 20:45)
- [x] Http:
  - `GET /api/v1/admin/usuarios` (filtros `rol`, `buscar`, `activo`)
  - `PATCH /api/v1/admin/usuarios/{id}` (rol/activo; no eliminar el ultimo ADMIN)
  - `PUT /api/v1/usuarios/perfil` (`nombre_completo`, `telefono`)
  - `PUT /api/v1/usuarios/cambiar-password`
  (Completado: 2026-09-22 20:45)
- [x] Pruebas: CLIENTE en ruta admin → 403 (Completado: 2026-09-22 21:05 — 45/45 verde)

---

## FASE 2: Multimedia

Estado: Completado (2026-09-23 21:35)
Dependencias: Fase 1
Especificacion: [08-multimedia.spec.md](../docs/04-api/specs/08-multimedia.spec.md)

Tablas: `multimedia`.
Nota: se implementa antes del catalogo porque categorias, productos, diseños y comprobantes usan `multimedia.id`.

- [x] Cliente de almacenamiento local en `Infraestructura/Almacenamiento/` mediante puerto intercambiable con SFTP futuro (Completado: 2026-09-23 21:35)
- [x] Aplicacion: `SubirArchivoMultimedia`, `ObtenerMultimedia`, `DesactivarMultimedia` (Completado: 2026-09-23 21:35)
- [x] Http:
  - `POST /api/v1/multimedia` (multipart; respuesta **con `id`**)
  - `GET /api/v1/multimedia/{id}`
  - `DELETE /api/v1/multimedia/{id}` (`activo = false`)
  (Completado: 2026-09-23 21:35)
- [x] Validaciones: mimes jpeg/png/jpg/webp/pdf, max 5120 KB, `destino` in productos, comprobantes, personalizaciones, tienda, categorias, publicaciones, disenos (Completado: 2026-09-23 21:35)
- [x] Pruebas: rechazo >5MB, persistencia de `subido_por_id`, JSON con `tamano_bytes` y `tipo_mime`; 12/12 Multimedia y 57/57 suite completa (Completado: 2026-09-23 21:35)

---

## FASE 3: Tienda (configuracion_tienda)

Estado: Completado (2026-09-23 21:48)
Dependencias: Fase 1
Especificacion: [09-tiendas.spec.md](../docs/04-api/specs/09-tiendas.spec.md)

Tablas: `configuracion_tienda` (seed Dulces Aesca y colores). No hay `lema`, `tipo_negocio` ni moneda.

- [x] Dominio: `ConfiguracionTienda`, `ConfiguracionTiendaRepositorio` (Completado: 2026-09-23 21:48)
- [x] Aplicacion: `ObtenerConfiguracionTienda`, `ActualizarConfiguracionTienda` (Completado: 2026-09-23 21:48)
- [x] Http:
  - `GET /api/v1/tienda/configuracion` (publico)
  - `PUT /api/v1/admin/tienda/configuracion` (ADMIN; `nombre_tienda`, colores, `logo_url`, `favicon_url`, contacto)
  (Completado: 2026-09-23 21:48)
- [x] Pruebas: GET publico; CLIENTE en PUT → 403; PUT sin `color_primario` → 422 (Completado: 2026-09-23 21:48)

---

## FASE 4: Categorias

Estado: Completado (2026-09-23 22:14)
Dependencias: Fase 1, Fase 2 (si se asocia `imagen_id`)
Especificacion: [03-categorias.spec.md](../docs/04-api/specs/03-categorias.spec.md)

Tablas: `categorias` (`categoria_padre_id`, UNIQUE por padre, indice parcial de raiz). Sin `slug` ni `parent_id`.

- [x] Dominio: `Categoria`, `CategoriaRepositorio` (Completado: 2026-09-23 22:14)
- [x] Aplicacion: `ListarArbolCategorias`, `CrearCategoria`, `ActualizarCategoria`, `DesactivarCategoria` (Completado: 2026-09-23 22:14)
- [x] Http:
  - `GET /api/v1/categorias`
  - `POST /api/v1/admin/categorias`
  - `PUT /api/v1/admin/categorias/{id}`
  - `DELETE /api/v1/admin/categorias/{id}` (`activo = false`; 400 si tiene productos activos)
  (Completado: 2026-09-23 22:14)
- [x] Pruebas: arbol con `categoria_padre_id`; nombre de raiz duplicado 422 (Completado: 2026-09-23 22:14 — 89/89 suite completa)

---

## FASE 5: Productos y personalizacion

Estado: Completado (2026-09-23 22:50)
Dependencias: Fase 4
Especificacion: [04-productos.spec.md](../docs/04-api/specs/04-productos.spec.md)

Tablas: `productos`, `tortas`, `detalles`, `sublimaciones`, `disenos_torta`, `plantillas_diseno`, `disenos_personalizados`, `producto_multimedia`.

No existen `opciones_personalizacion`, `valores_personalizacion`, `slug` ni `stock` en `productos`. Stock solo en `detalles`.

- [x] Dominio: `Producto` (tipo derivado), `Torta`, `Detalle`, `Sublimacion`, `DisenoTorta`, `PlantillaDiseno`, `DisenoPersonalizado` (Completado: 2026-09-23 22:50)
- [x] Aplicacion: catalogo, CRUD de productos, diseños y plantillas, y diseños personalizados por cliente (Completado: 2026-09-23 22:50)
- [x] Transaccion de alta: `productos` + exactamente una tabla 1:1 + `producto_multimedia` (una sola `es_principal`) (Completado: 2026-09-23 22:50)
- [x] Http:
  - `GET /api/v1/productos` (filtros `categoria_id`, `tipo`, `buscar`, precios, `porciones_*`, `sabor`)
  - `GET /api/v1/productos/{id}`
  - `POST /api/v1/admin/productos`
  - `PUT /api/v1/admin/productos/{id}` (tipo inmutable)
  - `DELETE /api/v1/admin/productos/{id}`
  - `POST /api/v1/admin/tortas/{producto_id}/disenos`
  - `PUT|DELETE /api/v1/admin/disenos-torta/{id}`
  - `POST /api/v1/admin/sublimaciones/{producto_id}/plantillas`
  - `PUT|DELETE /api/v1/admin/plantillas-diseno/{id}`
  - `GET|POST /api/v1/disenos-personalizados` (CLIENTE)
  (Completado: 2026-09-23 22:50)
- [x] Pruebas: filtros, paginacion, transacciones, roles, ciclo de sublimacion, aislamiento por cliente, TORTA sin `sabor` 422, dos imagenes principales 422 y JSON sin campos inexistentes; suite completa 103/103 (Completado: 2026-09-23 22:50)

---

## FASE 6: Publicaciones

Estado: Completado (2026-09-23 23:24)
Dependencias: Fase 2, Fase 4
Especificacion: [11-publicaciones.spec.md](../docs/04-api/specs/11-publicaciones.spec.md)

Tablas: `publicaciones`, `publicacion_multimedia`.

- [x] Dominio: `Publicacion`, imagenes ordenadas y repositorio (Completado: 2026-09-23 23:24)
- [x] Aplicacion: `ListarPublicaciones`, `ConsultarPublicacion`, `CrearPublicacion`, `ActualizarPublicacion`, `DesactivarPublicacion` (Completado: 2026-09-23 23:24)
- [x] Http:
  - `GET /api/v1/publicaciones` (publico solo activas; ADMIN incluye inactivas)
  - `GET /api/v1/publicaciones/{id}`
  - `POST /api/v1/admin/publicaciones`
  - `PUT /api/v1/admin/publicaciones/{id}`
  - `DELETE /api/v1/admin/publicaciones/{id}`
  (Completado: 2026-09-23 23:24)
- [x] Pruebas: filtros, paginacion, imagenes, autenticacion opcional ADMIN, transacciones, categoria y producto opcionales; CLIENTE en POST admin → 403; suite completa 113/113 (Completado: 2026-09-23 23:24)

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
