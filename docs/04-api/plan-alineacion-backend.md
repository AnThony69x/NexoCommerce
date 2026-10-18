# Plan: alinear el backend con el esquema nuevo de BD y probar el servidor de archivos

## Contexto

La compañera de BD cambió el esquema PostgreSQL (commits `95f1d3f` y `5013fa0`, ya en `main` y en `feat/backend-api`). Ahora hay 11 schemas (`auth`, `media`, `tienda`, `catalogo`, `publicaciones`, `ventas`, `produccion`, `pagos`, `notificaciones`, `auditoria`, `auditoria_control`), triggers de integridad, auditoría inmutable y roles (`nexo_app`, `nexo_backend`).

El backend sigue alineado con el esquema anterior: las migraciones de Laravel crean 25 tablas planas en `public` y los 22 modelos Eloquent apuntan a tablas sin schema.

Además, el compañero del servidor de archivos (Laptop 5, `100.88.4.113`) ya lo tiene en línea y quiere una prueba de integración. Hoy el backend solo escribe en disco local.

## Decisiones tomadas

1. **El SQL manda.** `database/schemas/*.sql` es la fuente de verdad, como pide `database/OBSERVACIONES_BACKEND.md`. Los modelos se adaptan y se retiran las migraciones que crean las tablas de negocio.
2. **Lectura pública por Laravel.** Se mantiene el contrato actual (`GET /api/v1/multimedia/publico/{ruta}`). NGINX de la Laptop 5 no sirve archivos públicos directamente. No se prueba `/storage/`.
3. **Ubicación.** Este documento vive en `docs/04-api/`.

## Guía

### Fase 0: preparación

- Crear una BD de prueba con `database/instalar.sql`. Solo funciona sobre una BD vacía y no es repetible. Crear el rol `nexo_backend` con `GRANT nexo_app TO nexo_backend`, sin propiedad de tablas.
- Revisar a mano `backend/.env.example`, que no se pudo leer en el análisis: `DB_CONNECTION=pgsql`, `DB_USERNAME=nexo_backend`, host por nombre de servicio en Docker y `pdo_pgsql` habilitado.
- Punto abierto: el esquema solo se validó en PostgreSQL 18.4. Confirmar con la compañera qué versión usa la Laptop 4.

### Fase 1: backend alineado al esquema

Orden recomendado, de lo que rompe contratos a lo que solo añade columnas:

| # | Cambio | Archivos clave |
|---|---|---|
| 1 | Retirar `2026_09_21_..._create_nexocommerce_tables`, `oauth_solo_google` y `add_clave_to_configuracion_tienda`. Conservar solo las migraciones técnicas de Laravel (cache, jobs, sesiones) con permisos explícitos. | `backend/database/migrations/` |
| 2 | Mapear las tablas con schema (`auth.usuarios`, `ventas.pedidos`, etc.) en los 22 modelos. Quitar la dependencia de `search_path='public'`. Los IDs pasan a `bigint`. | `backend/app/Infraestructura/Persistencia/Eloquent/Modelos/*`, `backend/config/database.php:98` |
| 3 | Sanctum sobre `auth.personal_access_tokens`, con un modelo de token propio que fije `$table`. | `SanctumTokenService`, configuración de Sanctum |
| 4 | **Publicaciones:** `activo` pasa a `estado` (BORRADOR, PUBLICADA, ARCHIVADA) más `publicada_en`. `publicacion_multimedia.orden` va de 1 a 10. Cambia el contrato. | `PublicacionModelo`, `PublicacionRepositorioEloquent.php` (L24, 57, 74, 99, 112) |
| 5 | **Tienda:** `logo_url` y `favicon_url` pasan a `logo_id` y `favicon_id`. Quitar `clave`. Añadir seis columnas de reglas: `codigo_pais_telefono`, `max_intentos_login`, `minutos_bloqueo_login`, `max_mb_diseno_personalizado`, `min_px_diseno_personalizado`, `horas_revision_comprobante`. | `ConfiguracionTiendaModelo`, `ConfiguracionTiendaRequest`, `ConfiguracionTiendaResource` |
| 6 | **Pedidos:** añadir `estado_pago`, `hora_entrega`, `tipo_entrega`, `direccion_entrega`, `telefono_contacto`, `descuento` y `costo_envio`. Añadir el estado `CANCELADO`. Respetar `total = subtotal - descuento + costo_envio`. No borrar pedidos: cancelar. No escribir `pedido_historial_estado` ni `estado_pago`. | `PedidoModelo`, `PedidoRepositorioEloquent.php` (L51, L182), `CambiarEstadoPedidoRequest`, `EstadosPedido` |
| 7 | **Stock:** usar `catalogo.descontar_stock(id, cantidad)` y comprobar su resultado booleano. | `PedidoRepositorioEloquent.php:51` |
| 8 | **Productos:** persistir `tipo` (TORTA, DETALLE, SUBLIMACION). Usar FK compuestas en los subtipos. Diseños personalizados con `producto_id` y `tipo_producto`, `estado_cotizacion` y `costo_adicional`. Añadir `detalles_carrito.costo_diseno`. | `ProductoModelo`, `ProductoRepositorioEloquent.php:306`, `DisenoPersonalizadoModelo`, `DetalleCarritoModelo` |
| 9 | **Pagos, multimedia y notificaciones:** `pagos.moneda` (USD, `monto > 0`). `multimedia.descripcion`, `modulo` y `checksum_sha256`. `notificaciones.canal`, `estado_envio`, `enviada_en` e `intentos_envio`. | `PagoModelo`, `MultimediaModelo`, `NotificacionModelo`, `SubirMultimediaDTO` |
| 10 | **Auditoría:** en cada transacción de escritura, `set_config('app.usuario_id' / 'app.ip_origen' / 'app.origen' / 'app.solicitud_id', ..., true)` dentro de `DB::transaction`. Para tareas automáticas, usuario vacío y origen `SISTEMA:<tarea>`. Hoy no existe nada de esto en `app/`. | Repositorios Eloquent de escritura; un punto común (middleware o helper) |
| 11 | Limpieza menor: carpetas vacías `Aplicacion/Tiendas`, `Dominio/Tiendas` y `Aplicacion/Catalogo`, que duplican `Tienda` y `Productos`. Decidir con el equipo antes de borrarlas. | `backend/app/*` |

