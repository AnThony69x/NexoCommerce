-- 4. SCHEMA tienda
--    Parametrización de la instalación sin tocar código.
-- ============================================================

CREATE TABLE tienda.configuracion_tienda (
    id               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre_tienda    VARCHAR(150) NOT NULL,

    -- Logo y favicon son archivos del File Server: se referencian en media.
    logo_id          BIGINT REFERENCES media.multimedia(id) ON DELETE RESTRICT,
    favicon_id       BIGINT REFERENCES media.multimedia(id) ON DELETE RESTRICT,

    color_primario   VARCHAR(20) NOT NULL,
    color_secundario VARCHAR(20) NOT NULL,
    color_acento     VARCHAR(20),
    color_fondo      VARCHAR(20),
    color_texto      VARCHAR(20),

    telefono         VARCHAR(20),
    correo           VARCHAR(150),
    direccion        VARCHAR(255),

    -- Reglas de negocio configurables (los RF las marcan como "configurable").
    codigo_pais_telefono        VARCHAR(5) NOT NULL DEFAULT '+593',   -- RF-02 RN-02
    max_intentos_login          INT NOT NULL DEFAULT 5,               -- RF-01 RN-02
    minutos_bloqueo_login       INT NOT NULL DEFAULT 15,              -- RF-01 RN-02
    max_mb_diseno_personalizado INT NOT NULL DEFAULT 10,              -- RF-10 RN-03
    min_px_diseno_personalizado INT NOT NULL DEFAULT 800,             -- RF-10 RN-02
    horas_revision_comprobante  INT NOT NULL DEFAULT 24,              -- RF-14 RN-03

    activo           BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en        TIMESTAMPTZ NOT NULL DEFAULT now(),
    actualizado_en   TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT chk_tienda_reglas CHECK (max_intentos_login > 0 AND minutos_bloqueo_login > 0
        AND max_mb_diseno_personalizado > 0 AND min_px_diseno_personalizado > 0
        AND horas_revision_comprobante > 0)
);
-- Solo una configuración activa por instalación.
CREATE UNIQUE INDEX uq_tienda_config_activa ON tienda.configuracion_tienda (activo) WHERE activo;
CREATE INDEX idx_tienda_logo    ON tienda.configuracion_tienda (logo_id);
CREATE INDEX idx_tienda_favicon ON tienda.configuracion_tienda (favicon_id);




-- ============================================================
