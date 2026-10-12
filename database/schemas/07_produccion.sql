-- 8. SCHEMA produccion
--    Capacidad máxima por día (global o por categoría).
-- ============================================================

CREATE TABLE produccion.configuracion_produccion (
    id               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    fecha            DATE NOT NULL,
    categoria_id     BIGINT REFERENCES catalogo.categorias(id) ON DELETE RESTRICT,  -- NULL = global
    capacidad_maxima INT NOT NULL,
    activo           BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en        TIMESTAMPTZ NOT NULL DEFAULT now(),
    actualizado_en   TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT chk_capacidad_maxima CHECK (capacidad_maxima > 0)
);
-- Evita capacidades duplicadas para el mismo día (con y sin categoría).
CREATE UNIQUE INDEX uq_capacidad_dia_categoria ON produccion.configuracion_produccion (fecha, categoria_id)
    WHERE categoria_id IS NOT NULL;
CREATE UNIQUE INDEX uq_capacidad_dia_global ON produccion.configuracion_produccion (fecha)
    WHERE categoria_id IS NULL;

-- Auditoría propia del schema produccion: quién, cuándo y qué cambió (solo inserción).
CREATE TABLE produccion.auditoria (
    id               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tabla            VARCHAR(100) NOT NULL,
    operacion        VARCHAR(10)  NOT NULL,
    registro_id      VARCHAR(100),               -- PK del registro afectado
    usuario_id       BIGINT,                     -- sin FK: la auditoría no debe bloquear borrados
    datos_anteriores JSONB,
    datos_nuevos     JSONB,
    ip_origen        INET,
    creado_en        TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT chk_produccion_auditoria_operacion CHECK (operacion IN ('INSERT', 'UPDATE', 'DELETE'))
);
CREATE INDEX idx_produccion_auditoria_registro ON produccion.auditoria (tabla, registro_id);
CREATE INDEX idx_produccion_auditoria_fecha    ON produccion.auditoria (creado_en);
CREATE TRIGGER trg_produccion_auditoria_inmutable
    BEFORE UPDATE OR DELETE ON produccion.auditoria
    FOR EACH ROW EXECUTE FUNCTION public.fn_auditoria_inmutable();


-- ============================================================
