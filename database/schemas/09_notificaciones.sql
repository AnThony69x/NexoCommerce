-- 10. SCHEMA notificaciones
-- ============================================================

CREATE TABLE notificaciones.notificaciones (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    usuario_id    BIGINT NOT NULL REFERENCES auth.usuarios(id) ON DELETE CASCADE,
    pedido_id     BIGINT REFERENCES ventas.pedidos(id) ON DELETE SET NULL,
    pago_id       BIGINT REFERENCES pagos.pagos(id)    ON DELETE SET NULL,
    tipo          VARCHAR(50)  NOT NULL,
    -- RF-15: correo y/o notificación en la plataforma; el envío debe ocurrir en <= 1 minuto
    -- (se verifica con enviada_en - creado_en).
    canal         VARCHAR(20)  NOT NULL DEFAULT 'PLATAFORMA',
    estado_envio  VARCHAR(20)  NOT NULL DEFAULT 'PENDIENTE',
    enviada_en    TIMESTAMPTZ,
    intentos_envio INT NOT NULL DEFAULT 0,
    titulo        VARCHAR(150) NOT NULL,
    mensaje       TEXT NOT NULL,
    leida         BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_lectura TIMESTAMPTZ,
    creado_en     TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT chk_notif_canal  CHECK (canal IN ('PLATAFORMA', 'CORREO')),
    CONSTRAINT chk_notif_envio  CHECK (estado_envio IN ('PENDIENTE', 'ENVIADA', 'FALLIDA')),
    CONSTRAINT chk_notif_intentos CHECK (intentos_envio >= 0),
    CONSTRAINT chk_notif_fecha_envio CHECK (estado_envio <> 'ENVIADA' OR enviada_en IS NOT NULL),
    CONSTRAINT chk_notif_fecha_lectura CHECK (NOT leida OR fecha_lectura IS NOT NULL)
);
-- RF-15 RN-02: historial de notificaciones del usuario.
CREATE INDEX idx_notif_historial ON notificaciones.notificaciones (usuario_id, creado_en DESC);
CREATE INDEX idx_notif_pendientes ON notificaciones.notificaciones (estado_envio) WHERE estado_envio = 'PENDIENTE';
CREATE INDEX idx_notif_usuario ON notificaciones.notificaciones (usuario_id, leida);
CREATE INDEX idx_notif_pedido  ON notificaciones.notificaciones (pedido_id);
CREATE INDEX idx_notif_pago    ON notificaciones.notificaciones (pago_id);

-- Auditoría propia del schema notificaciones: quién, cuándo y qué cambió (solo inserción).
CREATE TABLE notificaciones.auditoria (
    id               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tabla            VARCHAR(100) NOT NULL,
    operacion        VARCHAR(10)  NOT NULL,
    registro_id      VARCHAR(100),               -- PK del registro afectado
    usuario_id       BIGINT,                     -- sin FK: la auditoría no debe bloquear borrados
    datos_anteriores JSONB,
    datos_nuevos     JSONB,
    ip_origen        INET,
    creado_en        TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT chk_notificaciones_auditoria_operacion CHECK (operacion IN ('INSERT', 'UPDATE', 'DELETE'))
);
CREATE INDEX idx_notificaciones_auditoria_registro ON notificaciones.auditoria (tabla, registro_id);
CREATE INDEX idx_notificaciones_auditoria_fecha    ON notificaciones.auditoria (creado_en);
CREATE TRIGGER trg_notificaciones_auditoria_inmutable
    BEFORE UPDATE OR DELETE ON notificaciones.auditoria
    FOR EACH ROW EXECUTE FUNCTION public.fn_auditoria_inmutable();


-- ============================================================
