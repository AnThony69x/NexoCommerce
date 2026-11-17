-- Nueve tablas de auditoria, indices y protecciones.
-- Depende de 00_base.sql; ejecutar antes de los triggers de captura.

-- Auditoría propia del schema auth: quién, cuándo y qué cambió (solo inserción).
CREATE TABLE auditoria.auditoria_auth (
    id                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,   -- identificador local de esta tabla; no ordena entre schemas
    tabla             VARCHAR(100) NOT NULL,
    operacion         VARCHAR(10)  NOT NULL,
    registro_id       VARCHAR(100),               -- PK del registro afectado
    pedido_id         BIGINT,                     -- correlación: pedido relacionado (sin FK)
    usuario_id        BIGINT,                     -- usuario declarado por el backend (sin FK)
    usuario_bd        VARCHAR(63) NOT NULL DEFAULT session_user,   -- rol REAL de la conexión
    origen            VARCHAR(60),                -- 'API' | 'SISTEMA:<tarea>' | 'ADMIN-TRUNCATE'
    id_transaccion    BIGINT NOT NULL DEFAULT txid_current(),      -- agrupa lo ocurrido en una operación
    solicitud_id      VARCHAR(64),                -- id de la petición HTTP (opcional)
    datos_anteriores  JSONB,
    datos_nuevos      JSONB,
    ip_origen         INET,
    contexto_invalido VARCHAR(20),   -- NULL=válido; AUSENTE, FORMATO_INVALIDO o ACTOR_DESCONOCIDO
    creado_en         TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),  -- hora del evento (no del inicio de la transacción)

    CONSTRAINT chk_auth_auditoria_operacion CHECK (operacion IN ('INSERT', 'UPDATE', 'DELETE', 'TRUNCATE')),
    CONSTRAINT chk_01_contexto_invalido CHECK (contexto_invalido IS NULL OR contexto_invalido IN ('AUSENTE', 'FORMATO_INVALIDO', 'ACTOR_DESCONOCIDO'))
);
CREATE INDEX idx_auth_auditoria_registro ON auditoria.auditoria_auth (tabla, registro_id);
CREATE INDEX idx_auth_auditoria_fecha    ON auditoria.auditoria_auth (creado_en);
CREATE INDEX idx_auth_auditoria_usuario  ON auditoria.auditoria_auth (usuario_id, creado_en) WHERE usuario_id IS NOT NULL;
CREATE INDEX idx_auth_auditoria_tx       ON auditoria.auditoria_auth (id_transaccion);
CREATE TRIGGER trg_auth_auditoria_inmutable
    BEFORE UPDATE OR DELETE ON auditoria.auditoria_auth
    FOR EACH ROW EXECUTE FUNCTION public.fn_auditoria_inmutable();

-- Auditoría propia del schema media: quién, cuándo y qué cambió (solo inserción).
CREATE TABLE auditoria.auditoria_media (
    id                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,   -- identificador local de esta tabla; no ordena entre schemas
    tabla             VARCHAR(100) NOT NULL,
    operacion         VARCHAR(10)  NOT NULL,
    registro_id       VARCHAR(100),               -- PK del registro afectado
    pedido_id         BIGINT,                     -- correlación: pedido relacionado (sin FK)
    usuario_id        BIGINT,                     -- usuario declarado por el backend (sin FK)
    usuario_bd        VARCHAR(63) NOT NULL DEFAULT session_user,   -- rol REAL de la conexión
    origen            VARCHAR(60),                -- 'API' | 'SISTEMA:<tarea>' | 'ADMIN-TRUNCATE'
    id_transaccion    BIGINT NOT NULL DEFAULT txid_current(),      -- agrupa lo ocurrido en una operación
    solicitud_id      VARCHAR(64),                -- id de la petición HTTP (opcional)
    datos_anteriores  JSONB,
    datos_nuevos      JSONB,
    ip_origen         INET,
    contexto_invalido VARCHAR(20),   -- NULL=válido; AUSENTE, FORMATO_INVALIDO o ACTOR_DESCONOCIDO
    creado_en         TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),  -- hora del evento (no del inicio de la transacción)

    CONSTRAINT chk_media_auditoria_operacion CHECK (operacion IN ('INSERT', 'UPDATE', 'DELETE', 'TRUNCATE')),
    CONSTRAINT chk_02_contexto_invalido CHECK (contexto_invalido IS NULL OR contexto_invalido IN ('AUSENTE', 'FORMATO_INVALIDO', 'ACTOR_DESCONOCIDO'))
);
CREATE INDEX idx_media_auditoria_registro ON auditoria.auditoria_media (tabla, registro_id);
CREATE INDEX idx_media_auditoria_fecha    ON auditoria.auditoria_media (creado_en);
CREATE INDEX idx_media_auditoria_usuario  ON auditoria.auditoria_media (usuario_id, creado_en) WHERE usuario_id IS NOT NULL;
CREATE INDEX idx_media_auditoria_tx       ON auditoria.auditoria_media (id_transaccion);
CREATE TRIGGER trg_media_auditoria_inmutable
    BEFORE UPDATE OR DELETE ON auditoria.auditoria_media
    FOR EACH ROW EXECUTE FUNCTION public.fn_auditoria_inmutable();

