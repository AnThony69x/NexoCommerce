-- 3. SCHEMA media
--    Solo guarda REFERENCIAS; el archivo vive en el File Server.
-- ============================================================

CREATE TABLE media.multimedia (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre_archivo  VARCHAR(255) NOT NULL,
    descripcion     TEXT,                    -- RF-16: metadatos (nombre, descripción)
    -- RF-16: categoría/módulo de destino del archivo.
    modulo          VARCHAR(30) NOT NULL DEFAULT 'PRODUCTO',
    ruta_archivo    VARCHAR(500) NOT NULL,   -- ruta RELATIVA (permite mover el File Server)
    tipo_mime       VARCHAR(100) NOT NULL,
    tamano_bytes    BIGINT NOT NULL,
    ancho           INT,
    alto            INT,
    checksum_sha256 CHAR(64),                -- detecta duplicados o corrupción
    activo          BOOLEAN NOT NULL DEFAULT TRUE,
    subido_por_id   BIGINT REFERENCES auth.usuarios(id) ON DELETE SET NULL,
    creado_en       TIMESTAMPTZ NOT NULL DEFAULT now(),
    actualizado_en  TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- RF-16 RN-01: JPG/PNG/WEBP (y PDF solo para comprobantes de pago, RF-14).
    CONSTRAINT chk_multimedia_mime CHECK (tipo_mime IN
        ('image/jpeg', 'image/png', 'image/webp', 'application/pdf')),
    CONSTRAINT chk_multimedia_pdf_modulo CHECK (tipo_mime <> 'application/pdf' OR modulo = 'COMPROBANTE'),
    CONSTRAINT chk_multimedia_modulo CHECK (modulo IN
        ('CATEGORIA', 'PRODUCTO', 'DISENO_TORTA', 'PLANTILLA', 'PUBLICACION',
         'DISENO_CLIENTE', 'COMPROBANTE', 'TIENDA')),
    CONSTRAINT chk_multimedia_tamano CHECK (tamano_bytes >= 0),
    CONSTRAINT chk_multimedia_ancho  CHECK (ancho IS NULL OR ancho > 0),
    CONSTRAINT chk_multimedia_alto   CHECK (alto  IS NULL OR alto  > 0)
);
CREATE INDEX idx_multimedia_subido_por ON media.multimedia (subido_por_id);
CREATE INDEX idx_multimedia_checksum   ON media.multimedia (checksum_sha256);

-- Auditoría propia del schema media: quién, cuándo y qué cambió (solo inserción).
CREATE TABLE media.auditoria (
    id               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tabla            VARCHAR(100) NOT NULL,
    operacion        VARCHAR(10)  NOT NULL,
    registro_id      VARCHAR(100),               -- PK del registro afectado
    usuario_id       BIGINT,                     -- sin FK: la auditoría no debe bloquear borrados
    datos_anteriores JSONB,
    datos_nuevos     JSONB,
    ip_origen        INET,
    creado_en        TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT chk_media_auditoria_operacion CHECK (operacion IN ('INSERT', 'UPDATE', 'DELETE'))
);
CREATE INDEX idx_media_auditoria_registro ON media.auditoria (tabla, registro_id);
CREATE INDEX idx_media_auditoria_fecha    ON media.auditoria (creado_en);
CREATE TRIGGER trg_media_auditoria_inmutable
    BEFORE UPDATE OR DELETE ON media.auditoria
    FOR EACH ROW EXECUTE FUNCTION public.fn_auditoria_inmutable();


-- ============================================================
