-- 0. SCHEMAS
-- ============================================================
CREATE SCHEMA auth;
CREATE SCHEMA media;
CREATE SCHEMA tienda;
CREATE SCHEMA catalogo;
CREATE SCHEMA publicaciones;
CREATE SCHEMA ventas;
CREATE SCHEMA produccion;
CREATE SCHEMA pagos;
CREATE SCHEMA notificaciones;
CREATE SCHEMA auditoria;

COMMENT ON SCHEMA auth           IS 'Identidad, acceso y seguridad (usuarios, roles, OAuth, tokens)';
COMMENT ON SCHEMA media          IS 'Registro de archivos almacenados en el File Server';
COMMENT ON SCHEMA tienda         IS 'Parametrización de la instalación (identidad visual y datos comerciales)';
COMMENT ON SCHEMA catalogo       IS 'Categorías, productos y opciones de personalización';
COMMENT ON SCHEMA publicaciones  IS 'Contenido promocional, separado del catálogo transaccional';
COMMENT ON SCHEMA ventas         IS 'Proceso de compra: carrito, diseños del cliente y pedidos';
COMMENT ON SCHEMA produccion     IS 'Capacidad diaria de elaboración';
COMMENT ON SCHEMA pagos          IS 'Cobros y comprobantes (información financiera)';
COMMENT ON SCHEMA notificaciones IS 'Mensajes dirigidos a los usuarios';


-- ============================================================
-- 1. FUNCIONES COMPARTIDAS (schema public)
--    Captura compartida; destinos definidos en 10_auditoria.sql.
-- ============================================================

-- 1.1 Mantiene `actualizado_en` al día en cualquier UPDATE.
CREATE FUNCTION public.fn_actualizado_en() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
    NEW.actualizado_en := now();
    RETURN NEW;
END $$;

-- 1.2 Contexto del actor. El backend lo informa dentro de CADA transacción con:
--         SET LOCAL app.usuario_id   = '<id del usuario autenticado>';
--         SET LOCAL app.ip_origen    = '<ip del cliente>';
--         SET LOCAL app.origen       = 'API'  |  'SISTEMA:<tarea>';   (tareas automáticas)
--         SET LOCAL app.solicitud_id = '<id de la petición HTTP>';     (opcional)
--     Si un valor es inválido se devuelve NULL (nunca se aborta una compra o un pago por esto);
--     la auditoría registra el motivo en `contexto_invalido`.
-- Resuelve actor, motivo e IP en una sola consulta de contexto.
-- Errores de conversión se clasifican; errores internos/de permisos se propagan.
CREATE FUNCTION public.fn_contexto_actor()
RETURNS TABLE(usuario_id bigint, motivo text, ip inet)
LANGUAGE plpgsql STABLE SET search_path = pg_catalog AS $$
DECLARE
    v_raw text := NULLIF(current_setting('app.usuario_id', true), '');
    v_origen text := NULLIF(current_setting('app.origen', true), '');
    v_ip_raw text := NULLIF(current_setting('app.ip_origen', true), '');
    v_id bigint;
BEGIN
    usuario_id := NULL;
    motivo := NULL;
    ip := NULL;

    IF v_raw IS NULL THEN
        -- Las tareas automáticas deben identificarse explícitamente como SISTEMA:<tarea>.
        IF v_origen IS NULL OR v_origen NOT LIKE 'SISTEMA:%' OR length(btrim(substr(v_origen, 9))) = 0 THEN
            motivo := 'AUSENTE';
        END IF;
    ELSE
        BEGIN
            v_id := v_raw::bigint;
        EXCEPTION
            WHEN invalid_text_representation OR numeric_value_out_of_range THEN
                motivo := 'FORMATO_INVALIDO';
        END;

        IF motivo IS NULL THEN
            SELECT u.id INTO usuario_id
            FROM auth.usuarios AS u
            WHERE u.id = v_id;

            IF usuario_id IS NULL THEN
                motivo := 'ACTOR_DESCONOCIDO';
            END IF;
        END IF;
    END IF;

    IF v_ip_raw IS NOT NULL THEN
        BEGIN
            ip := v_ip_raw::inet;
        EXCEPTION WHEN invalid_text_representation THEN
            ip := NULL;
            motivo := 'FORMATO_INVALIDO';
        END;
    END IF;

    RETURN NEXT;
END $$;

-- Funciones de compatibilidad para triggers que solo necesitan un campo.
-- La auditoría genérica usa fn_contexto_actor() directamente para no consultar dos veces.
CREATE FUNCTION public.fn_actor_id() RETURNS bigint
LANGUAGE sql STABLE SET search_path = pg_catalog AS $$
    SELECT c.usuario_id FROM public.fn_contexto_actor() AS c
$$;

CREATE FUNCTION public.fn_motivo_contexto() RETURNS text
LANGUAGE sql STABLE SET search_path = pg_catalog AS $$
    SELECT c.motivo FROM public.fn_contexto_actor() AS c
$$;

CREATE FUNCTION public.fn_actor_ip() RETURNS inet
LANGUAGE sql STABLE SET search_path = pg_catalog AS $$
    SELECT c.ip FROM public.fn_contexto_actor() AS c
$$;

