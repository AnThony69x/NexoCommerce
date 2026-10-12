-- 11. TRIGGERS DE actualizado_en
--     Recorre todas las tablas de negocio que tengan esa columna.
-- ============================================================
DO $$
DECLARE r record;
BEGIN
    FOR r IN
        SELECT table_schema, table_name
        FROM information_schema.columns
        WHERE column_name = 'actualizado_en'
          AND table_schema IN ('auth','media','tienda','catalogo','publicaciones',
                               'ventas','produccion','pagos','notificaciones')
    LOOP
        EXECUTE format(
            'CREATE TRIGGER trg_actualizado_en BEFORE UPDATE ON %I.%I
             FOR EACH ROW EXECUTE FUNCTION public.fn_actualizado_en()',
            r.table_schema, r.table_name);
    END LOOP;
END $$;

-- ============================================================
-- 11b. TRIGGERS DE AUDITORÍA (cada tabla escribe en la auditoría de SU schema)
--      Selectivo: identidad, catálogo, stock, pedidos, pagos y configuración.
--      Los demás dominios no generan registros automáticos de auditoría.
-- ============================================================
CREATE TRIGGER trg_auditar AFTER INSERT OR UPDATE OR DELETE ON auth.roles
    FOR EACH ROW EXECUTE FUNCTION public.fn_auditar();
CREATE TRIGGER trg_auditar AFTER INSERT OR UPDATE OR DELETE ON auth.usuarios
    FOR EACH ROW EXECUTE FUNCTION public.fn_auditar();
CREATE TRIGGER trg_auditar AFTER INSERT OR UPDATE OR DELETE ON tienda.configuracion_tienda
    FOR EACH ROW EXECUTE FUNCTION public.fn_auditar();
CREATE TRIGGER trg_auditar AFTER INSERT OR UPDATE OR DELETE ON catalogo.categorias
    FOR EACH ROW EXECUTE FUNCTION public.fn_auditar();
CREATE TRIGGER trg_auditar AFTER INSERT OR UPDATE OR DELETE ON catalogo.productos
    FOR EACH ROW EXECUTE FUNCTION public.fn_auditar();
CREATE TRIGGER trg_auditar AFTER INSERT OR UPDATE OR DELETE ON catalogo.tortas
    FOR EACH ROW EXECUTE FUNCTION public.fn_auditar('producto_id');
CREATE TRIGGER trg_auditar AFTER INSERT OR UPDATE OR DELETE ON catalogo.detalles
    FOR EACH ROW EXECUTE FUNCTION public.fn_auditar('producto_id');
CREATE TRIGGER trg_auditar AFTER INSERT OR UPDATE OR DELETE ON catalogo.sublimaciones
    FOR EACH ROW EXECUTE FUNCTION public.fn_auditar('producto_id');
CREATE TRIGGER trg_auditar AFTER INSERT OR UPDATE OR DELETE ON catalogo.disenos_torta
    FOR EACH ROW EXECUTE FUNCTION public.fn_auditar();
CREATE TRIGGER trg_auditar AFTER INSERT OR UPDATE OR DELETE ON catalogo.plantillas_diseno
    FOR EACH ROW EXECUTE FUNCTION public.fn_auditar();
CREATE TRIGGER trg_auditar AFTER INSERT OR UPDATE OR DELETE ON ventas.pedidos
    FOR EACH ROW EXECUTE FUNCTION public.fn_auditar();
CREATE TRIGGER trg_auditar AFTER INSERT OR UPDATE OR DELETE ON ventas.detalles_pedido
    FOR EACH ROW EXECUTE FUNCTION public.fn_auditar();
CREATE TRIGGER trg_auditar AFTER INSERT OR UPDATE OR DELETE ON produccion.configuracion_produccion
    FOR EACH ROW EXECUTE FUNCTION public.fn_auditar();
CREATE TRIGGER trg_auditar AFTER INSERT OR UPDATE OR DELETE ON pagos.pagos
    FOR EACH ROW EXECUTE FUNCTION public.fn_auditar();
CREATE TRIGGER trg_auditar AFTER INSERT OR UPDATE OR DELETE ON pagos.comprobantes_pago
    FOR EACH ROW EXECUTE FUNCTION public.fn_auditar();


-- ============================================================

-- Serializa cambios de jerarquía para validar ciclos entre categorías.
CREATE FUNCTION catalogo.fn_bloquear_jerarquia() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
    PERFORM pg_advisory_xact_lock(741902);
    RETURN NULL;
END $$;
CREATE TRIGGER trg_categorias_bloquear BEFORE INSERT OR UPDATE OR DELETE ON catalogo.categorias
    FOR EACH STATEMENT EXECUTE FUNCTION catalogo.fn_bloquear_jerarquia();

CREATE FUNCTION catalogo.fn_validar_jerarquia() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
    IF EXISTS (
        WITH RECURSIVE ancestros AS (
            SELECT id, categoria_padre_id FROM catalogo.categorias WHERE id = NEW.categoria_padre_id
            UNION
            SELECT c.id, c.categoria_padre_id FROM catalogo.categorias c
              JOIN ancestros a ON c.id = a.categoria_padre_id
        ) SELECT 1 FROM ancestros WHERE id = NEW.id
    ) THEN
        RAISE EXCEPTION 'La jerarquía de categorías no puede contener ciclos' USING ERRCODE = 'check_violation';
    END IF;
    RETURN NULL;
END $$;
CREATE CONSTRAINT TRIGGER trg_categorias_validar AFTER INSERT OR UPDATE ON catalogo.categorias
    DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION catalogo.fn_validar_jerarquia();

