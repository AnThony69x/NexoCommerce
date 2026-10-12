-- 9. SCHEMA pagos
-- ============================================================

CREATE TABLE pagos.pagos (
    id                  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    -- RESTRICT: un registro financiero no desaparece al borrar un pedido.
    pedido_id           BIGINT NOT NULL REFERENCES ventas.pedidos(id) ON DELETE RESTRICT,
    metodo              VARCHAR(50) NOT NULL,
    estado              VARCHAR(50) NOT NULL DEFAULT 'PENDIENTE',
    monto               NUMERIC(10,2) NOT NULL,
    moneda              CHAR(3) NOT NULL DEFAULT 'USD',
    referencia_pasarela VARCHAR(255),
    fecha_pago          TIMESTAMPTZ,
    creado_en           TIMESTAMPTZ NOT NULL DEFAULT now(),
    actualizado_en      TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT chk_pago_metodo CHECK (metodo IN ('PASARELA', 'TRANSFERENCIA')),
    CONSTRAINT chk_pago_estado CHECK (estado IN ('PENDIENTE', 'APROBADO', 'RECHAZADO', 'REEMBOLSADO')),
    CONSTRAINT chk_pago_monto CHECK (monto > 0),
    CONSTRAINT chk_pago_moneda CHECK (moneda = 'USD')
);
-- Un mismo cobro de la pasarela no puede registrarse dos veces (reintentos/webhooks).
CREATE UNIQUE INDEX uq_pago_referencia ON pagos.pagos (referencia_pasarela)
    WHERE referencia_pasarela IS NOT NULL;
CREATE INDEX idx_pagos_pedido ON pagos.pagos (pedido_id);
CREATE INDEX idx_pagos_estado ON pagos.pagos (estado);

-- RF-14 RNF-02: NO existen columnas de tarjeta. Solo se guarda la referencia de la pasarela PCI-DSS.

-- Regla: admite pagos parciales en USD; APROBADO exige cubrir el total.
-- El backend debe usar transacciones y reintentar conflictos de concurrencia.
CREATE FUNCTION pagos.fn_bloquear_pedido_pago() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
    IF TG_OP = 'UPDATE' AND NEW.pedido_id <> OLD.pedido_id THEN
        RAISE EXCEPTION 'No se puede reasignar un pago a otro pedido' USING ERRCODE = 'check_violation';
    END IF;
    PERFORM id FROM ventas.pedidos
      WHERE id = CASE WHEN TG_OP = 'DELETE' THEN OLD.pedido_id ELSE NEW.pedido_id END
      FOR UPDATE;
    IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
    RETURN NEW;
END $$;
CREATE TRIGGER trg_pagos_bloquear BEFORE INSERT OR UPDATE OR DELETE ON pagos.pagos
    FOR EACH ROW EXECUTE FUNCTION pagos.fn_bloquear_pedido_pago();

CREATE FUNCTION pagos.fn_recalcular_estado_pago(p_pedido_id BIGINT) RETURNS void
LANGUAGE plpgsql AS $$
DECLARE
    v_total NUMERIC;
    v_aprobado NUMERIC;
    v_estado TEXT;
BEGIN
    SELECT total INTO v_total FROM ventas.pedidos WHERE id = p_pedido_id FOR UPDATE;
    SELECT COALESCE(sum(monto) FILTER (WHERE estado = 'APROBADO'), 0),
           CASE
             WHEN bool_or(estado = 'PENDIENTE') THEN 'PENDIENTE'
             WHEN bool_or(estado = 'REEMBOLSADO') THEN 'REEMBOLSADO'
             WHEN bool_or(estado = 'RECHAZADO') THEN 'RECHAZADO'
             ELSE 'PENDIENTE'
           END
      INTO v_aprobado, v_estado FROM pagos.pagos WHERE pedido_id = p_pedido_id;
    IF v_aprobado > 0 THEN
        v_estado := CASE WHEN v_aprobado >= v_total THEN 'APROBADO' ELSE 'PENDIENTE' END;
    END IF;
    UPDATE ventas.pedidos SET estado_pago = v_estado
      WHERE id = p_pedido_id AND estado_pago IS DISTINCT FROM v_estado;
END $$;

CREATE FUNCTION pagos.fn_sincronizar_estado_pago() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
    PERFORM pagos.fn_recalcular_estado_pago(
        CASE WHEN TG_OP = 'DELETE' THEN OLD.pedido_id ELSE NEW.pedido_id END);
    RETURN NULL;
END $$;
CREATE TRIGGER trg_pagos_sincronizar AFTER INSERT OR UPDATE OR DELETE ON pagos.pagos
    FOR EACH ROW EXECUTE FUNCTION pagos.fn_sincronizar_estado_pago();

CREATE FUNCTION pagos.fn_total_pedido_cambiado() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.total IS DISTINCT FROM OLD.total THEN
        PERFORM pagos.fn_recalcular_estado_pago(NEW.id);
    END IF;
    RETURN NULL;
END $$;
CREATE TRIGGER trg_pedido_total_pago AFTER UPDATE OF total ON ventas.pedidos
    FOR EACH ROW EXECUTE FUNCTION pagos.fn_total_pedido_cambiado();

CREATE TABLE pagos.comprobantes_pago (
    id                  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    pago_id             BIGINT NOT NULL REFERENCES pagos.pagos(id) ON DELETE RESTRICT,
    multimedia_id       BIGINT NOT NULL REFERENCES media.multimedia(id) ON DELETE RESTRICT,
    revisado_por_id     BIGINT REFERENCES auth.usuarios(id) ON DELETE SET NULL,
    fecha_revision      TIMESTAMPTZ,
    comentario_revision TEXT,
    creado_en           TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_comprobantes_pago     ON pagos.comprobantes_pago (pago_id);
CREATE INDEX idx_comprobantes_media    ON pagos.comprobantes_pago (multimedia_id);
CREATE INDEX idx_comprobantes_revisor  ON pagos.comprobantes_pago (revisado_por_id);

-- Auditoría propia del schema pagos: quién, cuándo y qué cambió (solo inserción).
CREATE TABLE pagos.auditoria (
    id               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tabla            VARCHAR(100) NOT NULL,
    operacion        VARCHAR(10)  NOT NULL,
    registro_id      VARCHAR(100),               -- PK del registro afectado
    usuario_id       BIGINT,                     -- sin FK: la auditoría no debe bloquear borrados
    datos_anteriores JSONB,
    datos_nuevos     JSONB,
    ip_origen        INET,
    creado_en        TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT chk_pagos_auditoria_operacion CHECK (operacion IN ('INSERT', 'UPDATE', 'DELETE'))
);
CREATE INDEX idx_pagos_auditoria_registro ON pagos.auditoria (tabla, registro_id);
CREATE INDEX idx_pagos_auditoria_fecha    ON pagos.auditoria (creado_en);
CREATE TRIGGER trg_pagos_auditoria_inmutable
    BEFORE UPDATE OR DELETE ON pagos.auditoria
    FOR EACH ROW EXECUTE FUNCTION public.fn_auditoria_inmutable();


-- ============================================================