-- Auditoría propia del schema tienda: quién, cuándo y qué cambió (solo inserción).
CREATE TABLE auditoria.auditoria_tienda (
    id                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,   -- identificador local de esta tabla; no ordena entre schemas
    tabla             VARCHAR(100) NOT NULL,
    operacion         VARCHAR(10)  NOT NULL,
    registro_id       VARCHAR(100),               -- PK del registro afectado
    pedido_id         BIGINT,                     -- correlación: pedido relacionado (sin FK)
    usuario_id        BIGINT,                     -- usuario declarado por el backend (sin FK)
    usuario_bd        VARCHAR(63) NOT NULL DEFAULT session_user,   -- rol REAL de la conexión
    origen            VARCHAR(60),                -- 'API' | 'SISTEMA:<tarea>' | 'ADMIN-TRUNCATE'
    id_transaccion    BIGINT NOT NULL DEFAULT txid_current(),      -- agrupa lo ocurrido en una operación
    solicitud_id      VARCHAR(64),                -- id de la petición HTTP (opcional)
    datos_anteriores  JSONB,
    datos_nuevos      JSONB,
    ip_origen         INET,
    contexto_invalido VARCHAR(20),   -- NULL=válido; AUSENTE, FORMATO_INVALIDO o ACTOR_DESCONOCIDO
    creado_en         TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),  -- hora del evento (no del inicio de la transacción)

    CONSTRAINT chk_tienda_auditoria_operacion CHECK (operacion IN ('INSERT', 'UPDATE', 'DELETE', 'TRUNCATE')),
    CONSTRAINT chk_03_contexto_invalido CHECK (contexto_invalido IS NULL OR contexto_invalido IN ('AUSENTE', 'FORMATO_INVALIDO', 'ACTOR_DESCONOCIDO'))
);
CREATE INDEX idx_tienda_auditoria_registro ON auditoria.auditoria_tienda (tabla, registro_id);
CREATE INDEX idx_tienda_auditoria_fecha    ON auditoria.auditoria_tienda (creado_en);
CREATE INDEX idx_tienda_auditoria_usuario  ON auditoria.auditoria_tienda (usuario_id, creado_en) WHERE usuario_id IS NOT NULL;
CREATE INDEX idx_tienda_auditoria_tx       ON auditoria.auditoria_tienda (id_transaccion);
CREATE TRIGGER trg_tienda_auditoria_inmutable
    BEFORE UPDATE OR DELETE ON auditoria.auditoria_tienda
    FOR EACH ROW EXECUTE FUNCTION public.fn_auditoria_inmutable();

