# Propuesta de retención y archivado de auditoría

Estado actualizado al 18 de octubre de 2026: política acordada; controles SQL incorporados en la versión vigente. Exportación externa, recuperación y retiro siguen pendientes. No se ha habilitado purga. Consultar README.md y OBSERVACIONES_BACKEND.md.
Fecha: 14 de octubre de 2026. Tienda ubicada en Ecuador.

## Alcance y plazos

Se aplica exclusivamente a las nueve tablas de auditoría técnica. No autoriza eliminar usuarios, pedidos, pagos, comprobantes ni el historial de estados. Los plazos son operativos; no constituyen una validación de obligaciones tributarias o legales.

| Dominio | Consulta directa | Conservación total desde el evento |
| --- | --- | --- |
| ventas, pagos | 12 meses | 5 años |
| auth | 6 meses | 2 años |
| catalogo, tienda, produccion | 6 meses | 2 años |
| media, publicaciones, notificaciones | 3 meses | 1 año |

La conservación total incluye el tiempo en la base. El cálculo usa `creado_en`, con meses y años calendario, y una fecha de corte única por ejecución. Los límites se almacenan como instantes UTC y se presentan en America/Guayaquil. Se procesa mensualmente; entre ejecuciones puede existir hasta un mes adicional de permanencia. Un plazo vencido permite iniciar eliminación, no exige borrar sin verificación.

## Arquitectura inicial recomendada

Conservar las tablas existentes y añadir infraestructura de mantenimiento en un esquema separado `auditoria_control`. No mover las nueve tablas ni introducir particiones en la primera implementación: son decisiones independientes que requieren migraciones y mediciones.

Un proceso externo programado exportará lotes acotados, verificará su recuperación y solicitará su retiro mediante un mecanismo privilegiado restringido. Se mantiene la inmutabilidad para el backend. No se utilizará una variable de sesión como autorización de purga: cualquier conexión puede declarar ese tipo de variable.

El diseño debe contemplar:

- Política por dominio: plazo activo, plazo total y versión aprobada.
- Registro de ejecución: identificador, rol de conexión, cortes, estado, inicio, fin y errores.
- Manifiesto de archivo: dominio, versión del esquema, identificadores incluidos, cantidad, fechas extremas, ubicación, tamaño y SHA-256 del archivo exacto.
- Suspensiones de eliminación: motivo, responsable, alcance por registro, pedido, solicitud o transacción cuando esas columnas existan, y liberación explícita.
- Estados de lote: seleccionado, exportado, verificado, retirado, vencido y eliminado.

El almacenamiento será privado, cifrado y con una copia independiente. Su proveedor, credenciales, recuperación de claves y programación se definirán con infraestructura. No almacenar credenciales en scripts ni manifiestos. El hash permite detectar alteraciones respecto de un manifiesto confiable; por sí solo no acredita autenticidad.

## Ciclo mensual

1. Tomar un bloqueo de mantenimiento para evitar dos ejecuciones simultáneas y fijar los cortes por dominio.
2. Seleccionar registros anteriores al corte activo y excluir los retenidos por investigación. Fijar el conjunto exacto de identificadores del lote; no repetir después una selección abierta por fecha para borrar.
3. Exportar todas las columnas y metadatos de versión a un formato recuperable UTF8. El archivo mantiene los secretos excluidos por la captura original.
4. Verificar cantidad e identificadores, checksum y restauración en una tabla aislada. Comparar el contenido restaurado con el conjunto exportado antes de autorizar el retiro. Mantener el lote disponible en la base si cualquier comprobación falla.
5. Confirmar que existen el archivo y su copia independiente. Registrar la evidencia de verificación y su fecha.
6. Dentro de una transacción de mantenimiento, volver a comprobar suspensiones y retirar únicamente el conjunto verificado. Una suspensión nueva cancela el retiro; cualquier error revierte la transacción.
7. Registrar el resultado y alertar si hay lotes incompletos, espacio insuficiente o retrasos. Los reintentos deben recuperar el mismo lote sin duplicar ni perder registros.

