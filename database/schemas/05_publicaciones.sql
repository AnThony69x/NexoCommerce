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




-- ============================================================
