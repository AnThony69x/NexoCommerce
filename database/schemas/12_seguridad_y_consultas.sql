-- ============================================================
-- 12. SEGURIDAD Y CONSULTAS DE AUDITORÍA
--     Ejecutar con el usuario PROPIETARIO (el que corre las migraciones). Es repetible:
--     volver a ejecutarlo tras agregar tablas nuevas.
-- ============================================================

-- 12.1 Roles de grupo (sin login). El backend usa un usuario que sea miembro de nexo_app:
--        CREATE USER laravel_api PASSWORD '...' IN ROLE nexo_app;     -- NO propietario de tablas
--        CREATE USER auditor_ti  PASSWORD '...' IN ROLE nexo_auditor; -- solo lectura de auditoría
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'nexo_app')     THEN CREATE ROLE nexo_app NOLOGIN;     END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'nexo_auditor') THEN CREATE ROLE nexo_auditor NOLOGIN; END IF;
END $$;

-- Propietario técnico de captura: sin login, sin superusuario ni pertenencia
-- concedida a la aplicación. El instalador debe poder transferir funciones.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'nexo_captura') THEN
        CREATE ROLE nexo_captura NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'nexo_captura'
               AND (rolcanlogin OR rolsuper OR rolcreatedb OR rolcreaterole OR rolreplication OR rolbypassrls)) THEN
        RAISE EXCEPTION 'nexo_captura existente tiene atributos incompatibles';
    END IF;
END $$;

-- 12.2 Permisos por schema
--   nexo_app     : lectura/escritura de las tablas de negocio; SIN acceso a las auditorías,
--                  SIN TRUNCATE, SIN ser propietario (no puede desactivar triggers).
--   nexo_auditor : solo SELECT sobre las auditorías.
DO $$
DECLARE s text;
BEGIN
    FOREACH s IN ARRAY ARRAY['auth','media','tienda','catalogo','publicaciones',
                             'ventas','produccion','pagos','notificaciones'] LOOP
        EXECUTE format('REVOKE ALL ON ALL TABLES IN SCHEMA %I FROM PUBLIC, nexo_app, nexo_auditor', s);
        EXECUTE format('GRANT USAGE ON SCHEMA %I TO nexo_app, nexo_auditor', s);
        EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA %I TO nexo_app', s);
        EXECUTE format('GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA %I TO nexo_app', s);
    END LOOP;
END $$;

-- Auditoría: acceso de solo lectura al rol auditor; sin acceso para backend/exportador.
REVOKE ALL ON SCHEMA auditoria FROM PUBLIC;
REVOKE ALL ON ALL TABLES IN SCHEMA auditoria FROM PUBLIC, nexo_app;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA auditoria FROM PUBLIC, nexo_app;
GRANT USAGE ON SCHEMA auditoria TO nexo_auditor;
GRANT SELECT ON ALL TABLES IN SCHEMA auditoria TO nexo_auditor;

-- El historial de estados solo lo escribe su trigger; la aplicación solo lo lee.
REVOKE INSERT, UPDATE, DELETE ON ventas.pedido_historial_estado FROM nexo_app;
-- Los pedidos no se borran (se cancelan): conservan su rastro financiero.
REVOKE DELETE ON ventas.pedidos FROM nexo_app;

GRANT USAGE ON SCHEMA public, auth, pagos, ventas, auditoria TO nexo_captura;
GRANT SELECT ON auth.usuarios, pagos.pagos TO nexo_captura;
GRANT INSERT ON ALL TABLES IN SCHEMA auditoria TO nexo_captura;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA auditoria TO nexo_captura;
GRANT INSERT ON ventas.pedido_historial_estado TO nexo_captura;
GRANT USAGE ON SEQUENCE ventas.pedido_historial_estado_id_seq TO nexo_captura;
ALTER FUNCTION public.fn_auditar() OWNER TO nexo_captura;
ALTER FUNCTION public.fn_truncate_negocio() OWNER TO nexo_captura;
ALTER FUNCTION ventas.fn_historial_estado() OWNER TO nexo_captura;
REVOKE ALL ON FUNCTION public.fn_auditar(), public.fn_truncate_negocio(),
    ventas.fn_historial_estado() FROM PUBLIC, nexo_app, nexo_auditor;
-- Los triggers ya creados conservan su ejecución; no se concede EXECUTE al backend.

