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




-- ============================================================
