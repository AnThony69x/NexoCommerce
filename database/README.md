# Base de datos — NexoCommerce

Versión vigente: v4.3.2 corregida, con auditoría centralizada. Fecha de consolidación: 18 de octubre de 2026.

## Fuente única

`schemas/` contiene los 19 módulos SQL vigentes. `instalar.sql` los carga en orden y dentro de una transacción. `database.sql` conserva la entrada de compatibilidad al mismo instalador. No instalar módulos individuales.

Los módulos 00–09 definen funciones compartidas y negocio; `10_auditoria.sql` define las nueve tablas técnicas en el esquema `auditoria`; `10_triggers_integridad.sql` configura captura e integridad; 11 carga datos iniciales; 12 configura seguridad y consultas; 13–17 definen controles de archivado. Los archivos 15–17 son dependencias de la instalación completa aunque sus nombres indiquen versiones anteriores: no eliminarlos.

## Instalación desde la raíz del repositorio

Solo para una base nueva y vacía. No es una migración ni es repetible sobre una instalación existente. La cuenta administrativa debe poder crear roles y transferir propietarios; nunca usarla en Laravel.

```powershell
$env:PGCLIENTENCODING = 'UTF8'
createdb -h localhost -p 5432 -U postgres -E UTF8 nexocommerce
psql -X -h localhost -p 5432 -U postgres -d nexocommerce -v ON_ERROR_STOP=1 -f database/instalar.sql
```

El resultado debe terminar en COMMIT sin errores. Alternativamente, ejecutar `database/database.sql`, que llama al mismo instalador; elegir una entrada.

La revisión documenta validación previa en PostgreSQL 18.4. El usuario confirmó además una instalación en una base de prueba vacía. El objetivo anterior era PostgreSQL 17: confirmar compatibilidad en 17 si se conserva ese destino. La consolidación de rutas no equivale a una nueva ejecución SQL.

## Conexión y mantenimiento

Consultar [OBSERVACIONES_BACKEND.md](OBSERVACIONES_BACKEND.md) para cambios, cuenta de aplicación, Laravel y validación pendiente. El backend del repositorio aún contiene solo su README; esta entrega no implementa PHP ni una conexión activa.

Para cambios futuros, editar esta fuente única, validar el instalador completo en otra base vacía y documentar el cambio. Si aparecen bases con datos, preparar migraciones específicas: no reinstalar ni borrar datos para actualizar.

`revisiones/` se conserva localmente y queda ignorado por Git; contiene el material recibido, ZIP, pruebas, logs y una instancia temporal. No es fuente de instalación. Los SQL de pruebas ya versionados en `tests/` siguen en el historial y en el árbol actual; no se añaden nuevas pruebas en esta entrega.

No hay purga ni exportación externa automática. El control SQL de archivado no sustituye almacenamiento, copias ni restauración verificable.