-- 12.3 Consultas de auditoría (para reportes globales y para seguir un pedido).
--      Se vive en public por ser infraestructura transversal; no son tablas de negocio.
CREATE OR REPLACE VIEW public.v_auditoria_global AS
SELECT 'auth'::text AS schema_origen, id, creado_en, tabla, operacion, registro_id, pedido_id, usuario_id, usuario_bd, origen, id_transaccion, solicitud_id, ip_origen, contexto_invalido, datos_anteriores, datos_nuevos FROM auditoria.auditoria_auth UNION ALL
SELECT 'media'::text AS schema_origen, id, creado_en, tabla, operacion, registro_id, pedido_id, usuario_id, usuario_bd, origen, id_transaccion, solicitud_id, ip_origen, contexto_invalido, datos_anteriores, datos_nuevos FROM auditoria.auditoria_media UNION ALL
SELECT 'tienda'::text AS schema_origen, id, creado_en, tabla, operacion, registro_id, pedido_id, usuario_id, usuario_bd, origen, id_transaccion, solicitud_id, ip_origen, contexto_invalido, datos_anteriores, datos_nuevos FROM auditoria.auditoria_tienda UNION ALL
SELECT 'catalogo'::text AS schema_origen, id, creado_en, tabla, operacion, registro_id, pedido_id, usuario_id, usuario_bd, origen, id_transaccion, solicitud_id, ip_origen, contexto_invalido, datos_anteriores, datos_nuevos FROM auditoria.auditoria_catalogo UNION ALL
SELECT 'publicaciones'::text AS schema_origen, id, creado_en, tabla, operacion, registro_id, pedido_id, usuario_id, usuario_bd, origen, id_transaccion, solicitud_id, ip_origen, contexto_invalido, datos_anteriores, datos_nuevos FROM auditoria.auditoria_publicaciones UNION ALL
SELECT 'ventas'::text AS schema_origen, id, creado_en, tabla, operacion, registro_id, pedido_id, usuario_id, usuario_bd, origen, id_transaccion, solicitud_id, ip_origen, contexto_invalido, datos_anteriores, datos_nuevos FROM auditoria.auditoria_ventas UNION ALL
SELECT 'produccion'::text AS schema_origen, id, creado_en, tabla, operacion, registro_id, pedido_id, usuario_id, usuario_bd, origen, id_transaccion, solicitud_id, ip_origen, contexto_invalido, datos_anteriores, datos_nuevos FROM auditoria.auditoria_produccion UNION ALL
SELECT 'pagos'::text AS schema_origen, id, creado_en, tabla, operacion, registro_id, pedido_id, usuario_id, usuario_bd, origen, id_transaccion, solicitud_id, ip_origen, contexto_invalido, datos_anteriores, datos_nuevos FROM auditoria.auditoria_pagos UNION ALL
SELECT 'notificaciones'::text AS schema_origen, id, creado_en, tabla, operacion, registro_id, pedido_id, usuario_id, usuario_bd, origen, id_transaccion, solicitud_id, ip_origen, contexto_invalido, datos_anteriores, datos_nuevos FROM auditoria.auditoria_notificaciones;

-- Todo lo ocurrido a un pedido: su cambio de estado, líneas, pagos, comprobantes y notificaciones.
--   SELECT * FROM public.v_auditoria_pedido WHERE pedido_id = 123 ORDER BY creado_en, id;
CREATE OR REPLACE VIEW public.v_auditoria_pedido AS
SELECT 'ventas'::text AS schema_origen, id, creado_en, tabla, operacion, registro_id, pedido_id, usuario_id, usuario_bd, origen, id_transaccion, solicitud_id, ip_origen, contexto_invalido, datos_anteriores, datos_nuevos FROM auditoria.auditoria_ventas WHERE pedido_id IS NOT NULL UNION ALL
SELECT 'pagos'::text AS schema_origen, id, creado_en, tabla, operacion, registro_id, pedido_id, usuario_id, usuario_bd, origen, id_transaccion, solicitud_id, ip_origen, contexto_invalido, datos_anteriores, datos_nuevos FROM auditoria.auditoria_pagos WHERE pedido_id IS NOT NULL UNION ALL
SELECT 'notificaciones'::text AS schema_origen, id, creado_en, tabla, operacion, registro_id, pedido_id, usuario_id, usuario_bd, origen, id_transaccion, solicitud_id, ip_origen, contexto_invalido, datos_anteriores, datos_nuevos FROM auditoria.auditoria_notificaciones WHERE pedido_id IS NOT NULL;

REVOKE ALL ON public.v_auditoria_global, public.v_auditoria_pedido FROM PUBLIC;
GRANT SELECT ON public.v_auditoria_global, public.v_auditoria_pedido TO nexo_auditor;