-- Auditoría propia del schema catalogo: quién, cuándo y qué cambió (solo inserción).
CREATE TABLE auditoria.auditoria_catalogo (
    id                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,   -- identificador local de esta tabla; no ordena entre schemas
    tabla             VARCHAR(100) NOT NULL,
    operacion         VARCHAR(10)  NOT NULL,
    registro_id       VARCHAR(100),               -- PK del registro afectado
    pedido_id         BIGINT,                     -- correlación: pedido relacionado (sin FK)
    usuario_id        BIGINT,                     -- usuario declarado por el backend (sin FK)
    usuario_bd        VARCHAR(63) NOT NULL DEFAULT session_user,   -- rol REAL de la conexión
    origen            VARCHAR(60),                -- 'API' | 'SISTEMA:<tarea>' | 'ADMIN-TRUNCATE'
    id_transaccion    BIGINT NOT NULL DEFAULT txid_current(),      -- agrupa lo ocurrido en una operación
    solicitud_id      VARCHAR(64),                -- id de la petición HTTP (opcional)
    datos_anteriores  JSONB,
    datos_nuevos      JSONB,
    ip_origen         INET,
    contexto_invalido VARCHAR(20),   -- NULL=válido; AUSENTE, FORMATO_INVALIDO o ACTOR_DESCONOCIDO
    creado_en         TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),  -- hora del evento (no del inicio de la transacción)

    CONSTRAINT chk_catalogo_auditoria_operacion CHECK (operacion IN ('INSERT', 'UPDATE', 'DELETE', 'TRUNCATE')),
    CONSTRAINT chk_04_contexto_invalido CHECK (contexto_invalido IS NULL OR contexto_invalido IN ('AUSENTE', 'FORMATO_INVALIDO', 'ACTOR_DESCONOCIDO'))
);
CREATE INDEX idx_catalogo_auditoria_registro ON auditoria.auditoria_catalogo (tabla, registro_id);
CREATE INDEX idx_catalogo_auditoria_fecha    ON auditoria.auditoria_catalogo (creado_en);
CREATE INDEX idx_catalogo_auditoria_usuario  ON auditoria.auditoria_catalogo (usuario_id, creado_en) WHERE usuario_id IS NOT NULL;
CREATE INDEX idx_catalogo_auditoria_tx       ON auditoria.auditoria_catalogo (id_transaccion);
CREATE TRIGGER trg_catalogo_auditoria_inmutable
    BEFORE UPDATE OR DELETE ON auditoria.auditoria_catalogo
    FOR EACH ROW EXECUTE FUNCTION public.fn_auditoria_inmutable();

-- Auditoría propia del schema publicaciones: quién, cuándo y qué cambió (solo inserción).
CREATE TABLE auditoria.auditoria_publicaciones (
    id                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,   -- identificador local de esta tabla; no ordena entre schemas
    tabla             VARCHAR(100) NOT NULL,
    operacion         VARCHAR(10)  NOT NULL,
    registro_id       VARCHAR(100),               -- PK del registro afectado
    pedido_id         BIGINT,                     -- correlación: pedido relacionado (sin FK)
    usuario_id        BIGINT,                     -- usuario declarado por el backend (sin FK)
    usuario_bd        VARCHAR(63) NOT NULL DEFAULT session_user,   -- rol REAL de la conexión
    origen            VARCHAR(60),                -- 'API' | 'SISTEMA:<tarea>' | 'ADMIN-TRUNCATE'
    id_transaccion    BIGINT NOT NULL DEFAULT txid_current(),      -- agrupa lo ocurrido en una operación
    solicitud_id      VARCHAR(64),                -- id de la petición HTTP (opcional)
    datos_anteriores  JSONB,
    datos_nuevos      JSONB,
    ip_origen         INET,
    contexto_invalido VARCHAR(20),   -- NULL=válido; AUSENTE, FORMATO_INVALIDO o ACTOR_DESCONOCIDO
    creado_en         TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),  -- hora del evento (no del inicio de la transacción)

    CONSTRAINT chk_publicaciones_auditoria_operacion CHECK (operacion IN ('INSERT', 'UPDATE', 'DELETE', 'TRUNCATE')),
    CONSTRAINT chk_05_contexto_invalido CHECK (contexto_invalido IS NULL OR contexto_invalido IN ('AUSENTE', 'FORMATO_INVALIDO', 'ACTOR_DESCONOCIDO'))
);
CREATE INDEX idx_publicaciones_auditoria_registro ON auditoria.auditoria_publicaciones (tabla, registro_id);
CREATE INDEX idx_publicaciones_auditoria_fecha    ON auditoria.auditoria_publicaciones (creado_en);
CREATE INDEX idx_publicaciones_auditoria_usuario  ON auditoria.auditoria_publicaciones (usuario_id, creado_en) WHERE usuario_id IS NOT NULL;
CREATE INDEX idx_publicaciones_auditoria_tx       ON auditoria.auditoria_publicaciones (id_transaccion);
CREATE TRIGGER trg_publicaciones_auditoria_inmutable
    BEFORE UPDATE OR DELETE ON auditoria.auditoria_publicaciones
    FOR EACH ROW EXECUTE FUNCTION public.fn_auditoria_inmutable();