Nota: los precios ya son `NUMERIC(10,2)` en USD. El documento de controladores de Emilio suma en centavos en el demo del carrito. Verificar que no haya mezcla de unidades.

### Fase 2: contratos y clientes

Actualizar los specs afectados (`docs/04-api/specs/06` a `11`), `docs/04-api/openapi/openapi.yaml`, `docs/04-api/guia-integracion-web-movil.md` y `docs/postman/NexoCommerce_Fase1.postman_collection.json`. Avisar a frontend web (Nathalia) y a móvil de los cambios de campos en publicaciones, tienda y pedidos. Marcar en `backend/ROADMAP.md` lo hecho.

### Fase 3: pruebas contra el esquema real

- Correr `database/tests/reglas.sql` (con rollback) en la BD de prueba.
- Pruebas de integración contra una BD cargada con `instalar.sql`. Hoy usan `RefreshDatabase` con las migraciones. Casos nuevos con `nexo_backend`:
  - borrar un pedido queda rechazado;
  - escribir en el historial queda rechazado;
  - leer `auditoria` queda rechazado;
  - una escritura transaccional con `set_config` queda auditada;
  - un pago parcial deja el pedido en PENDIENTE;
  - pasar a EN_PREPARACION exige pago APROBADO.
- Actualizar `tests/Integracion/EsquemaBaseDatosTest.php` y los tests de los módulos tocados.

### Fase 4: prueba con el servidor de archivos

Lectura pública por Laravel.

**Backend (nosotros):**

1. `composer require league/flysystem-sftp-v3`. Hoy no está instalado.
2. Completar el disco `multimedia_sftp`, que hoy es un stub comentado en `backend/config/filesystems.php`: `throw=true`, `timeout`, `hostFingerprint` y `root`.
3. Crear `SftpAlmacenamientoArchivos` en `backend/app/Infraestructura/Almacenamiento/`, hermana de `LocalAlmacenamientoArchivos`. Los errores deben ser controlados (503 o excepción de dominio), no un 404 engañoso.
4. Binding por variable `MULTIMEDIA_DISK` en `backend/app/Providers/AppServiceProvider.php:60`, para poder volver a local.
5. Variables `MULTIMEDIA_SFTP_HOST`, `_PORT`, `_USER`, `_KEY` y `_ROOT` en `.env` y en `backend/docker-compose.yml`. La clave privada se monta como secreto y nunca va al repo.
6. Subir `upload_max_filesize` y `post_max_size` de PHP, y `client_max_body_size` de NGINX, por encima de 5 MB. Hoy valen los defaults y un archivo de 5 MB probablemente falla.
7. Borrar el archivo remoto si falla el INSERT en `SubirArchivoMultimedia`. Hoy queda huérfano.

**Pedir a Emilio (servidor de archivos):**

- Usuario SFTP exclusivo, clave pública autorizada y huella del host.
- Raíz real (`/srv/nexocommerce` por defecto).
- Las 7 carpetas de destino: `productos`, `categorias`, `tienda`, `publicaciones`, `disenos`, `comprobantes` y `personalizaciones`. Su README propone otras: falta `categorias` y `disenos`, y sobra `plantillas`.
- Permisos: escritura para el usuario SFTP. Los privados nunca se sirven por NGINX.

**Prueba manual, en orden:**

1. `nc -zv 100.88.4.113 22 80` desde el contenedor del backend.
2. Subir como ADMIN a `productos` y como CLIENTE a `comprobantes`.
3. Verificar el archivo en el disco de la VM.
4. Leer la imagen pública sin token por la API.
5. Descargar el comprobante con el token del dueño (200) y con otro usuario (403).
6. Comprobar que el comprobante no se sirve por NGINX en el puerto 80.
7. Subir con la instancia 8001 y leer con la 8002.

**Éxito:** los siete pasos pasan, y un fallo de red (servidor apagado) devuelve un error de servicio controlado.

### Fase 5: cierre

Actualizar `backend/ROADMAP.md` (pendientes de conexión al PostgreSQL central y de failover) y `docs/09-bitacora/bitacora-backend.md`. Hacer commits por fase en `feat/backend-api` y abrir PR a `main`. No ejecutar `php artisan migrate --seed` sin revisarlo, porque puede duplicar tablas del instalador.

## Riesgos y puntos abiertos

- Cambia el contrato de la API en publicaciones, tienda y pedidos. Coordinar con frontend y móvil antes de fusionar.
- Retirar la migración de tablas deja las pruebas actuales sin BD hasta que exista el flujo con `instalar.sql` (Fase 3). Hacerlo en la misma rama.
- `backend/.env.example` no se pudo leer en el análisis: revisarlo a mano.
- Versión de PostgreSQL (17 o 18) sin confirmar.
- El análisis fue de lectura estática. Una prueba contra una BD real puede revelar más desajustes.