El almacenamiento externo y PostgreSQL no comparten una transacción. Por ello, el proceso registra estados persistentes, conserva archivos ante fallos y nunca retira datos solo porque una exportación comenzó.

Los lotes tendrán tamaño configurable y transacciones cortas. No borrar millones de filas en una única transacción. Monitorear WAL, bloqueos y filas muertas; la limpieza ordinaria permite reutilizar espacio pero no garantiza reducir inmediatamente el archivo físico de la tabla.

## Permisos e inmutabilidad

Separar el rol de aplicación, el lector de auditoría, el exportador y el ejecutor de mantenimiento. El rol de aplicación no podrá modificar políticas, manifiestos, suspensiones ni registros históricos.

Una futura función de retiro usará un propietario sin login con los permisos mínimos, objetos calificados y `search_path` seguro. Su ejecución estará revocada a PUBLIC y al backend. El trigger de inmutabilidad necesitará una excepción explícita para ese propietario controlado; conceder DELETE por sí solo no evita el trigger actual. La función verificará lote, evidencia y suspensiones, y no aceptará nombres de tabla arbitrarios.

El proceso de exportación no tendrá por sí mismo permiso de eliminación. La creación y liberación de suspensiones y la administración de credenciales tendrán responsables identificados.

## Consulta y vencimiento del archivo

Los reportes normales seguirán consultando las tablas y vistas de auditoría. La evidencia archivada se recuperará bajo solicitud autorizada en una base o esquema de consulta aislado, usando el manifiesto para seleccionar archivos. No se reinsertará automáticamente en las tablas operativas ni se prometerá consulta inmediata desde las vistas actuales.

Al vencer la conservación total se comprobarán nuevamente las suspensiones antes de eliminar archivos y copias. Agrupar archivos por dominio y fecha permite gestionar vencimientos sin mezclar periodos muy diferentes. Un archivo con registros retenidos no se elimina: se separan y verifican primero los registros que deben seguir conservándose o se mantiene el archivo completo temporalmente.

La expiración de respaldos debe acompañar la política. Una restauración antigua puede recuperar registros ya vencidos: antes de habilitarla se reconciliará con el catálogo de eliminaciones y las suspensiones vigentes. Los respaldos no sustituyen el archivo consultable.

## Validación antes de habilitar retiros

- Exportación y restauración conservan todas las columnas, JSON, fechas y caracteres acentuados.
- Una exportación incompleta, archivo alterado o copia ausente impide retirar registros.
- Una suspensión creada antes del retiro protege el registro incluso si ya se exportó.
- Reiniciar el proceso entre estados no pierde datos ni repite eliminaciones.
- Los roles de aplicación y exportación no pueden activar purgas.
- Los cortes y plazos incluyen casos de fin de mes y cambio de año.
- La recuperación del archivo se demuestra y documenta antes de habilitar retiro automático.
- Se miden lotes pequeños y se ajustan tamaño y frecuencia según bloqueos, WAL y almacenamiento.

## Secuencia de implementación

1. Completado: consolidar la revisión v4.3.2 corregida en database/schemas y actualizar el instalador principal. Los controles SQL existen; las etapas externas y los mecanismos de retiro descritos aquí siguen siendo una propuesta pendiente.
2. Implementar políticas, manifiestos y exportación en modo de simulación, sin permiso de purga.
3. Elegir y configurar almacenamiento; verificar copia independiente y recuperación.
4. Preparar migración del mecanismo de mantenimiento y ejecutar pruebas de permisos y fallos.
5. Habilitar retiros controlados primero en pruebas y después en el entorno autorizado.
6. Evaluar particiones mensuales solo si las mediciones justifican el cambio. Al particionar se revisarán claves únicas, índices, triggers, inserciones tardías, vistas y migración del historial existente.

No se habilita ninguna eliminación con este documento. Los primeros entregables ejecutables serán la exportación y la verificación; el retiro requiere que esas garantías estén implementadas y comprobadas.