-- Auditoría propia del schema ventas: quién, cuándo y qué cambió (solo inserción).
CREATE TABLE auditoria.auditoria_ventas (
    id                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,   -- identificador local de esta tabla; no ordena entre schemas
    tabla             VARCHAR(100) NOT NULL,
    operacion         VARCHAR(10)  NOT NULL,
    registro_id       VARCHAR(100),               -- PK del registro afectado
    pedido_id         BIGINT,                     -- correlación: pedido relacionado (sin FK)
    usuario_id        BIGINT,                     -- usuario declarado por el backend (sin FK)
    usuario_bd        VARCHAR(63) NOT NULL DEFAULT session_user,   -- rol REAL de la conexión
    origen            VARCHAR(60),                -- 'API' | 'SISTEMA:<tarea>' | 'ADMIN-TRUNCATE'
    id_transaccion    BIGINT NOT NULL DEFAULT txid_current(),      -- agrupa lo ocurrido en una operación
    solicitud_id      VARCHAR(64),                -- id de la petición HTTP (opcional)
    datos_anteriores  JSONB,
    datos_nuevos      JSONB,
    ip_origen         INET,
    contexto_invalido VARCHAR(20),   -- NULL=válido; AUSENTE, FORMATO_INVALIDO o ACTOR_DESCONOCIDO
    creado_en         TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),  -- hora del evento (no del inicio de la transacción)

    CONSTRAINT chk_ventas_auditoria_operacion CHECK (operacion IN ('INSERT', 'UPDATE', 'DELETE', 'TRUNCATE')),
    CONSTRAINT chk_06_contexto_invalido CHECK (contexto_invalido IS NULL OR contexto_invalido IN ('AUSENTE', 'FORMATO_INVALIDO', 'ACTOR_DESCONOCIDO'))
);
CREATE INDEX idx_ventas_auditoria_registro ON auditoria.auditoria_ventas (tabla, registro_id);
CREATE INDEX idx_ventas_auditoria_fecha    ON auditoria.auditoria_ventas (creado_en);
CREATE INDEX idx_ventas_auditoria_usuario  ON auditoria.auditoria_ventas (usuario_id, creado_en) WHERE usuario_id IS NOT NULL;
CREATE INDEX idx_ventas_auditoria_pedido   ON auditoria.auditoria_ventas (pedido_id, id) WHERE pedido_id IS NOT NULL;
CREATE INDEX idx_ventas_auditoria_tx       ON auditoria.auditoria_ventas (id_transaccion);
CREATE TRIGGER trg_ventas_auditoria_inmutable
    BEFORE UPDATE OR DELETE ON auditoria.auditoria_ventas
    FOR EACH ROW EXECUTE FUNCTION public.fn_auditoria_inmutable();

