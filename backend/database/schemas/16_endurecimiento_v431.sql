-- NexoCommerce v4.3.1: controles adicionales. SOLO instalación limpia.
-- Sin funciones de retiro ni eliminación. Ejecución con propietario de migraciones.

-- El lote siempre usa el instante fijado por su ejecución, no fechas libres.
CREATE OR REPLACE FUNCTION auditoria_control.fn_controlar_lote() RETURNS trigger
LANGUAGE plpgsql SET search_path=pg_catalog AS $$
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
    SELECT count(*),min(a.creado_en),max(a.creado_en) INTO n,mn,mx
    FROM auditoria_control.lote_registros lr
    JOIN public.v_auditoria_global a ON a.schema_origen=OLD.dominio AND a.id=lr.registro_id
    WHERE lr.lote_id=OLD.id;
    IF n=0 THEN RAISE EXCEPTION 'Lote vacío'; END IF;
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
    -- Bloqueo conservador: cualquier suspensión activa relacionada impide verificar.
    -- La comprobación completa de concurrencia se hará en el orquestador.
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

-- El miembro debe existir, ser elegible y pertenecer a lote seleccionado.
-- Un bloqueo sobre el lote serializa cambios de estado con cambios de miembros.
CREATE OR REPLACE FUNCTION auditoria_control.fn_no_duplicar_lote_registro() RETURNS trigger
LANGUAGE plpgsql SET search_path=pg_catalog AS $$
DECLARE l record; a record;
BEGIN
 IF TG_OP='UPDATE' AND NEW.lote_id IS DISTINCT FROM OLD.lote_id THEN
  RAISE EXCEPTION 'No se puede trasladar un miembro entre lotes';
 END IF;
 SELECT * INTO l FROM auditoria_control.lotes
 WHERE id=CASE WHEN TG_OP='DELETE' THEN OLD.lote_id ELSE NEW.lote_id END FOR UPDATE;
 IF NOT FOUND OR l.estado<>'seleccionado' THEN
  RAISE EXCEPTION 'Miembros editables solo durante selección';
 END IF;
 IF TG_OP='DELETE' THEN RETURN OLD; END IF;
 SELECT * INTO a FROM public.v_auditoria_global
 WHERE schema_origen=l.dominio AND id=NEW.registro_id;
 IF NOT FOUND OR a.creado_en >= l.corte_activo THEN
  RAISE EXCEPTION 'Evento inexistente o aún dentro de retención activa';
 END IF;
 PERFORM 1 FROM auditoria_control.politicas WHERE dominio=l.dominio FOR UPDATE;
 IF EXISTS (SELECT 1 FROM auditoria_control.lote_registros lr
   JOIN auditoria_control.lotes ot ON ot.id=lr.lote_id
   WHERE ot.dominio=l.dominio AND lr.registro_id=NEW.registro_id
     AND lr.lote_id<>NEW.lote_id AND ot.estado<>'fallido')
 THEN RAISE EXCEPTION 'Evento reservado por otro lote activo'; END IF;
 IF EXISTS (SELECT 1 FROM auditoria_control.suspensiones s
   WHERE s.liberado_en IS NULL AND (s.dominio IS NULL OR s.dominio=l.dominio)
     AND ((s.registro_id IS NOT NULL AND s.registro_id=a.id) OR
          (s.pedido_id IS NOT NULL AND s.pedido_id=a.pedido_id) OR
          (s.solicitud_id IS NOT NULL AND s.solicitud_id=a.solicitud_id) OR
          (s.id_transaccion IS NOT NULL AND s.id_transaccion=a.id_transaccion)))
 THEN RAISE EXCEPTION 'Evento suspendido'; END IF;
 RETURN NEW;
END $$;
DROP TRIGGER trg_no_duplicar_lote_registro ON auditoria_control.lote_registros;
CREATE TRIGGER trg_control_miembros BEFORE INSERT OR UPDATE OR DELETE
ON auditoria_control.lote_registros FOR EACH ROW
EXECUTE FUNCTION auditoria_control.fn_no_duplicar_lote_registro();

-- No permitir publicar referencias a un lote equivocado o sin verificar.
 -- La PK (lote_id,registro_id) ya satisface la FK compuesta.
ALTER TABLE auditoria_control.catalogo_eventos
 ADD CONSTRAINT fk_catalogo_lote_dominio FOREIGN KEY(lote_id,dominio)
 REFERENCES auditoria_control.lotes(id,dominio);
ALTER TABLE auditoria_control.catalogo_eventos
 ADD CONSTRAINT fk_catalogo_miembro FOREIGN KEY(lote_id,evento_id)
 REFERENCES auditoria_control.lote_registros(lote_id,registro_id);
CREATE FUNCTION auditoria_control.fn_catalogo_verificado() RETURNS trigger
LANGUAGE plpgsql SET search_path=pg_catalog AS $$
DECLARE l record; a record;
BEGIN
 SELECT * INTO l FROM auditoria_control.lotes WHERE id=NEW.lote_id FOR SHARE;
 IF NOT FOUND OR l.estado<>'verificado' OR l.dominio<>NEW.dominio THEN
  RAISE EXCEPTION 'Catálogo requiere lote verificado del mismo dominio'; END IF;
 SELECT * INTO a FROM public.v_auditoria_global
 WHERE schema_origen=NEW.dominio AND id=NEW.evento_id;
 IF NOT FOUND OR NEW.tabla_origen IS DISTINCT FROM a.tabla
    OR NEW.registro_negocio_id IS DISTINCT FROM a.registro_id
    OR NEW.pedido_id IS DISTINCT FROM a.pedido_id
    OR NEW.creado_en IS DISTINCT FROM a.creado_en THEN
  RAISE EXCEPTION 'Metadatos de catálogo no coinciden con evento'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER trg_catalogo_verificado BEFORE INSERT OR UPDATE
ON auditoria_control.catalogo_eventos FOR EACH ROW
EXECUTE FUNCTION auditoria_control.fn_catalogo_verificado();

-- Las referencias publicadas no pueden alterarse o eliminarse accidentalmente.
CREATE FUNCTION auditoria_control.fn_catalogo_no_borrar() RETURNS trigger
LANGUAGE plpgsql SET search_path=pg_catalog AS $$
BEGIN RAISE EXCEPTION 'Catálogo publicado inmutable'; END $$;
CREATE TRIGGER trg_catalogo_no_delete BEFORE DELETE ON auditoria_control.catalogo_eventos
FOR EACH ROW EXECUTE FUNCTION auditoria_control.fn_catalogo_no_borrar();

-- Nota de seguridad: NO se concede escritura de control a roles de aplicación.
-- Un administrador de BD propietario sigue siendo privilegiado; evidencias externas
-- y operaciones de exportación quedan fuera de este script.
