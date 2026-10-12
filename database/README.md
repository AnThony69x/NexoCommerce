# Base de datos — NexoCommerce

Responsable: Melanie. Motor objetivo: PostgreSQL 17; cliente `psql`, puerto 5432/TCP.

## Estructura y fuente principal

`schemas/` contiene el esquema y `instalar.sql` ejecuta los módulos en orden.
`database.sql` es una entrada de compatibilidad que llama a `instalar.sql`;
así existe una sola versión de las definiciones.

| Archivo en schemas/ | Contenido |
| --- | --- |
| `00_base.sql` | Nueve schemas y funciones compartidas en public |
| `01_auth.sql` | Usuarios, roles, OAuth, verificaciones y tokens |
| `02_media.sql` | Multimedia |
| `03_tienda.sql` | Configuración visual, comercial y límites |
| `04_catalogo.sql` | Categorías, productos, subtipos, diseños, galería y stock |
| `05_publicaciones.sql` | Publicaciones y archivos |
| `06_ventas.sql` | Personalizaciones, carritos, pedidos e historial |
| `07_produccion.sql` | Capacidad por fecha y categoría |
| `08_pagos.sql` | Pagos, comprobantes y sincronización |
| `09_notificaciones.sql` | Notificaciones y seguimiento de envío |
| `10_triggers_integridad.sql` | Triggers comunes, jerarquía y protección de auditoría |
| `11_datos_iniciales.sql` | Roles ADMIN/CLIENTE y configuración inicial de Dulces Aesca |

Son 27 tablas de negocio y nueve tablas de auditoría. Los módulos antiguos sin
numeración fueron reemplazados. Los módulos dependen entre sí y no se instalan
individualmente. Los triggers comunes se crean antes de los datos iniciales.
Las tablas internas de Laravel son responsabilidad del backend.

La auditoría es selectiva: registra cambios de roles, usuarios, categorías,
productos y sus subtipos (incluido stock), diseños predefinidos, pedidos y sus
detalles, pagos, comprobantes y configuración de tienda/producción.
No registra automáticamente carritos, OAuth, tokens, verificaciones de correo,
multimedia, galerías, publicaciones, diseños del cliente ni notificaciones.
Se conservan las nueve tablas de auditoría para mantener la organización por
dominio; las de media, publicaciones y notificaciones quedan sin triggers de captura.
El historial de estados del pedido sigue funcionando independientemente.

## Instalación

Usar PostgreSQL 17 y una **base vacía**. Desde la raíz del repositorio:

```bash
createdb -U <usuario> <base_de_datos>
psql -X -U <usuario> -d <base_de_datos> -f database/instalar.sql
```

El instalador ejecuta los módulos en orden mediante `\ir`, con rutas relativas al
propio script y dentro de una sola transacción. Ante un error se detiene y revierte
la instalación completa. Los módulos no tienen BEGIN/COMMIT propios.

También se puede usar la entrada de compatibilidad, que llama al mismo instalador:

```bash
psql -X -U <usuario> -d <base_de_datos> -f database/database.sql
```

Elegir una forma de instalación. Estos scripts no son idempotentes ni migraciones:
no ejecutarlos sobre una instalación existente. Los comandos de inclusión y
control de errores requieren `psql`.

## Mantenimiento

La instalación y el mantenimiento requieren PostgreSQL 17 y `psql`.
Editar los archivos afectados de `schemas/` y validar `instalar.sql` en una base
vacía de prueba. No hay que generar ni copiar el esquema completo.
Si se añade un módulo, incluirlo en `instalar.sql` respetando sus dependencias.
Para bases existentes, preparar migraciones específicas con el encargado del backend.

Consultar [OBSERVACIONES_BACKEND.md](OBSERVACIONES_BACKEND.md) para cambios de
contrato, responsabilidades del API y pruebas pendientes. No se modificó el backend.

## Reglas y límites

- Identificadores BIGINT, fechas TIMESTAMPTZ e importes NUMERIC(10,2).
- Correo único sin distinguir mayúsculas; un carrito activo por usuario y una
  configuración activa de tienda.
- Claves compuestas comprueban que los diseños corresponden al producto de cada
  línea. Los diseños usados en pedidos no se borran; desactivar opciones predefinidas.
- Stock: descuento solo con cantidades positivas mediante
  `catalogo.descontar_stock(id, cantidad)` dentro de la transacción de compra.
- Pedidos nacen PENDIENTE; preparación exige pago APROBADO. La secuencia continúa
  a LISTO y ENTREGADO; cancelación solo antes de LISTO.
- Pagos positivos en USD; se admiten pagos parciales. APROBADO exige que la suma
  de pagos aprobados cubra el total; no se permite reasignar pagos a otro pedido.
- PDF solo para COMPROBANTE; diseños personalizados JPG/PNG con límites
  configurables de tamaño y resolución.
- Auditoría excluye hashes/tokens, ignora cambios exclusivos de `actualizado_en`
  y bloquea UPDATE, DELETE y TRUNCATE.

La concurrencia de galerías, jerarquías y pagos usa bloqueos. Faltan pruebas con
sesiones simultáneas antes del despliegue; instalar correctamente no basta para
validar ese comportamiento.

La instalación mediante `database.sql` y las pruebas de `tests/reglas.sql` se
validaron con PostgreSQL 17. Las pruebas verifican reemplazo/límite de imágenes,
metadatos inmutables, rechazo de PDF en publicaciones, cotización inicial,
fechas/direcciones, estados de pago, pagos parciales, ciclos y descuento de stock.

Para repetirlas en una base de prueba recién instalada y sin datos de negocio:

```bash
psql -X -U <usuario> -d <base_de_prueba> -f database/tests/reglas.sql
```

Los datos de prueba se revierten; las secuencias pueden avanzar. No usar en producción.

## Infraestructura y respaldos

Restringir 5432/TCP al backend y servicios administrativos autorizados. Usar
variables de entorno para host, puerto, base, usuario y contraseña; no guardar
credenciales reales en el repositorio. El rol de ejecución del backend no debe
ser propietario ni poder desactivar triggers. Conceder sobre auditoría solo
INSERT/SELECT y permisos necesarios de secuencias. Revocar permisos de PUBLIC
no configura por sí solo los permisos de un rol de aplicación concreto.

Usar almacenamiento persistente y coordinar backups y pruebas de restauración
con infraestructura. Objetivos: RPO ≤ 24 horas, RTO ≤ 4 horas. CPU, RAM, red y
programación de respaldos corresponden a infraestructura. Estado: en desarrollo.