-- Auditoría propia del schema produccion: quién, cuándo y qué cambió (solo inserción).
CREATE TABLE auditoria.auditoria_produccion (
    id                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,   -- identificador local de esta tabla; no ordena entre schemas
    tabla             VARCHAR(100) NOT NULL,
    operacion         VARCHAR(10)  NOT NULL,
    registro_id       VARCHAR(100),               -- PK del registro afectado
    pedido_id         BIGINT,                     -- correlación: pedido relacionado (sin FK)
    usuario_id        BIGINT,                     -- usuario declarado por el backend (sin FK)
    usuario_bd        VARCHAR(63) NOT NULL DEFAULT session_user,   -- rol REAL de la conexión
    origen            VARCHAR(60),                -- 'API' | 'SISTEMA:<tarea>' | 'ADMIN-TRUNCATE'
    id_transaccion    BIGINT NOT NULL DEFAULT txid_current(),      -- agrupa lo ocurrido en una operación
    solicitud_id      VARCHAR(64),                -- id de la petición HTTP (opcional)
    datos_anteriores  JSONB,
    datos_nuevos      JSONB,
    ip_origen         INET,
    contexto_invalido VARCHAR(20),   -- NULL=válido; AUSENTE, FORMATO_INVALIDO o ACTOR_DESCONOCIDO
    creado_en         TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),  -- hora del evento (no del inicio de la transacción)

    CONSTRAINT chk_produccion_auditoria_operacion CHECK (operacion IN ('INSERT', 'UPDATE', 'DELETE', 'TRUNCATE')),
    CONSTRAINT chk_07_contexto_invalido CHECK (contexto_invalido IS NULL OR contexto_invalido IN ('AUSENTE', 'FORMATO_INVALIDO', 'ACTOR_DESCONOCIDO'))
);
CREATE INDEX idx_produccion_auditoria_registro ON auditoria.auditoria_produccion (tabla, registro_id);
CREATE INDEX idx_produccion_auditoria_fecha    ON auditoria.auditoria_produccion (creado_en);
CREATE INDEX idx_produccion_auditoria_usuario  ON auditoria.auditoria_produccion (usuario_id, creado_en) WHERE usuario_id IS NOT NULL;
CREATE INDEX idx_produccion_auditoria_tx       ON auditoria.auditoria_produccion (id_transaccion);
CREATE TRIGGER trg_produccion_auditoria_inmutable
    BEFORE UPDATE OR DELETE ON auditoria.auditoria_produccion
    FOR EACH ROW EXECUTE FUNCTION public.fn_auditoria_inmutable();

-- Auditoría propia del schema pagos: quién, cuándo y qué cambió (solo inserción).
CREATE TABLE auditoria.auditoria_pagos (
    id                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,   -- identificador local de esta tabla; no ordena entre schemas
    tabla             VARCHAR(100) NOT NULL,
    operacion         VARCHAR(10)  NOT NULL,
    registro_id       VARCHAR(100),               -- PK del registro afectado
    pedido_id         BIGINT,                     -- correlación: pedido relacionado (sin FK)
    usuario_id        BIGINT,                     -- usuario declarado por el backend (sin FK)
    usuario_bd        VARCHAR(63) NOT NULL DEFAULT session_user,   -- rol REAL de la conexión
    origen            VARCHAR(60),                -- 'API' | 'SISTEMA:<tarea>' | 'ADMIN-TRUNCATE'
    id_transaccion    BIGINT NOT NULL DEFAULT txid_current(),      -- agrupa lo ocurrido en una operación
    solicitud_id      VARCHAR(64),                -- id de la petición HTTP (opcional)
    datos_anteriores  JSONB,
    datos_nuevos      JSONB,
    ip_origen         INET,
    contexto_invalido VARCHAR(20),   -- NULL=válido; AUSENTE, FORMATO_INVALIDO o ACTOR_DESCONOCIDO
    creado_en         TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),  -- hora del evento (no del inicio de la transacción)

    CONSTRAINT chk_pagos_auditoria_operacion CHECK (operacion IN ('INSERT', 'UPDATE', 'DELETE', 'TRUNCATE')),
    CONSTRAINT chk_08_contexto_invalido CHECK (contexto_invalido IS NULL OR contexto_invalido IN ('AUSENTE', 'FORMATO_INVALIDO', 'ACTOR_DESCONOCIDO'))
);
CREATE INDEX idx_pagos_auditoria_registro ON auditoria.auditoria_pagos (tabla, registro_id);
CREATE INDEX idx_pagos_auditoria_fecha    ON auditoria.auditoria_pagos (creado_en);
CREATE INDEX idx_pagos_auditoria_usuario  ON auditoria.auditoria_pagos (usuario_id, creado_en) WHERE usuario_id IS NOT NULL;
CREATE INDEX idx_pagos_auditoria_pedido   ON auditoria.auditoria_pagos (pedido_id, id) WHERE pedido_id IS NOT NULL;
CREATE INDEX idx_pagos_auditoria_tx       ON auditoria.auditoria_pagos (id_transaccion);
CREATE TRIGGER trg_pagos_auditoria_inmutable
    BEFORE UPDATE OR DELETE ON auditoria.auditoria_pagos
    FOR EACH ROW EXECUTE FUNCTION public.fn_auditoria_inmutable();

