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
-- 11b. TRIGGERS DE AUDITORÍA (destinos en auditoria.auditoria_<dominio>)
--      Cobertura (ver LEEME_AUDITORIA.md): identidad, OAuth, catálogo y galerías, archivos,
--      publicaciones, diseños del cliente, stock, pedidos, pagos y configuración.
--      Omitidas a propósito: carritos y detalles_carrito (alto volumen, datos temporales),
--      pedido_historial_estado (es historial inmutable) y, en notificaciones, solo se
--      auditan los borrados. Tokens: altas, bajas y cambios de permisos/vencimiento/identidad; se excluye last_used_at y nunca se guarda el secreto.
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
CREATE TRIGGER trg_auditar AFTER INSERT OR UPDATE OR DELETE ON auth.cuentas_oauth
    FOR EACH ROW EXECUTE FUNCTION public.fn_auditar();
CREATE TRIGGER trg_auditar AFTER INSERT OR UPDATE ON auth.verificaciones_correo
    FOR EACH ROW EXECUTE FUNCTION public.fn_auditar();
CREATE TRIGGER trg_auditar AFTER INSERT OR DELETE OR UPDATE OF abilities, expires_at, tokenable_id, tokenable_type, token ON auth.personal_access_tokens
    FOR EACH ROW EXECUTE FUNCTION public.fn_auditar();
CREATE TRIGGER trg_auditar AFTER INSERT OR UPDATE OR DELETE ON media.multimedia
    FOR EACH ROW EXECUTE FUNCTION public.fn_auditar();
CREATE TRIGGER trg_auditar AFTER INSERT OR UPDATE OR DELETE ON catalogo.producto_multimedia
    FOR EACH ROW EXECUTE FUNCTION public.fn_auditar('producto_id,multimedia_id');
CREATE TRIGGER trg_auditar AFTER INSERT OR UPDATE OR DELETE ON publicaciones.publicaciones
    FOR EACH ROW EXECUTE FUNCTION public.fn_auditar();
CREATE TRIGGER trg_auditar AFTER INSERT OR UPDATE OR DELETE ON publicaciones.publicacion_multimedia
    FOR EACH ROW EXECUTE FUNCTION public.fn_auditar('publicacion_id,multimedia_id');
CREATE TRIGGER trg_auditar AFTER INSERT OR UPDATE OR DELETE ON ventas.disenos_personalizados
    FOR EACH ROW EXECUTE FUNCTION public.fn_auditar();
CREATE TRIGGER trg_auditar AFTER DELETE ON notificaciones.notificaciones
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

-- TRUNCATE en tablas de NEGOCIO: bloqueado salvo procedimiento administrativo declarado
-- (ver public.fn_truncate_negocio). Las auditorías y el historial lo bloquean siempre.
DO $$
DECLARE r record;
BEGIN
    FOR r IN
        SELECT table_schema, table_name FROM information_schema.tables
        WHERE table_type = 'BASE TABLE'
          AND table_schema IN ('auth','media','tienda','catalogo','publicaciones',
                               'ventas','produccion','pagos','notificaciones')
          AND table_name NOT IN ('auditoria', 'pedido_historial_estado')
    LOOP
        EXECUTE format('CREATE TRIGGER trg_no_truncate_negocio BEFORE TRUNCATE ON %I.%I
                        FOR EACH STATEMENT EXECUTE FUNCTION public.fn_truncate_negocio()',
                       r.table_schema, r.table_name);
    END LOOP;
END $$;

-- Los permisos (rol de la aplicación sin INSERT en auditorías, sin TRUNCATE y sin ser
-- propietario de tablas) están en 12_seguridad_y_consultas.sql.
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
