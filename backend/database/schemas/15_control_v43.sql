-- NexoCommerce v4.3: infraestructura adicional para una instalación NUEVA.
-- No implementa exportación, borrado, ni tareas automáticas.

-- Historial de versiones: la tabla politicas conserva la versión vigente por dominio
-- para mantener sus claves foráneas existentes.
CREATE TABLE auditoria_control.politicas_historial (
 dominio text NOT NULL REFERENCES auditoria_control.politicas(dominio),
 version text NOT NULL,
 meses_activos integer NOT NULL CHECK (meses_activos > 0),
 meses_totales integer NOT NULL CHECK (meses_totales >= meses_activos),
 aprobada_en timestamptz NOT NULL,
 registrada_en timestamptz NOT NULL DEFAULT clock_timestamp(),
 PRIMARY KEY (dominio, version)
);
INSERT INTO auditoria_control.politicas_historial
(dominio,version,meses_activos,meses_totales,aprobada_en)
SELECT dominio,version,meses_activos,meses_totales,aprobada_en
FROM auditoria_control.politicas;

-- Impide reescribir una versión ya publicada y cambiar políticas sin preservar
-- la versión anterior. Una nueva versión debe usar un identificador distinto.
CREATE FUNCTION auditoria_control.fn_versionar_politica() RETURNS trigger
LANGUAGE plpgsql SET search_path=pg_catalog AS $$
BEGIN
 IF TG_OP='DELETE' THEN
  RAISE EXCEPTION 'No se permite borrar políticas vigentes';
 END IF;
 IF NEW.dominio <> OLD.dominio THEN
  RAISE EXCEPTION 'No se permite cambiar el dominio de una política';
 END IF;
 IF NEW.version = OLD.version THEN
  IF ROW(NEW.meses_activos,NEW.meses_totales,NEW.aprobada_en)
     IS DISTINCT FROM ROW(OLD.meses_activos,OLD.meses_totales,OLD.aprobada_en) THEN
   RAISE EXCEPTION 'Para modificar una política se requiere una nueva versión';
  END IF;
 ELSE
  IF EXISTS (SELECT 1 FROM auditoria_control.politicas_historial h
             WHERE h.dominio=NEW.dominio AND h.version=NEW.version) THEN
   RAISE EXCEPTION 'La versión ya existe para este dominio';
  END IF;
  INSERT INTO auditoria_control.politicas_historial
   (dominio,version,meses_activos,meses_totales,aprobada_en)
  VALUES (NEW.dominio,NEW.version,NEW.meses_activos,NEW.meses_totales,NEW.aprobada_en);
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER trg_versionar_politica
BEFORE UPDATE OR DELETE ON auditoria_control.politicas
FOR EACH ROW EXECUTE FUNCTION auditoria_control.fn_versionar_politica();

CREATE FUNCTION auditoria_control.fn_historial_inmutable() RETURNS trigger
LANGUAGE plpgsql SET search_path=pg_catalog AS $$
BEGIN
 RAISE EXCEPTION 'El historial de políticas es inmutable';
END $$;
CREATE TRIGGER trg_historial_inmutable
BEFORE UPDATE OR DELETE ON auditoria_control.politicas_historial
FOR EACH ROW EXECUTE FUNCTION auditoria_control.fn_historial_inmutable();
CREATE TRIGGER trg_historial_no_truncate
BEFORE TRUNCATE ON auditoria_control.politicas_historial
FOR EACH STATEMENT EXECUTE FUNCTION auditoria_control.fn_historial_inmutable();

-- Captura la versión y los plazos en el momento de crear el lote.
ALTER TABLE auditoria_control.lotes
 ADD COLUMN politica_version text,
 ADD COLUMN meses_activos_aplicados integer,
 ADD COLUMN meses_totales_aplicados integer,
 ADD COLUMN corte_total timestamptz;
ALTER TABLE auditoria_control.lotes
 ADD CONSTRAINT fk_lote_politica_version FOREIGN KEY(dominio,politica_version)
 REFERENCES auditoria_control.politicas_historial(dominio,version);
ALTER TABLE auditoria_control.lotes
 ADD CONSTRAINT ck_lote_plazos CHECK
 (meses_activos_aplicados > 0 AND meses_totales_aplicados >= meses_activos_aplicados);

