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

### Entorno de trabajo (verificado 2026-10-18)

Todo corre en VMs Debian 13 conectadas por Tailscale (tailnet `nexocommerce4`). Se trabaja desde la VM del backend por SSH.

| Nodo | IP Tailscale | Responsable | Estado |
|---|---|---|---|
| backend | 100.73.6.17 | Anthony | En línea. Desde aquí se trabaja. |
| file-server | 100.88.4.113 | Emilio | En línea. `tailscale ping` responde (83 a 96 ms). |
| postgresql | 100.88.139.50 | Melanie | **Offline, última vez visto hace 12 días.** |

- **SFTP verificado:** desde la VM del backend, `sftp user@100.88.4.113` conecta (puerto 22, autenticación por contraseña). El adaptador de Laravel usará esa misma ruta; no hace falta pasar por NGINX.
- **Pendiente de SFTP:** la prueba fue con contraseña. El plan pide autenticación por clave. La clave privada va como secreto en la VM, fuera del repo, y la huella del host se fija en la configuración.
- **Pendiente de red:** comprobar que los contenedores Docker del backend alcancen `100.88.4.113`. Su tráfico sale por la interfaz `tailscale0` del host; hay que probarlo, no asumirlo.
- **Consecuencia para las pruebas:** como PostgreSQL de Melanie está offline, las pruebas no pueden usar la BD central. Ver Fase 0.

### Fase 0: preparación

- **BD de pruebas:** no usar la BD de `.env` (Supabase según la bitácora). `RefreshDatabase` borra y recrea las tablas, y `phpunit.xml` no fija una BD propia. Levantar un PostgreSQL 17 local en la VM del backend con `docker-compose.demo.yml` (puerto distinto, sin tocar `.env`) y ejecutar las pruebas con variables de entorno que apunten a ese contenedor.
- Cargar `database/instalar.sql` en esa BD vacía. Solo funciona sobre una BD vacía y no es repetible. Crear el rol `nexo_backend` con `GRANT nexo_app TO nexo_backend`, sin propiedad de tablas.
- **Estado (2026-10-18):** hecho. Contenedor `nexo-test-db` (PostgreSQL 17.11, `postgres:17-alpine`), ligado solo a `127.0.0.1:55432`, base `nexo_test`. `instalar.sql` cargado sin errores: 11 schemas con sus tablas y roles `nexo_app`, `nexo_auditor`, `nexo_captura` y `nexo_exportador`. Rol `nexo_backend` creado y miembro de `nexo_app`. El contenedor usa autenticación `trust`, válida solo para esta prueba local. No se usó `docker-compose.demo.yml`: falla porque `backend-1` está definido sin imagen y solo sirve como override.
- Revisar a mano `backend/.env.example`, que no se pudo leer en el análisis: `DB_CONNECTION=pgsql`, `DB_USERNAME=nexo_backend`, host por nombre de servicio en Docker y `pdo_pgsql` habilitado.
- Punto abierto: el esquema solo se validó en PostgreSQL 18.4. Confirmar con la compañera qué versión usa la Laptop 4.

### Instalación de la base (procedimiento)

Dos cuentas distintas:

- **Administrativa** (`postgres` en local, o la que tenga Melanie): crea el esquema. Nunca se usa en la aplicación.
- **`nexo_backend`**: la usa la aplicación. Solo tiene permisos de `nexo_app`.

Hay dos caminos para crear el esquema. Son excluyentes: no ejecutar los dos sobre la misma base.

**Camino A, API independiente (el que usa el equipo de backend):** el esquema está en `backend/database/schemas/` (copia de `database/schemas/`, sin cambios) y hay 19 migraciones `0001_01_02_000001` a `0001_01_02_000019` (`esquema_<modulo>`), una por módulo, que ejecutan cada archivo SQL tal cual en el orden de `backend/database/instalar.sql`. Pasos, con la cuenta administrativa, en una base nueva:

0. Antes de migrar, revisar la base con `php artisan bd:verificar`. Informa si hay conexión, qué cuenta se usa, si esa cuenta puede crear tablas y si el esquema ya está instalado. Con `--connection=<nombre>` revisa otra conexión configurada.
1. `DB_USERNAME=<administrativa> php artisan migrate`: crea las 47 tablas de negocio (más la tabla `migrations` de Laravel).
2. Crear la cuenta de la aplicación, una sola vez por clúster; la contraseña se configura con `\password nexo_backend`, nunca en scripts:
   `CREATE ROLE nexo_backend LOGIN INHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS; GRANT nexo_app TO nexo_backend;`
3. Dar a la aplicación acceso a las tablas: `GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO nexo_backend;` y `GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO nexo_backend;`.

Si `auth.usuarios` ya existe, la migración de negocio no hace nada. Se verificó que es no-op sobre una base instalada con el camino B.

La API no usa tablas técnicas de Laravel: no hay colas, caché en base de datos, sesiones ni recuperación de contraseña. Por eso no hay migraciones `cache`, `jobs` ni `sessions`. `.env.example` usa `CACHE_STORE=file`, `SESSION_DRIVER=cookie` y `QUEUE_CONNECTION=sync`. Si un `.env` local usa `database` para cualquiera de estos drivers, debe cambiarse, porque esas tablas ya no se crean.