-- 1.2b Auditoría genérica. Escribe en auditoria.auditoria_<schema_de_la_tabla>.
--     Argumento opcional: columnas de la PK separadas por coma (por defecto 'id').
--     SECURITY DEFINER: solo este trigger puede escribir en las auditorías; el rol de la
--     aplicación NO tiene INSERT sobre ellas (ver 12_seguridad_y_consultas.sql).
--     Campos sensibles (hash, token): nunca se guardan, pero si cambian queda constancia
--     de QUÉ campo cambió (_campos_sensibles_modificados), sin su valor.
CREATE FUNCTION public.fn_auditar() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
DECLARE
    v_sensibles text[] := ARRAY['password_hash', 'codigo_hash', 'token'];
    v_pk        text[] := string_to_array(COALESCE(TG_ARGV[0], 'id'), ',');
    v_old       jsonb;
    v_new       jsonb;
    v_ref       jsonb;
    v_registro  text;
    v_cambiados text[];
    v_pedido    bigint;
    v_usuario   bigint;
    v_ip        inet;
    v_motivo    text;
    v_contexto  record;
BEGIN
    IF TG_OP IN ('UPDATE', 'DELETE') THEN v_old := to_jsonb(OLD); END IF;
    IF TG_OP IN ('INSERT', 'UPDATE') THEN v_new := to_jsonb(NEW); END IF;
    v_ref := COALESCE(v_new, v_old);

    -- ¿Cambió algún campo sensible? (se compara ANTES de quitarlos)
    IF TG_OP = 'UPDATE' THEN
        SELECT array_agg(k ORDER BY k) INTO v_cambiados
        FROM unnest(v_sensibles) AS k
        WHERE (v_old -> k) IS DISTINCT FROM (v_new -> k);
    END IF;

    v_old := v_old - v_sensibles;
    v_new := v_new - v_sensibles;

    -- Un UPDATE sin cambios de negocio ni de campos sensibles no genera ruido.
    IF TG_OP = 'UPDATE' AND v_cambiados IS NULL
       AND (v_old - 'actualizado_en') = (v_new - 'actualizado_en') THEN
        RETURN NULL;
    END IF;
    IF v_cambiados IS NOT NULL THEN
        v_new := v_new || jsonb_build_object('_campos_sensibles_modificados', to_jsonb(v_cambiados));
    END IF;

    SELECT string_agg(v_ref ->> k, '-') INTO v_registro FROM unnest(v_pk) AS k;

    -- Correlación: pedido al que pertenece el cambio (permite seguir un pedido completo).
    v_pedido := CASE
        WHEN TG_TABLE_SCHEMA = 'ventas' AND TG_TABLE_NAME = 'pedidos' THEN (v_ref ->> 'id')::bigint
        WHEN NULLIF(v_ref ->> 'pedido_id', '') IS NOT NULL THEN (v_ref ->> 'pedido_id')::bigint
        WHEN NULLIF(v_ref ->> 'pago_id', '') IS NOT NULL
            THEN (SELECT p.pedido_id FROM pagos.pagos p WHERE p.id = (v_ref ->> 'pago_id')::bigint)
    END;

    SELECT * INTO v_contexto FROM public.fn_contexto_actor();
    v_usuario := v_contexto.usuario_id;
    v_ip := v_contexto.ip;
    v_motivo := v_contexto.motivo;

    EXECUTE format(
        'INSERT INTO auditoria.%I
             (tabla, operacion, registro_id, pedido_id, usuario_id, origen, solicitud_id,
              datos_anteriores, datos_nuevos, ip_origen, contexto_invalido)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)', 'auditoria_' || TG_TABLE_SCHEMA)
    USING TG_TABLE_NAME, TG_OP, v_registro, v_pedido, v_usuario,
          left(NULLIF(current_setting('app.origen', true), ''), 60),
          left(NULLIF(current_setting('app.solicitud_id', true), ''), 64),
          v_old, v_new, v_ip, v_motivo;
    RETURN NULL;   -- trigger AFTER: el valor de retorno se ignora
END $$;

-- 1.3 Las tablas de auditoría son solo de inserción (inmutables).
CREATE FUNCTION public.fn_auditoria_inmutable() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
    RAISE EXCEPTION 'La tabla %.% es de solo inserción', TG_TABLE_SCHEMA, TG_TABLE_NAME;
END $$;


-- ============================================================

-- 1.4 TRUNCATE en tablas de NEGOCIO: bloqueado por defecto. Un vaciado administrativo
--     requiere declararlo en la sesión (SET app.permitir_truncate = 'on') y queda registrado
--     en la auditoría del schema con operacion = 'TRUNCATE'. (El rol de la aplicación,
--     además, no tiene el privilegio TRUNCATE.)
CREATE FUNCTION public.fn_truncate_negocio() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
DECLARE
    v_contexto record;
BEGIN
    IF COALESCE(current_setting('app.permitir_truncate', true), '') <> 'on' THEN
        RAISE EXCEPTION 'TRUNCATE no permitido en %.%: use el procedimiento administrativo',
            TG_TABLE_SCHEMA, TG_TABLE_NAME USING ERRCODE = 'insufficient_privilege';
    END IF;

    SELECT * INTO v_contexto FROM public.fn_contexto_actor();
    EXECUTE format(
        'INSERT INTO auditoria.%I
             (tabla, operacion, usuario_id, origen, solicitud_id, ip_origen, contexto_invalido)
         VALUES ($1, ''TRUNCATE'', $2, $3, $4, $5, $6)', 'auditoria_' || TG_TABLE_SCHEMA)
    USING TG_TABLE_NAME, v_contexto.usuario_id,
          left(COALESCE(NULLIF(current_setting('app.origen', true), ''), 'ADMIN-TRUNCATE'), 60),
          left(NULLIF(current_setting('app.solicitud_id', true), ''), 64),
          v_contexto.ip, v_contexto.motivo;
    RETURN NULL;
END $$;
