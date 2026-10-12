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
--    Un solo código, pero cada schema guarda su propia auditoría.
-- ============================================================

-- 1.1 Mantiene `actualizado_en` al día en cualquier UPDATE.
CREATE FUNCTION public.fn_actualizado_en() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
    NEW.actualizado_en := now();
    RETURN NEW;
END $$;

-- 1.2 Auditoría genérica. Escribe en <schema_de_la_tabla>.auditoria.
--     Argumento opcional: columnas de la PK separadas por coma (por defecto 'id').
--     El backend informa quién actúa con:
--         SET LOCAL app.usuario_id = '<id>';  SET LOCAL app.ip_origen = '<ip>';
--     (SET LOCAL dura solo la transacción, seguro con dos instancias del backend).
CREATE FUNCTION public.fn_auditar() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE
    v_sensibles text[] := ARRAY['password_hash', 'codigo_hash', 'token'];  -- nunca se auditan
    v_pk        text[] := string_to_array(COALESCE(TG_ARGV[0], 'id'), ',');
    v_old       jsonb;
    v_new       jsonb;
    v_registro  text;
BEGIN
    IF TG_OP IN ('UPDATE', 'DELETE') THEN v_old := to_jsonb(OLD) - v_sensibles; END IF;
    IF TG_OP IN ('INSERT', 'UPDATE') THEN v_new := to_jsonb(NEW) - v_sensibles; END IF;

    -- Un UPDATE que no cambió nada no genera ruido.
    IF TG_OP = 'UPDATE' AND (v_old - 'actualizado_en') = (v_new - 'actualizado_en') THEN RETURN NULL; END IF;

    SELECT string_agg(COALESCE(v_new ->> k, v_old ->> k), '-') INTO v_registro
    FROM unnest(v_pk) AS k;

    EXECUTE format(
        'INSERT INTO %I.auditoria
             (tabla, operacion, registro_id, usuario_id, datos_anteriores, datos_nuevos, ip_origen)
         VALUES ($1, $2, $3, $4, $5, $6, $7)', TG_TABLE_SCHEMA)
    USING TG_TABLE_NAME, TG_OP, v_registro,
          NULLIF(current_setting('app.usuario_id', true), '')::bigint,
          v_old, v_new,
          NULLIF(current_setting('app.ip_origen', true), '')::inet;
    RETURN NULL;   -- trigger AFTER: el valor de retorno se ignora
END $$;

-- 1.3 Las tablas de auditoría son solo de inserción (inmutables).
CREATE FUNCTION public.fn_auditoria_inmutable() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
    RAISE EXCEPTION 'La tabla %.% es de solo inserción', TG_TABLE_SCHEMA, TG_TABLE_NAME;
END $$;


-- ============================================================
