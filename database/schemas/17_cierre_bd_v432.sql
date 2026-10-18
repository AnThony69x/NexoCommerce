-- v4.3.2: cierre de garantías exclusivamente PostgreSQL. Instalación LIMPIA.
-- No habilita retiro ni purga. No simula verificación externa.

-- Fechas de ejecución inmutables, incluso si se crean lotes posteriormente.
CREATE FUNCTION auditoria_control.fn_ejecucion_identidad_inmutable() RETURNS trigger
LANGUAGE plpgsql SET search_path=pg_catalog AS $$
BEGIN
 IF ROW(NEW.id,NEW.rol_conexion,NEW.corte_fijado_en,NEW.inicio)
    IS DISTINCT FROM ROW(OLD.id,OLD.rol_conexion,OLD.corte_fijado_en,OLD.inicio) THEN
  RAISE EXCEPTION USING ERRCODE='23514', MESSAGE='Identidad y corte de ejecución inmutables';
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER trg_ejecucion_identidad_inmutable BEFORE UPDATE
ON auditoria_control.ejecuciones FOR EACH ROW
EXECUTE FUNCTION auditoria_control.fn_ejecucion_identidad_inmutable();

-- La aritmética de meses en timestamptz depende de TimeZone: fijamos UTC
-- en la función que calcula AMBOS cortes desde ejecuciones.corte_fijado_en.
ALTER FUNCTION auditoria_control.fn_controlar_lote() SET TimeZone='UTC';

-- El catálogo publicado no permite redirigir una referencia, aunque los nuevos
-- datos correspondan a otro evento real. El trigger previo valida INSERT.
CREATE FUNCTION auditoria_control.fn_catalogo_solo_insert() RETURNS trigger
LANGUAGE plpgsql SET search_path=pg_catalog AS $$
BEGIN
 RAISE EXCEPTION USING ERRCODE='23514', MESSAGE='Catálogo publicado inmutable';
END $$;
CREATE TRIGGER trg_catalogo_no_update BEFORE UPDATE
ON auditoria_control.catalogo_eventos FOR EACH ROW
EXECUTE FUNCTION auditoria_control.fn_catalogo_solo_insert();
CREATE TRIGGER trg_catalogo_no_truncate BEFORE TRUNCATE
ON auditoria_control.catalogo_eventos FOR EACH STATEMENT
EXECUTE FUNCTION auditoria_control.fn_catalogo_solo_insert();

-- Protege la selección frente a TRUNCATE, que no dispara triggers ROW.
CREATE FUNCTION auditoria_control.fn_control_no_truncate() RETURNS trigger
LANGUAGE plpgsql SET search_path=pg_catalog AS $$
BEGIN
 RAISE EXCEPTION USING ERRCODE='23514', MESSAGE='TRUNCATE prohibido en control de archivado';
END $$;
CREATE TRIGGER trg_miembros_no_truncate BEFORE TRUNCATE
ON auditoria_control.lote_registros FOR EACH STATEMENT
EXECUTE FUNCTION auditoria_control.fn_control_no_truncate();
CREATE TRIGGER trg_lotes_no_truncate BEFORE TRUNCATE
ON auditoria_control.lotes FOR EACH STATEMENT
EXECUTE FUNCTION auditoria_control.fn_control_no_truncate();
CREATE TRIGGER trg_manifiestos_no_truncate BEFORE TRUNCATE
ON auditoria_control.manifiestos FOR EACH STATEMENT
EXECUTE FUNCTION auditoria_control.fn_control_no_truncate();

-- Serializa la creación/liberación de suspensiones con selección y verificación.
-- La política del dominio es el candado compartido. Suspensión global bloquea
-- todas las políticas en orden estable. Solo cubre operaciones bajo este protocolo.
CREATE FUNCTION auditoria_control.fn_suspension_serializada() RETURNS trigger
LANGUAGE plpgsql SET search_path=pg_catalog AS $$
DECLARE d text;
BEGIN
 IF TG_OP='UPDATE' THEN
  IF ROW(NEW.dominio,NEW.registro_id,NEW.pedido_id,NEW.solicitud_id,
         NEW.id_transaccion,NEW.motivo,NEW.responsable,NEW.creado_en)
    IS DISTINCT FROM ROW(OLD.dominio,OLD.registro_id,OLD.pedido_id,OLD.solicitud_id,
         OLD.id_transaccion,OLD.motivo,OLD.responsable,OLD.creado_en) THEN
   RAISE EXCEPTION USING ERRCODE='23514', MESSAGE='Identidad de suspensión inmutable';
  END IF;
  IF OLD.liberado_en IS NOT NULL AND
     ROW(NEW.liberado_en,NEW.liberado_por) IS DISTINCT FROM
     ROW(OLD.liberado_en,OLD.liberado_por) THEN
   RAISE EXCEPTION USING ERRCODE='23514', MESSAGE='Suspensión ya liberada';
  END IF;
 END IF;
 IF TG_OP='DELETE' THEN
  RAISE EXCEPTION USING ERRCODE='23514', MESSAGE='No se borran suspensiones';
 END IF;
 IF NEW.dominio IS NULL THEN
  FOR d IN SELECT dominio FROM auditoria_control.politicas ORDER BY dominio LOOP
   PERFORM 1 FROM auditoria_control.politicas WHERE dominio=d FOR UPDATE;
  END LOOP;
 ELSE
  PERFORM 1 FROM auditoria_control.politicas WHERE dominio=NEW.dominio FOR UPDATE;
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER trg_suspension_serializada BEFORE INSERT OR UPDATE OR DELETE
ON auditoria_control.suspensiones FOR EACH ROW
EXECUTE FUNCTION auditoria_control.fn_suspension_serializada();
CREATE TRIGGER trg_suspensiones_no_truncate BEFORE TRUNCATE
ON auditoria_control.suspensiones FOR EACH STATEMENT
EXECUTE FUNCTION auditoria_control.fn_control_no_truncate();

