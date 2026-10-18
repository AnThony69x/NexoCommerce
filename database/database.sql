-- NexoCommerce - entrada de compatibilidad para PostgreSQL 17.
-- Las definiciones se mantienen en schemas/; instalar.sql las ejecuta en orden.
-- Uso: psql -X -U <usuario> -d <base_vacia> -f database/database.sql
\set ON_ERROR_STOP on
\ir instalar.sql
