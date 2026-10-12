# Observaciones para el encargado del backend

No se modificó código del backend. Estos scripts instalan una base vacía;
para instalaciones existentes se requieren migraciones y revisión de datos.

## Cambios de contrato

| Objeto | Cambio respecto al esquema anterior del repositorio |
| --- | --- |
| Identificadores y referencias | BIGINT |
| Diseños personalizados | `sublimacion_id` pasa a `producto_id`/`tipo_producto`; admite TORTA y SUBLIMACION |
| Cotización del diseño | Por defecto PENDIENTE y costo NULL; NO_REQUIERE/COTIZADO requieren costo no negativo explícito |
| Publicaciones | `publicado_en` pasa a `publicada_en`; desaparece `activo`; usar su estado |
| Imágenes de publicaciones | `orden` obligatorio, único por publicación y entre 1 y 10 |
| Pedidos | `impuesto` se reemplaza por `costo_envio`; nueva `hora_entrega` |
| Estado de pago del pedido | PENDIENTE/APROBADO/RECHAZADO/REEMBOLSADO; ya no PAGADO |
| Detalles del carrito | Nuevo `costo_diseno` |
| Multimedia | Descripción y módulo; PDF únicamente para COMPROBANTE |
| Tienda | Límites configurables de login, archivos, resolución y revisión |
| Notificaciones | Canal, estado y fecha de envío, intentos |
| Auditoría | IP tipo INET; protección contra cambios y vaciado |

## Responsabilidades de integración

La auditoría automática se limita a identidad (roles/usuarios), catálogo y stock,
pedidos/detalles, pagos/comprobantes y configuración de tienda/producción.
No hay captura automática de carritos, OAuth, tokens, verificaciones, multimedia,
galerías, publicaciones, diseños del cliente o notificaciones. El historial de
estados del pedido se conserva. Estos cambios son para instalaciones nuevas;
las bases existentes necesitan eliminar los triggers excluidos mediante migración,
sin borrar sus registros históricos.

- Autorizar que el diseño pertenece al usuario de la compra. Las FK solo
  comprueban la correspondencia entre producto y diseño.
- Crear producto y subtipo en la misma transacción: no se exige automáticamente
  que todo producto tenga una fila en su subtipo.
- Calcular precios y subtotales en el servidor. El CHECK del total no verifica
  la suma de detalles: total = subtotal - descuento + costo_envio.
- Crear pedidos con ambos estados PENDIENTE. La BD registra su historial inicial
  y cambios posteriores; evitar duplicarlos desde el API.
- El trigger mantiene el estado de pago. Regla elegida: suma de pagos APROBADO
  en USD cubre el total; admite pagos parciales. Confirmar esta política con el
  equipo antes de desplegar. No modificar manualmente `estado_pago`.
- Los pagos requieren monto positivo y no pueden reasignarse de pedido. La
  referencia única ayuda con duplicados, pero también se requiere idempotencia
  al coordinar cobros externos. No se almacenan datos de tarjeta.
- Usar `catalogo.descontar_stock(id, cantidad)` y comprobar su retorno BOOLEAN
  en la transacción de compra. Definir devolución de stock ante cancelaciones.
- Validar capacidad de producción con control de concurrencia: el esquema guarda
  límites, pero no reserva capacidad automáticamente al crear pedidos.
- Inspeccionar archivos reales y comprobar sus metadatos. La BD valida valores
  declarados; no inspecciona el contenido del archivo. Validar archivos activos
  y mínimos de imágenes desde el API.
- Los metadatos técnicos y módulo de multimedia son inmutables: reemplazar un
  archivo creando otra fila y actualizar sus referencias. Nombre, descripción
  y activo siguen siendo editables. Las referencias visuales solo admiten imágenes.
- Publicar exige `publicada_en`; enviar exige `enviada_en`; marcar como leída
  exige `fecha_lectura`. Una dirección de domicilio no puede estar vacía.
- Implementar envío/reintentos de notificaciones y revisión de comprobantes:
  almacenar límites y fechas no ejecuta esas tareas.
- Informar actor e IP válida dentro de cada transacción, cuando se conozcan:

  ```sql
  SET LOCAL app.usuario_id = '123';
  SET LOCAL app.ip_origen = '127.0.0.1';
  ```

- Usar un rol sin propiedad de tablas ni permisos para desactivar triggers.
  Reintentar conflictos de serialización/interbloqueos con operaciones idempotentes.

## Validación pendiente

La equivalencia de los instaladores no sustituye pruebas del negocio. Comprobar
galerías, jerarquías y pagos con sesiones simultáneas antes del despliegue.
