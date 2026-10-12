-- 6. SCHEMA publicaciones
-- ============================================================

CREATE TABLE publicaciones.publicaciones (
    id             BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    usuario_id     BIGINT NOT NULL REFERENCES auth.usuarios(id) ON DELETE RESTRICT,
    categoria_id   BIGINT REFERENCES catalogo.categorias(id) ON DELETE SET NULL,
    producto_id    BIGINT REFERENCES catalogo.productos(id)  ON DELETE SET NULL,
    titulo         VARCHAR(150) NOT NULL,
    descripcion    TEXT,
    estado         VARCHAR(20) NOT NULL DEFAULT 'BORRADOR',
    publicada_en   TIMESTAMPTZ,
    creado_en      TIMESTAMPTZ NOT NULL DEFAULT now(),
    actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT chk_publicacion_estado CHECK (estado IN ('BORRADOR', 'PUBLICADA', 'ARCHIVADA')),
    CONSTRAINT chk_publicacion_fecha CHECK (estado <> 'PUBLICADA' OR publicada_en IS NOT NULL)
);
CREATE INDEX idx_publicaciones_usuario   ON publicaciones.publicaciones (usuario_id);
CREATE INDEX idx_publicaciones_categoria ON publicaciones.publicaciones (categoria_id);
CREATE INDEX idx_publicaciones_producto  ON publicaciones.publicaciones (producto_id);
CREATE INDEX idx_publicaciones_estado    ON publicaciones.publicaciones (estado);
-- Feed en orden cronológico (RF-03) y escalable a 5000+ publicaciones (RNF-07).
CREATE INDEX idx_publicaciones_feed ON publicaciones.publicaciones (publicada_en DESC)
    WHERE estado = 'PUBLICADA';

CREATE TABLE publicaciones.publicacion_multimedia (
    publicacion_id BIGINT NOT NULL REFERENCES publicaciones.publicaciones(id) ON DELETE CASCADE,
    multimedia_id  BIGINT NOT NULL REFERENCES media.multimedia(id) ON DELETE RESTRICT,
    -- RF-03 RN-01: máximo 10 imágenes (posiciones 1..10, sin repetir). El mínimo de 1 lo valida el API.
    orden          INT NOT NULL,

    PRIMARY KEY (publicacion_id, multimedia_id),
    CONSTRAINT chk_publicacion_multimedia_orden CHECK (orden BETWEEN 1 AND 10),
    CONSTRAINT uq_publicacion_orden UNIQUE (publicacion_id, orden)
);
CREATE INDEX idx_pubmedia_multimedia ON publicaciones.publicacion_multimedia (multimedia_id);

-- Auditoría propia del schema publicaciones: quién, cuándo y qué cambió (solo inserción).
CREATE TABLE publicaciones.auditoria (
    id               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tabla            VARCHAR(100) NOT NULL,
    operacion        VARCHAR(10)  NOT NULL,
    registro_id      VARCHAR(100),               -- PK del registro afectado
    usuario_id       BIGINT,                     -- sin FK: la auditoría no debe bloquear borrados
    datos_anteriores JSONB,
    datos_nuevos     JSONB,
    ip_origen        INET,
    creado_en        TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT chk_publicaciones_auditoria_operacion CHECK (operacion IN ('INSERT', 'UPDATE', 'DELETE'))
);
CREATE INDEX idx_publicaciones_auditoria_registro ON publicaciones.auditoria (tabla, registro_id);
CREATE INDEX idx_publicaciones_auditoria_fecha    ON publicaciones.auditoria (creado_en);
CREATE TRIGGER trg_publicaciones_auditoria_inmutable
    BEFORE UPDATE OR DELETE ON publicaciones.auditoria
    FOR EACH ROW EXECUTE FUNCTION public.fn_auditoria_inmutable();


-- ============================================================