-- La verificación bloquea también el candado de política, y por tanto espera
-- suspensiones concurrentes antes de tomar una decisión.
CREATE OR REPLACE FUNCTION auditoria_control.fn_controlar_lote() RETURNS trigger
LANGUAGE plpgsql SET search_path=pg_catalog SET TimeZone='UTC' AS $$
DECLARE p record; e record; m record; n bigint; mn timestamptz; mx timestamptz;
BEGIN
 IF TG_OP='INSERT' THEN
  SELECT * INTO e FROM auditoria_control.ejecuciones WHERE id=NEW.ejecucion_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Ejecución inexistente'; END IF;
  SELECT * INTO p FROM auditoria_control.politicas WHERE dominio=NEW.dominio FOR SHARE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Política inexistente'; END IF;
  NEW.politica_version := p.version;
  NEW.meses_activos_aplicados := p.meses_activos;
  NEW.meses_totales_aplicados := p.meses_totales;
  NEW.corte_activo := e.corte_fijado_en - make_interval(months=>p.meses_activos);
  NEW.corte_total := e.corte_fijado_en - make_interval(months=>p.meses_totales);
  IF NEW.estado <> 'seleccionado' THEN RAISE EXCEPTION 'Estado inicial debe ser seleccionado'; END IF;
 ELSE
  IF ROW(NEW.ejecucion_id,NEW.dominio,NEW.corte_activo,NEW.corte_total,
         NEW.politica_version,NEW.meses_activos_aplicados,NEW.meses_totales_aplicados,NEW.creado_en)
    IS DISTINCT FROM ROW(OLD.ejecucion_id,OLD.dominio,OLD.corte_activo,OLD.corte_total,
         OLD.politica_version,OLD.meses_activos_aplicados,OLD.meses_totales_aplicados,OLD.creado_en)
  THEN RAISE EXCEPTION 'Datos y cortes del lote inmutables'; END IF;
  IF NEW.estado IS DISTINCT FROM OLD.estado THEN
   IF NOT ((OLD.estado='seleccionado' AND NEW.estado IN ('exportado','fallido')) OR
           (OLD.estado='exportado' AND NEW.estado IN ('verificado','fallido')))
   THEN RAISE EXCEPTION 'Transición no autorizada'; END IF;
   IF NEW.estado='verificado' THEN
    -- Serializar frente a suspensiones globales y de dominio.
    PERFORM 1 FROM auditoria_control.politicas WHERE dominio=OLD.dominio FOR UPDATE;
    SELECT count(*),min(a.creado_en),max(a.creado_en) INTO n,mn,mx
    FROM auditoria_control.lote_registros lr
    JOIN public.v_auditoria_global a ON a.schema_origen=OLD.dominio AND a.id=lr.registro_id
    WHERE lr.lote_id=OLD.id;
    IF n=0 THEN RAISE EXCEPTION USING ERRCODE='23514', MESSAGE='Lote vacío'; END IF;
    IF EXISTS (SELECT 1 FROM auditoria_control.lote_registros lr
       WHERE lr.lote_id=OLD.id AND NOT EXISTS
        (SELECT 1 FROM public.v_auditoria_global a
         WHERE a.schema_origen=OLD.dominio AND a.id=lr.registro_id AND a.creado_en < OLD.corte_activo))
    THEN RAISE EXCEPTION 'Miembro inexistente o fuera del corte'; END IF;
    SELECT * INTO m FROM auditoria_control.manifiestos WHERE lote_id=OLD.id;
    IF NOT FOUND OR m.cantidad<>n OR m.minimo_creado_en IS DISTINCT FROM mn
       OR m.maximo_creado_en IS DISTINCT FROM mx
       OR m.copia_independiente_verificada IS DISTINCT FROM true
       OR m.restauracion_verificada IS DISTINCT FROM true OR m.verificado_en IS NULL
    THEN RAISE EXCEPTION 'Manifiesto incompleto o inconsistente'; END IF;
    IF EXISTS (SELECT 1 FROM auditoria_control.lote_registros lr
      JOIN public.v_auditoria_global a ON a.schema_origen=OLD.dominio AND a.id=lr.registro_id
      JOIN auditoria_control.suspensiones s ON s.liberado_en IS NULL
        AND (s.dominio IS NULL OR s.dominio=OLD.dominio)
        AND ((s.registro_id IS NOT NULL AND s.registro_id=a.id) OR
             (s.pedido_id IS NOT NULL AND s.pedido_id=a.pedido_id) OR
             (s.solicitud_id IS NOT NULL AND s.solicitud_id=a.solicitud_id) OR
             (s.id_transaccion IS NOT NULL AND s.id_transaccion=a.id_transaccion))
      WHERE lr.lote_id=OLD.id)
    THEN RAISE EXCEPTION 'Lote con suspensión activa'; END IF;
   END IF;
  END IF;
 END IF;
 RETURN NEW;
END $$;

-- Los manifiestos de lotes verificados no se pueden truncar ni cambiar.
-- El UPDATE de lotes serializa cambios de miembros mediante el bloqueo de fila.
-- IMPORTANTE: la verificación de bytes, restauración y copia externa NO es
-- demostrable con booleanos; sigue siendo obligación del backend/infraestructura.