-- TRUNCATE requiere un trigger por sentencia; UPDATE/DELETE ya están protegidos.
DO $$
DECLARE s TEXT;
BEGIN
    FOREACH s IN ARRAY ARRAY['auth','media','tienda','catalogo','publicaciones',
                            'ventas','produccion','pagos','notificaciones'] LOOP
        EXECUTE format('CREATE TRIGGER trg_auditoria_no_truncate BEFORE TRUNCATE ON %I.auditoria
                        FOR EACH STATEMENT EXECUTE FUNCTION public.fn_auditoria_inmutable()', s);
        EXECUTE format('REVOKE UPDATE, DELETE, TRUNCATE ON %I.auditoria FROM PUBLIC', s);
    END LOOP;
END $$;
-- Infraestructura debe conceder al rol del backend solo INSERT/SELECT en auditoría;
-- dicho rol no debe ser propietario de tablas ni tener permisos para desactivar triggers.
-- Coordinación backend: diseños usan producto_id/tipo_producto; publicaciones usa
-- publicada_en y pierde activo; pedidos usa costo_envio y estado_pago APROBADO.
-- La autorización de diseños y los totales de líneas siguen siendo responsabilidad del API.

-- Los metadatos técnicos identifican el archivo físico: reemplazar el archivo
-- creando otra fila. Nombre, descripción y activo sí pueden editarse.
CREATE FUNCTION media.fn_metadatos_inmutables() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
    IF ROW(NEW.ruta_archivo, NEW.tipo_mime, NEW.tamano_bytes, NEW.ancho, NEW.alto, NEW.checksum_sha256, NEW.modulo)
       IS DISTINCT FROM
       ROW(OLD.ruta_archivo, OLD.tipo_mime, OLD.tamano_bytes, OLD.ancho, OLD.alto, OLD.checksum_sha256, OLD.modulo) THEN
        RAISE EXCEPTION 'Para reemplazar un archivo cree un nuevo registro multimedia'
            USING ERRCODE = 'check_violation';
    END IF;
    RETURN NEW;
END $$;
CREATE TRIGGER trg_metadatos_inmutables BEFORE UPDATE ON media.multimedia
    FOR EACH ROW EXECUTE FUNCTION media.fn_metadatos_inmutables();

CREATE FUNCTION media.fn_solo_imagen() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE v_id BIGINT;
BEGIN
    v_id := (to_jsonb(NEW)->>TG_ARGV[0])::BIGINT;
    IF v_id IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM media.multimedia WHERE id = v_id AND tipo_mime LIKE 'image/%'
    ) THEN
        RAISE EXCEPTION 'Esta relación requiere un archivo de imagen'
            USING ERRCODE = 'check_violation';
    END IF;
    RETURN NEW;
END $$;
CREATE TRIGGER trg_solo_imagen BEFORE INSERT OR UPDATE ON catalogo.producto_multimedia
    FOR EACH ROW EXECUTE FUNCTION media.fn_solo_imagen('multimedia_id');
CREATE TRIGGER trg_solo_imagen BEFORE INSERT OR UPDATE ON publicaciones.publicacion_multimedia
    FOR EACH ROW EXECUTE FUNCTION media.fn_solo_imagen('multimedia_id');
CREATE TRIGGER trg_solo_imagen BEFORE INSERT OR UPDATE ON catalogo.disenos_torta
    FOR EACH ROW EXECUTE FUNCTION media.fn_solo_imagen('multimedia_id');
CREATE TRIGGER trg_solo_imagen BEFORE INSERT OR UPDATE ON catalogo.plantillas_diseno
    FOR EACH ROW EXECUTE FUNCTION media.fn_solo_imagen('multimedia_id');
CREATE TRIGGER trg_solo_imagen BEFORE INSERT OR UPDATE ON catalogo.categorias
    FOR EACH ROW EXECUTE FUNCTION media.fn_solo_imagen('imagen_id');
CREATE TRIGGER trg_logo_imagen BEFORE INSERT OR UPDATE ON tienda.configuracion_tienda
    FOR EACH ROW EXECUTE FUNCTION media.fn_solo_imagen('logo_id');
CREATE TRIGGER trg_favicon_imagen BEFORE INSERT OR UPDATE ON tienda.configuracion_tienda
    FOR EACH ROW EXECUTE FUNCTION media.fn_solo_imagen('favicon_id');

-- También valida escrituras directas: el estado siempre deriva de los pagos.
CREATE FUNCTION pagos.fn_validar_estado_derivado() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE v_suma NUMERIC; v_esperado TEXT;
BEGIN
    SELECT COALESCE(sum(monto) FILTER (WHERE estado = 'APROBADO'), 0),
           CASE WHEN bool_or(estado = 'PENDIENTE') THEN 'PENDIENTE'
                WHEN bool_or(estado = 'REEMBOLSADO') THEN 'REEMBOLSADO'
                WHEN bool_or(estado = 'RECHAZADO') THEN 'RECHAZADO'
                ELSE 'PENDIENTE' END
      INTO v_suma, v_esperado FROM pagos.pagos WHERE pedido_id = NEW.id;
    IF v_suma > 0 THEN
        v_esperado := CASE WHEN v_suma >= NEW.total THEN 'APROBADO' ELSE 'PENDIENTE' END;
    END IF;
    IF NEW.estado_pago IS DISTINCT FROM v_esperado THEN
        RAISE EXCEPTION 'El estado de pago debe corresponder a los pagos registrados'
            USING ERRCODE = 'check_violation';
    END IF;
    RETURN NEW;
END $$;
CREATE TRIGGER trg_estado_pago_derivado BEFORE UPDATE OF estado_pago ON ventas.pedidos
    FOR EACH ROW EXECUTE FUNCTION pagos.fn_validar_estado_derivado();