CREATE FUNCTION auditoria_control.fn_controlar_lote() RETURNS trigger
LANGUAGE plpgsql SET search_path=pg_catalog AS $$
DECLARE p record; m record;
BEGIN
 IF TG_OP='INSERT' THEN
  SELECT version, meses_activos, meses_totales INTO p
  FROM auditoria_control.politicas WHERE dominio=NEW.dominio;
  IF NOT FOUND THEN RAISE EXCEPTION 'Dominio sin política'; END IF;
  NEW.politica_version := p.version;
  NEW.meses_activos_aplicados := p.meses_activos;
  NEW.meses_totales_aplicados := p.meses_totales;
  NEW.corte_total := NEW.creado_en - make_interval(months=>p.meses_totales);
  IF NEW.estado <> 'seleccionado' THEN
   RAISE EXCEPTION 'Un lote debe iniciar en seleccionado';
  END IF;
 ELSE
  IF ROW(NEW.ejecucion_id,NEW.dominio,NEW.corte_activo,NEW.corte_total,
         NEW.politica_version,NEW.meses_activos_aplicados,NEW.meses_totales_aplicados)
     IS DISTINCT FROM
     ROW(OLD.ejecucion_id,OLD.dominio,OLD.corte_activo,OLD.corte_total,
         OLD.politica_version,OLD.meses_activos_aplicados,OLD.meses_totales_aplicados) THEN
   RAISE EXCEPTION 'La configuración y los cortes del lote son inmutables';
  END IF;
  IF NEW.estado IS DISTINCT FROM OLD.estado THEN
   IF NOT ((OLD.estado='seleccionado' AND NEW.estado IN ('exportado','fallido')) OR
           (OLD.estado='exportado' AND NEW.estado IN ('verificado','fallido'))) THEN
    RAISE EXCEPTION 'Transición de lote no autorizada: % -> %', OLD.estado,NEW.estado;
   END IF;
   IF NEW.estado='verificado' THEN
    SELECT * INTO m FROM auditoria_control.manifiestos WHERE lote_id=OLD.id;
    IF NOT FOUND OR m.copia_independiente_verificada IS DISTINCT FROM true
       OR m.restauracion_verificada IS DISTINCT FROM true
       OR m.verificado_en IS NULL THEN
      RAISE EXCEPTION 'No se puede verificar sin copia independiente y restauración comprobadas';
    END IF;
    IF EXISTS (SELECT 1 FROM auditoria_control.suspensiones s
               JOIN auditoria_control.lote_registros lr ON lr.lote_id=OLD.id
               WHERE s.liberado_en IS NULL AND s.dominio=OLD.dominio
                 AND s.registro_id=lr.registro_id) THEN
      RAISE EXCEPTION 'El lote contiene registros suspendidos';
    END IF;
   END IF;
  END IF;
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER trg_controlar_lote BEFORE INSERT OR UPDATE
ON auditoria_control.lotes FOR EACH ROW
EXECUTE FUNCTION auditoria_control.fn_controlar_lote();

-- No permitir duplicar un evento entre lotes del mismo dominio.
-- Índice por registro y función de comprobación serializada con bloqueo de la
-- política de dominio (impide carreras entre transacciones concurrentes).
CREATE INDEX ix_lote_registros_registro ON auditoria_control.lote_registros(registro_id);
CREATE FUNCTION auditoria_control.fn_no_duplicar_lote_registro() RETURNS trigger
LANGUAGE plpgsql SET search_path=pg_catalog AS $$
DECLARE d text;
BEGIN
 SELECT dominio INTO d FROM auditoria_control.lotes WHERE id=NEW.lote_id;
 IF d IS NULL THEN RAISE EXCEPTION 'Lote inexistente'; END IF;
 PERFORM 1 FROM auditoria_control.politicas WHERE dominio=d FOR UPDATE;
 IF EXISTS (
   SELECT 1 FROM auditoria_control.lote_registros lr
   JOIN auditoria_control.lotes l ON l.id=lr.lote_id
   WHERE l.dominio=d AND lr.registro_id=NEW.registro_id AND lr.lote_id<>NEW.lote_id
 ) THEN RAISE EXCEPTION 'Evento ya incluido en otro lote del mismo dominio'; END IF;
 IF EXISTS (SELECT 1 FROM auditoria_control.suspensiones s
            WHERE s.liberado_en IS NULL AND s.dominio=d
              AND s.registro_id=NEW.registro_id) THEN
   RAISE EXCEPTION 'Evento sujeto a suspensión';
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER trg_no_duplicar_lote_registro BEFORE INSERT
ON auditoria_control.lote_registros FOR EACH ROW
EXECUTE FUNCTION auditoria_control.fn_no_duplicar_lote_registro();

-- Catálogo de localización: metadatos y referencias, sin duplicar JSON.
CREATE TABLE auditoria_control.catalogo_eventos (
 dominio text NOT NULL REFERENCES auditoria_control.politicas(dominio),
 evento_id bigint NOT NULL,
 tabla_origen text NOT NULL,
 registro_negocio_id text,
 pedido_id bigint,
 creado_en timestamptz NOT NULL,
 lote_id bigint NOT NULL REFERENCES auditoria_control.lotes(id),
 PRIMARY KEY(dominio,evento_id)
);
CREATE INDEX ix_catalogo_registro ON auditoria_control.catalogo_eventos
 (dominio,tabla_origen,registro_negocio_id,creado_en);
CREATE INDEX ix_catalogo_pedido ON auditoria_control.catalogo_eventos(pedido_id,creado_en)
 WHERE pedido_id IS NOT NULL;
CREATE INDEX ix_catalogo_lote ON auditoria_control.catalogo_eventos(lote_id);

-- Bloquear cambios al manifiesto de un lote ya verificado.
CREATE FUNCTION auditoria_control.fn_bloquear_manifiesto() RETURNS trigger
LANGUAGE plpgsql SET search_path=pg_catalog AS $$
DECLARE e text;
BEGIN
 SELECT estado INTO e FROM auditoria_control.lotes WHERE id=COALESCE(OLD.lote_id,NEW.lote_id);
 IF e='verificado' THEN RAISE EXCEPTION 'Manifiesto verificado inmutable'; END IF;
 RETURN COALESCE(NEW,OLD);
END $$;
CREATE TRIGGER trg_bloquear_manifiesto BEFORE UPDATE OR DELETE
ON auditoria_control.manifiestos FOR EACH ROW
EXECUTE FUNCTION auditoria_control.fn_bloquear_manifiesto();

-- Sin permisos directos para aplicación, auditor y exportador.
REVOKE ALL ON auditoria_control.politicas_historial,
 auditoria_control.catalogo_eventos FROM PUBLIC, nexo_app, nexo_auditor, nexo_exportador;
GRANT SELECT ON auditoria_control.politicas_historial TO nexo_exportador;
-- No se concede retiro/borrado a ningún rol de aplicación.