-- Auditoría propia del schema notificaciones: quién, cuándo y qué cambió (solo inserción).
CREATE TABLE auditoria.auditoria_notificaciones (
    id                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,   -- identificador local de esta tabla; no ordena entre schemas
    tabla             VARCHAR(100) NOT NULL,
    operacion         VARCHAR(10)  NOT NULL,
    registro_id       VARCHAR(100),               -- PK del registro afectado
    pedido_id         BIGINT,                     -- correlación: pedido relacionado (sin FK)
    usuario_id        BIGINT,                     -- usuario declarado por el backend (sin FK)
    usuario_bd        VARCHAR(63) NOT NULL DEFAULT session_user,   -- rol REAL de la conexión
    origen            VARCHAR(60),                -- 'API' | 'SISTEMA:<tarea>' | 'ADMIN-TRUNCATE'
    id_transaccion    BIGINT NOT NULL DEFAULT txid_current(),      -- agrupa lo ocurrido en una operación
    solicitud_id      VARCHAR(64),                -- id de la petición HTTP (opcional)
    datos_anteriores  JSONB,
    datos_nuevos      JSONB,
    ip_origen         INET,
    contexto_invalido VARCHAR(20),   -- NULL=válido; AUSENTE, FORMATO_INVALIDO o ACTOR_DESCONOCIDO
    creado_en         TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),  -- hora del evento (no del inicio de la transacción)

    CONSTRAINT chk_notificaciones_auditoria_operacion CHECK (operacion IN ('INSERT', 'UPDATE', 'DELETE', 'TRUNCATE')),
    CONSTRAINT chk_09_contexto_invalido CHECK (contexto_invalido IS NULL OR contexto_invalido IN ('AUSENTE', 'FORMATO_INVALIDO', 'ACTOR_DESCONOCIDO'))
);
CREATE INDEX idx_notificaciones_auditoria_registro ON auditoria.auditoria_notificaciones (tabla, registro_id);
CREATE INDEX idx_notificaciones_auditoria_fecha    ON auditoria.auditoria_notificaciones (creado_en);
CREATE INDEX idx_notificaciones_auditoria_usuario  ON auditoria.auditoria_notificaciones (usuario_id, creado_en) WHERE usuario_id IS NOT NULL;
CREATE INDEX idx_notificaciones_auditoria_pedido   ON auditoria.auditoria_notificaciones (pedido_id, id) WHERE pedido_id IS NOT NULL;
CREATE INDEX idx_notificaciones_auditoria_tx       ON auditoria.auditoria_notificaciones (id_transaccion);
CREATE TRIGGER trg_notificaciones_auditoria_inmutable
    BEFORE UPDATE OR DELETE ON auditoria.auditoria_notificaciones
    FOR EACH ROW EXECUTE FUNCTION public.fn_auditoria_inmutable();

-- TRUNCATE requiere un trigger por sentencia; UPDATE/DELETE ya están protegidos.
DO $$
DECLARE s TEXT;
BEGIN
    FOREACH s IN ARRAY ARRAY['auth','media','tienda','catalogo','publicaciones',
                            'ventas','produccion','pagos','notificaciones'] LOOP
        EXECUTE format('CREATE TRIGGER trg_auditoria_no_truncate BEFORE TRUNCATE ON auditoria.%I
                        FOR EACH STATEMENT EXECUTE FUNCTION public.fn_auditoria_inmutable()', 'auditoria_' || s);
        EXECUTE format('REVOKE UPDATE, DELETE, TRUNCATE ON auditoria.%I FROM PUBLIC', 'auditoria_' || s);
    END LOOP;
END $$;
