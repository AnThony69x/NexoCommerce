-- 2. SCHEMA auth
-- ============================================================

-- Catálogo de roles: administrador y cliente (RF-01). Otro rol futuro es solo un INSERT.
CREATE TABLE auth.roles (
    id     BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE auth.usuarios (
    id                    BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    rol_id                BIGINT NOT NULL REFERENCES auth.roles(id),

    nombre_completo       VARCHAR(150) NOT NULL,
    correo                VARCHAR(150) NOT NULL,
    telefono              VARCHAR(20),

    -- NULL permitido: cuentas creadas solo con OAuth (Google). RF-01.
    password_hash         VARCHAR(255),

    correo_verificado     BOOLEAN NOT NULL DEFAULT FALSE,

    -- RF-01 RN-02: bloqueo temporal tras N intentos fallidos (N y minutos en tienda.configuracion_tienda).
    intentos_fallidos     INT NOT NULL DEFAULT 0,
    bloqueado_hasta       TIMESTAMPTZ,

    terminos_aceptados    BOOLEAN NOT NULL DEFAULT FALSE,
    version_terminos      VARCHAR(20),
    terminos_aceptados_en TIMESTAMPTZ,

    activo                BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en             TIMESTAMPTZ NOT NULL DEFAULT now(),
    actualizado_en        TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT chk_usuarios_intentos CHECK (intentos_fallidos >= 0),
    -- RF-02 RN-02: teléfono/WhatsApp con formato válido (el prefijo +593 se configura en tienda).
    CONSTRAINT chk_usuarios_telefono CHECK (telefono IS NULL OR telefono ~ '^\+?[0-9]{7,15}$'),
    -- RNF-03: jamás texto plano. Solo hashes bcrypt (costo >= 10) o argon2.
    CONSTRAINT chk_usuarios_password_hash CHECK (password_hash IS NULL OR
        password_hash ~ '^\$2[aby]\$(1[0-9]|2[0-9]|3[01])\$.{53}$' OR
        password_hash ~ '^\$argon2(id|i|d)\$'),
    -- RF-02 RN-03: si acepta los términos, debe quedar la fecha de aceptación.
    CONSTRAINT chk_usuarios_terminos CHECK (NOT terminos_aceptados OR terminos_aceptados_en IS NOT NULL)
);
-- Correo único sin distinguir mayúsculas/minúsculas.
CREATE UNIQUE INDEX uq_usuarios_correo_lower ON auth.usuarios (lower(correo));
CREATE INDEX idx_usuarios_rol ON auth.usuarios (rol_id);

CREATE TABLE auth.cuentas_oauth (
    id             BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    usuario_id     BIGINT NOT NULL REFERENCES auth.usuarios(id) ON DELETE CASCADE,
    proveedor      VARCHAR(50)  NOT NULL,
    id_proveedor   VARCHAR(255) NOT NULL,
    creado_en      TIMESTAMPTZ NOT NULL DEFAULT now(),
    actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_cuenta_oauth_proveedor UNIQUE (proveedor, id_proveedor),
    CONSTRAINT chk_oauth_proveedor CHECK (proveedor IN ('GOOGLE'))
);
CREATE INDEX idx_oauth_usuario ON auth.cuentas_oauth (usuario_id);

-- Se guarda el HASH del código, nunca el código en claro.
CREATE TABLE auth.verificaciones_correo (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    usuario_id  BIGINT NOT NULL REFERENCES auth.usuarios(id) ON DELETE CASCADE,
    codigo_hash VARCHAR(100) NOT NULL,
    expira_en   TIMESTAMPTZ NOT NULL,
    usado_en    TIMESTAMPTZ,
    creado_en   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_verif_usuario ON auth.verificaciones_correo (usuario_id);
CREATE INDEX idx_verif_codigo  ON auth.verificaciones_correo (codigo_hash);

-- Tokens de Laravel Sanctum (misma estructura que su migración oficial).
CREATE TABLE auth.personal_access_tokens (
    id             BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tokenable_type VARCHAR(255) NOT NULL,
    tokenable_id   BIGINT NOT NULL,
    name           VARCHAR(255) NOT NULL,
    token          VARCHAR(64)  NOT NULL UNIQUE,
    abilities      TEXT,
    last_used_at   TIMESTAMPTZ,
    expires_at     TIMESTAMPTZ,
    created_at     TIMESTAMPTZ,
    updated_at     TIMESTAMPTZ
);
CREATE INDEX idx_pat_tokenable ON auth.personal_access_tokens (tokenable_type, tokenable_id);




-- ============================================================
