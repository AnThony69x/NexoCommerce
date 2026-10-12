-- Instalación modular desde cero en PostgreSQL 17. Ejecutar con psql.
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
\ir schemas/10_triggers_integridad.sql
\ir schemas/11_datos_iniciales.sql
COMMIT;