**Camino B, instalador de Melanie (`database/README.md`):** `psql -X -U postgres -d <base> -v ON_ERROR_STOP=1 -f database/instalar.sql` en una base vacía, debe terminar en `COMMIT`. Después se sigue el paso 2 y el 3 del camino A.

**Mantenimiento de la copia:** `backend/database/schemas/` y `backend/database/instalar.sql` son copias de `database/`. Si Melanie cambia el SQL, hay que volver a copiarlo y validar; hoy son idénticos (`diff -r`).

Verificado en local el 2026-10-19 con PostgreSQL 17.11: camino A (migrate solo, 55 tablas), suite administrativa 172 de 173, suite `nexo_backend` 171 de 172, concurrentes 4 de 4. No ejecutar `php artisan migrate --seed` (ver `database/OBSERVACIONES_BACKEND.md`).

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
- **Estado (2026-10-18, verificado en local):**
  - Suite principal como `postgres` (superusuario local): 172 pasan y 1 se omite, que ya estaba omitida antes.
  - Pruebas concurrentes en base nueva: 4 de 4.
  - Permisos con `nexo_backend`, script `backend/tests/Sql/permisos_nexo_backend.sql`: las 8 operaciones prohibidas se rechazan (borrar pedidos, escribir en `pedido_historial_estado`, leer, modificar y truncar `auditoria`).
  - Decisión sobre la auditoría: la prueba `test_alta_de_categoria_queda_auditada_con_el_usuario_que_la_creo` lleva el grupo `auditoria`. Lee `auditoria` con la conexión de la app, así que solo corre con la cuenta dueña. Con `nexo_backend` se excluye con `--exclude-group auditoria`.
  - Suite como `nexo_backend` (sin `concurrente` ni `auditoria`): 171 pasan y 1 se omite, en PostgreSQL 17.11 y 18.6.
  - Escritura real como `nexo_backend`: el INSERT en `catalogo.categorias` queda auditado con origen `API`. Sin usuario válido en la base de prueba, `usuario_id` queda vacío.
  - PostgreSQL 18.6 (la versión documentada por la base, validada 18.4): `instalar.sql`, `database/tests/reglas.sql` y las 9 comprobaciones de permisos pasan. La versión 17 también pasa todo.
  - `migrate` como `nexo_backend` falla sin `CREATE` en `public` (PostgreSQL 15 o superior lo bloquea por defecto). Las tablas técnicas (`cache`, `jobs`, `sessions`, `password_reset_tokens`) se crean una vez con la cuenta dueña.

### Fase 4: prueba con el servidor de archivos

Lectura pública por Laravel.

**Backend (nosotros):**

1. `composer require league/flysystem-sftp-v3`. Hoy no está instalado. **Requiere aprobación previa:** `backend/CLAUDE.md` prohíbe cambiar dependencias sin permiso.
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

1. Desde la VM del backend: `sftp user@100.88.4.113` (ya verificado). Después, desde el contenedor del backend: `nc -zv 100.88.4.113 22 80`.
2. Subir como ADMIN a `productos` y como CLIENTE a `comprobantes`.
3. Verificar el archivo en el disco de la VM.
4. Leer la imagen pública sin token por la API.
5. Descargar el comprobante con el token del dueño (200) y con otro usuario (403).
6. Comprobar que el comprobante no se sirve por NGINX en el puerto 80.
7. Subir con la instancia 8001 y leer con la 8002.

**Éxito:** los siete pasos pasan, y un fallo de red (servidor apagado) devuelve un error de servicio controlado.

### Pendientes para cuando estén encendidas la BD de Melanie y el servidor de archivos

Esto no se puede hacer desde la VM sin ellos:

- Prueba end-to-end de los siete pasos de la Fase 4 contra `100.88.4.113`.
- Variables SFTP en el `.env` local, clave privada como secreto y huella del host real (la da Emilio).
- Confirmar con Melanie los permisos finales de `nexo_backend` en su base y que las tablas técnicas las crea la cuenta dueña.
- Las pruebas escriben datos: solo contra una base de prueba que Melanie apruebe, nunca contra la base de producción.
- Avisos a Nathalia y Emilio de los cambios de contrato.
- `client_max_body_size` de NGINX (carpeta `nginx/`, fuera del alcance acordado).

### Fase 5: cierre

Actualizar `backend/ROADMAP.md` (pendientes de conexión al PostgreSQL central y de failover) y `docs/09-bitacora/bitacora-backend.md`. Hacer commits por fase en `feat/backend-api` y abrir PR a `main`. No ejecutar `php artisan migrate --seed` sin revisarlo, porque puede duplicar tablas del instalador.

## Riesgos y puntos abiertos

- Cambia el contrato de la API en publicaciones, tienda y pedidos. Coordinar con frontend y móvil antes de fusionar.
- Retirar la migración de tablas deja las pruebas actuales sin BD hasta que exista el flujo con `instalar.sql` (Fase 3). Hacerlo en la misma rama.
- `backend/.env.example` no se pudo leer en el análisis: revisarlo a mano.
- Versión de PostgreSQL (17 o 18) sin confirmar.
- El análisis fue de lectura estática. Una prueba contra una BD real puede revelar más desajustes.
