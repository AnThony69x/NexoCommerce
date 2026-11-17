-- V4: infraestructura no destructiva; NO contiene DELETE/TRUNCATE ni permisos de retiro.
CREATE SCHEMA auditoria_control;
REVOKE ALL ON SCHEMA auditoria_control FROM PUBLIC;
CREATE TABLE auditoria_control.politicas (
 dominio text PRIMARY KEY CHECK (dominio IN ('ventas','pagos','auth','catalogo','tienda','produccion','media','publicaciones','notificaciones')),
 meses_activos integer NOT NULL CHECK (meses_activos > 0),
 meses_totales integer NOT NULL CHECK (meses_totales >= meses_activos),
 version text NOT NULL, aprobada_en timestamptz NOT NULL DEFAULT now()
);
INSERT INTO auditoria_control.politicas (dominio,meses_activos,meses_totales,version) VALUES
 ('ventas',12,60,'2026-10-14'),('pagos',12,60,'2026-10-14'),('auth',6,24,'2026-10-14'),
 ('catalogo',6,24,'2026-10-14'),('tienda',6,24,'2026-10-14'),('produccion',6,24,'2026-10-14'),
 ('media',3,12,'2026-10-14'),('publicaciones',3,12,'2026-10-14'),('notificaciones',3,12,'2026-10-14');
CREATE TABLE auditoria_control.ejecuciones (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 rol_conexion text NOT NULL DEFAULT current_user,
 corte_fijado_en timestamptz NOT NULL DEFAULT transaction_timestamp(),
 estado text NOT NULL DEFAULT 'simulacion' CHECK (estado IN ('simulacion','seleccionado','exportado','verificado','fallido','finalizado')),
 inicio timestamptz NOT NULL DEFAULT now(), fin timestamptz, error text
);
CREATE TABLE auditoria_control.lotes (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 ejecucion_id bigint NOT NULL REFERENCES auditoria_control.ejecuciones(id),
 dominio text NOT NULL REFERENCES auditoria_control.politicas(dominio),
 corte_activo timestamptz NOT NULL,
 estado text NOT NULL DEFAULT 'seleccionado' CHECK (estado IN ('seleccionado','exportado','verificado','retirado','vencido','eliminado','fallido')),
 creado_en timestamptz NOT NULL DEFAULT now(),
 UNIQUE(id, dominio)
);
CREATE TABLE auditoria_control.lote_registros (
 lote_id bigint NOT NULL REFERENCES auditoria_control.lotes(id),
 registro_id bigint NOT NULL,
 PRIMARY KEY(lote_id,registro_id)
);
CREATE TABLE auditoria_control.manifiestos (
 lote_id bigint PRIMARY KEY REFERENCES auditoria_control.lotes(id),
 version_esquema text NOT NULL, ubicacion text NOT NULL,
 cantidad bigint NOT NULL CHECK(cantidad >= 0),
 minimo_creado_en timestamptz, maximo_creado_en timestamptz,
 tamano_bytes bigint NOT NULL CHECK(tamano_bytes >= 0),
 sha256 char(64) NOT NULL CHECK (sha256 ~ '^[0-9a-f]{64}$'),
 copia_independiente_verificada boolean NOT NULL DEFAULT false,
 restauracion_verificada boolean NOT NULL DEFAULT false,
 verificado_en timestamptz
);
CREATE TABLE auditoria_control.suspensiones (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 dominio text REFERENCES auditoria_control.politicas(dominio),
 registro_id bigint, pedido_id bigint, solicitud_id text, id_transaccion bigint,
 motivo text NOT NULL, responsable text NOT NULL,
 creado_en timestamptz NOT NULL DEFAULT now(), liberado_en timestamptz,
 liberado_por text,
 CHECK (num_nonnulls(registro_id,pedido_id,solicitud_id,id_transaccion) >= 1),
 CHECK (liberado_en IS NULL OR liberado_por IS NOT NULL)
);
-- Nadie salvo el propietario de migración recibe permisos de escritura.
REVOKE ALL ON ALL TABLES IN SCHEMA auditoria_control FROM PUBLIC, nexo_app, nexo_auditor;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA auditoria_control FROM PUBLIC, nexo_app, nexo_auditor;

-- Rol exportador de solo lectura. Nunca recibe INSERT/UPDATE/DELETE/TRUNCATE.
DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='nexo_exportador') THEN
  CREATE ROLE nexo_exportador NOLOGIN;
 END IF;
END $$;
GRANT USAGE ON SCHEMA auditoria, auditoria_control TO nexo_exportador;
GRANT SELECT ON ALL TABLES IN SCHEMA auditoria TO nexo_exportador;
GRANT SELECT ON auditoria_control.politicas TO nexo_exportador;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON ALL TABLES IN SCHEMA auditoria FROM nexo_exportador;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON ALL TABLES IN SCHEMA auditoria_control FROM nexo_exportador;
