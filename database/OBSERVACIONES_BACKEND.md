# Entrega e integración de base de datos para backend

Fecha: 18 de octubre de 2026. Versión: v4.3.2 corregida, auditoría centralizada.

## Qué se hizo

Se reemplazó la versión anterior de `database/schemas/` por los 19 módulos de la revisión corregida y se actualizó `database/instalar.sql` con rutas relativas a esa carpeta. `database/database.sql` sigue siendo la entrada de compatibilidad. No quedan dos versiones publicables: el material de `database/revisiones/` se conserva localmente pero está ignorado por Git. La versión anterior permanece recuperable en el historial.

No se modificaron reglas SQL de la revisión al consolidarla. Se actualizaron las instrucciones vigentes; no se añadieron código PHP, credenciales, pruebas ni logs. No se ejecutó commit ni push.

## Cambios respecto de la fuente anterior

- Las nueve tablas técnicas pasan de `<dominio>.auditoria` a `auditoria.auditoria_<dominio>`. Las consultas antiguas deben adaptarse. Se agregan vistas `public.v_auditoria_global` y `public.v_auditoria_pedido`, destinadas al rol auditor.
- Se amplía la captura a OAuth, verificaciones de correo (INSERT/UPDATE), tokens relevantes, multimedia, galerías, publicaciones y diseños personalizados. Los carritos siguen excluidos; en notificaciones se capturan borrados. Los secretos se excluyen; `last_used_at` de Sanctum no genera captura por sí solo.
- Los eventos incluyen correlación de pedido, solicitud y transacción, usuario de BD, origen y contexto inválido.
- `nexo_app` tiene permisos de negocio sin acceso directo a auditoría/control; `nexo_auditor` permite lectura de auditoría; `nexo_exportador` dispone de lectura limitada; `nexo_captura` es un propietario técnico NOLOGIN para funciones de captura, sin membresía para la aplicación.
- La aplicación no puede borrar pedidos ni escribir directamente en `ventas.pedido_historial_estado`; el historial lo mantiene el trigger. Cancelar pedidos mediante estados.
- Se agregan políticas, lotes, manifiestos, suspensiones, catálogo y controles de archivado. No implementan exportación física, copia independiente, restauración externa ni purga.

## Instalación y cuenta de conexión

Seguir [README.md](README.md) desde la raíz, en una base vacía. El instalador requiere una cuenta administrativa y finaliza con COMMIT. No ejecutar `php artisan migrate --seed` sin revisar sus migraciones: podría duplicar tablas o datos del instalador SQL.

Después de instalar, el administrador crea una cuenta LOGIN separada; ejemplo en psql conectado como administrador a la base instalada:

```sql
CREATE ROLE nexo_backend LOGIN INHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
GRANT nexo_app TO nexo_backend;
```

Configurar su contraseña interactivamente con `\password nexo_backend` en psql, sin incorporarla a scripts ni al repositorio. Revisar permisos CONNECT de la base y reglas de autenticación/red. No conceder propiedad de tablas, privilegios administrativos ni membresía de `nexo_captura`/auditor/exportador. Los roles son globales al clúster: revisar atributos y membresías si ya existen.

Configurar la cuenta con permisos efectivos de `nexo_app`; el backend no ejecuta el instalador con esa cuenta. Las futuras migraciones administrativas usan otra identidad. Las tablas internas de Laravel necesitan migraciones y permisos explícitos según el esquema elegido; no están cubiertas automáticamente por estos scripts.

## Conexión Laravel pendiente de implementar

Habilitar `pdo_pgsql`. Configurar los valores reales en un `.env` local no versionado, por ejemplo:

```dotenv
DB_CONNECTION=pgsql
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=nexocommerce
DB_USERNAME=nexo_backend
DB_PASSWORD=<secreto local>
```

En Docker, usar el nombre real del servicio PostgreSQL como host; `localhost` dentro del contenedor apunta al propio contenedor. El compose actual está vacío. Configurar red y TLS según el entorno, restringiendo PostgreSQL al backend y administración autorizada.

Mapear tablas con esquema (`auth.usuarios`, `catalogo.productos`, etc.), evitando depender de un search_path implícito. Adaptar Eloquent a `creado_en`/`actualizado_en` donde correspondan; algunas tablas tienen otras convenciones o no tienen ambos campos. Autenticación usa `correo` y `password_hash`, con hash compatible con las restricciones SQL, y contempla cuentas OAuth sin contraseña. Configurar el modelo de tokens Sanctum para `auth.personal_access_tokens`, que usa sus fechas en inglés.

Dentro de CADA transacción de escritura, usar la misma conexión para el contexto y las operaciones. Ejemplo orientativo de llamadas parametrizadas a integrar en `DB::transaction`:

```php
DB::select("SELECT set_config('app.usuario_id', ?, true), set_config('app.ip_origen', ?, true), set_config('app.origen', ?, true), set_config('app.solicitud_id', ?, true)", [$usuarioId ?? '', $ip ?? '', 'API', $solicitudId ?? '']);
```

Obtener el usuario de la autenticación del servidor. Para tareas automáticas usar usuario vacío y origen `SISTEMA:<tarea>`. El contexto local dura la transacción; establecerlo fuera de ella no sirve para escrituras posteriores. El contexto informa auditoría y no reemplaza autorización; valores inválidos se registran como contexto inválido.

## Reglas de negocio que debe mantener el API

- Autorizar que cada diseño pertenece al usuario; crear producto y subtipo en una transacción.
- Calcular precios y suma de detalles en servidor. El CHECK del pedido solo relaciona subtotal, descuento y costo_envio; no suma detalles.
- Crear pedidos con estados PENDIENTE y no duplicar su historial. No modificar manualmente `estado_pago`: lo sincronizan los pagos aprobados en USD, incluidos pagos parciales.
- Usar `catalogo.descontar_stock(id, cantidad)` dentro de la compra y comprobar su BOOLEAN. Definir devolución de stock y reserva concurrente de capacidad.
- Coordinar cobros con idempotencia; validar contenido real de archivos, propiedad y metadatos. Reemplazar archivos con una fila nueva de multimedia.
- Implementar envío/reintentos de notificaciones y revisión de comprobantes; almacenar configuración no ejecuta tareas.
- Respetar los nombres actuales: diseños con producto_id/tipo_producto, publicaciones con publicada_en y estado, pedidos con costo_envio/hora_entrega y pago APROBADO.

## Validación y pendientes

El informe local de la revisión documenta instalación y pruebas de permisos en PostgreSQL 18.4, UTF8 y conexión con una cuenta LOGIN no propietaria. El usuario confirmó instalación en una base de prueba vacía. Estos antecedentes no certifican la futura configuración de Laravel ni de producción.

Tras consolidar, comprobar rutas y equivalencia de los módulos. Antes de integrar, probar conexión real con nexo_backend, una escritura transaccional con captura indirecta y rechazo de lectura directa de auditoría/control, borrado de pedidos y escritura del historial. Ejecutar esas comprobaciones en la base de prueba con reversión. Si se usa PostgreSQL 17, repetir instalación y validación allí.

Backend debe crear la aplicación Laravel (aún ausente en esta carpeta), adaptar modelos y autenticación, y comprobar el flujo pedido/pago/stock. Infraestructura debe configurar autenticación, red, persistencia, backups y restauración. Quedan pendientes pruebas concurrentes de pagos, galerías, jerarquías y controles de archivado. No habilitar retiros ni prometer consulta externa del archivo: faltan almacenamiento, evidencia criptográfica, copias, recuperación, programación y permisos operativos.
