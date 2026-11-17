-- NexoCommerce v4.3.2 corregida. Instalacion limpia mediante psql.
\set ON_ERROR_STOP on
BEGIN;
\ir schemas/00_base.sql
\ir schemas/01_auth.sql
\ir schemas/02_media.sql
\ir schemas/03_tienda.sql
\ir schemas/04_catalogo.sql
\ir schemas/05_publicaciones.sql
\ir schemas/06_ventas.sql
\ir schemas/07_produccion.sql
\ir schemas/08_pagos.sql
\ir schemas/09_notificaciones.sql
\ir schemas/10_auditoria.sql
\ir schemas/10_triggers_integridad.sql
\ir schemas/11_datos_iniciales.sql
\ir schemas/12_seguridad_y_consultas.sql
\ir schemas/13_auditoria_control.sql
\ir schemas/14_auditoria_consultas.sql
\ir schemas/15_control_v43.sql
\ir schemas/16_endurecimiento_v431.sql
\ir schemas/17_cierre_bd_v432.sql
COMMIT;
