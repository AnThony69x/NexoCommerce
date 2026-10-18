-- 7. SCHEMA ventas
-- ============================================================

-- Diseño propio que sube el cliente para una TORTA (RF-06) o una SUBLIMACIÓN (RF-10).
-- En tortas el costo se cotiza después (RF-06 RN-02): costo_adicional NULL = "por cotizar".
CREATE TABLE ventas.disenos_personalizados (
    id               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    usuario_id       BIGINT NOT NULL REFERENCES auth.usuarios(id) ON DELETE RESTRICT,
    producto_id      BIGINT NOT NULL,
    tipo_producto    VARCHAR(20) NOT NULL,
    multimedia_id    BIGINT NOT NULL REFERENCES media.multimedia(id) ON DELETE RESTRICT,
    indicaciones     TEXT,
    estado_cotizacion VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
    costo_adicional  NUMERIC(10,2),
    creado_en        TIMESTAMPTZ NOT NULL DEFAULT now(),
    actualizado_en   TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT chk_dp_tipo CHECK (tipo_producto IN ('TORTA', 'SUBLIMACION')),
    -- El producto debe ser realmente de ese tipo.
    CONSTRAINT fk_dp_producto FOREIGN KEY (producto_id, tipo_producto)
        REFERENCES catalogo.productos (id, tipo) ON DELETE RESTRICT,
    CONSTRAINT chk_dp_estado CHECK (estado_cotizacion IN ('NO_REQUIERE', 'PENDIENTE', 'COTIZADO')),
    CONSTRAINT chk_dp_costo CHECK (costo_adicional IS NULL OR costo_adicional >= 0),
    -- Si ya está cotizado/no requiere cotización, el costo debe existir; si está pendiente, no.
    CONSTRAINT chk_dp_coherencia CHECK (
        (estado_cotizacion = 'PENDIENTE' AND costo_adicional IS NULL) OR
        (estado_cotizacion <> 'PENDIENTE' AND costo_adicional IS NOT NULL)),
    CONSTRAINT uq_dp_id_producto UNIQUE (id, producto_id)
);
CREATE INDEX idx_dp_usuario  ON ventas.disenos_personalizados (usuario_id);
CREATE INDEX idx_dp_producto ON ventas.disenos_personalizados (producto_id, tipo_producto);
CREATE INDEX idx_dp_media    ON ventas.disenos_personalizados (multimedia_id);

-- RF-10 RN-02/03: el archivo debe ser JPG/PNG, <= tamaño máximo y >= resolución mínima.
-- Los límites se leen de tienda.configuracion_tienda (configurables).
CREATE FUNCTION ventas.fn_validar_diseno_personalizado() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE
    m media.multimedia%ROWTYPE;
    c tienda.configuracion_tienda%ROWTYPE;
BEGIN
    SELECT * INTO m FROM media.multimedia WHERE id = NEW.multimedia_id;
    SELECT * INTO c FROM tienda.configuracion_tienda WHERE activo;

    IF m.tipo_mime NOT IN ('image/jpeg', 'image/png') THEN
        RAISE EXCEPTION 'El diseño debe ser JPG o PNG' USING ERRCODE = 'check_violation';
    END IF;
    IF m.tamano_bytes > COALESCE(c.max_mb_diseno_personalizado, 10) * 1024 * 1024 THEN
        RAISE EXCEPTION 'El archivo supera el tamaño máximo permitido' USING ERRCODE = 'check_violation';
    END IF;
    IF COALESCE(m.ancho, 0) < COALESCE(c.min_px_diseno_personalizado, 800)
       OR COALESCE(m.alto, 0) < COALESCE(c.min_px_diseno_personalizado, 800) THEN
        RAISE EXCEPTION 'La resolución mínima es % x % px',
            COALESCE(c.min_px_diseno_personalizado, 800), COALESCE(c.min_px_diseno_personalizado, 800)
            USING ERRCODE = 'check_violation';
    END IF;
    RETURN NEW;
END $$;
CREATE TRIGGER trg_validar_diseno_personalizado
    BEFORE INSERT OR UPDATE OF multimedia_id ON ventas.disenos_personalizados
    FOR EACH ROW EXECUTE FUNCTION ventas.fn_validar_diseno_personalizado();

CREATE TABLE ventas.carritos (
    id             BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    usuario_id     BIGINT NOT NULL REFERENCES auth.usuarios(id) ON DELETE RESTRICT,
    activo         BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en      TIMESTAMPTZ NOT NULL DEFAULT now(),
    actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Un usuario solo puede tener un carrito activo.
CREATE UNIQUE INDEX uq_carrito_activo_usuario ON ventas.carritos (usuario_id) WHERE activo;

CREATE TABLE ventas.detalles_carrito (
    id                      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    carrito_id              BIGINT NOT NULL REFERENCES ventas.carritos(id) ON DELETE CASCADE,
    producto_id             BIGINT NOT NULL REFERENCES catalogo.productos(id) ON DELETE RESTRICT,
    cantidad                INT NOT NULL DEFAULT 1,
    precio_unitario         NUMERIC(10,2) NOT NULL,
    costo_diseno            NUMERIC(10,2) NOT NULL DEFAULT 0.00,   -- RF-12: costos adicionales por diseño
    comentario              TEXT,

    -- A lo sumo UNA personalización por línea (ver CHECK).
    diseno_torta_id         BIGINT,
    plantilla_diseno_id     BIGINT,
    diseno_personalizado_id BIGINT,

    creado_en               TIMESTAMPTZ NOT NULL DEFAULT now(),
    actualizado_en          TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT chk_carrito_cantidad CHECK (cantidad > 0),
    CONSTRAINT chk_carrito_precio   CHECK (precio_unitario >= 0),
    CONSTRAINT chk_carrito_costo_diseno CHECK (costo_diseno >= 0),
    CONSTRAINT chk_carrito_configuracion CHECK (
        num_nonnulls(diseno_torta_id, plantilla_diseno_id, diseno_personalizado_id) <= 1),

    -- FK compuestas: el diseño DEBE pertenecer al producto de la línea.
    -- (Si el diseño es NULL la FK no se evalúa.)
    CONSTRAINT fk_carrito_diseno_torta FOREIGN KEY (diseno_torta_id, producto_id)
        REFERENCES catalogo.disenos_torta (id, torta_id) ON DELETE RESTRICT,
    CONSTRAINT fk_carrito_plantilla FOREIGN KEY (plantilla_diseno_id, producto_id)
        REFERENCES catalogo.plantillas_diseno (id, sublimacion_id) ON DELETE RESTRICT,
    CONSTRAINT fk_carrito_diseno_pers FOREIGN KEY (diseno_personalizado_id, producto_id)
        REFERENCES ventas.disenos_personalizados (id, producto_id) ON DELETE RESTRICT
);
CREATE INDEX idx_det_carrito_carrito  ON ventas.detalles_carrito (carrito_id);
CREATE INDEX idx_det_carrito_producto ON ventas.detalles_carrito (producto_id);

CREATE TABLE ventas.pedidos (
    id                 BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    usuario_id         BIGINT NOT NULL REFERENCES auth.usuarios(id) ON DELETE RESTRICT,

    estado             VARCHAR(50) NOT NULL DEFAULT 'PENDIENTE',
    -- RF-14: constancia del estado del pago en el pedido (la mantiene un trigger de pagos).
    estado_pago        VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',

    -- Datos de entrega (RF-13 RN-01: fecha de entrega obligatoria).
    fecha_entrega      DATE NOT NULL,
    hora_entrega       TIME,
    tipo_entrega       VARCHAR(20) NOT NULL DEFAULT 'RETIRO',
    direccion_entrega  VARCHAR(255),
    telefono_contacto  VARCHAR(20),

    -- Totales: total = subtotal - descuento + costo_envio (validado por CHECK).
    subtotal           NUMERIC(10,2) NOT NULL,
    descuento          NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    costo_envio        NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    total              NUMERIC(10,2) NOT NULL,

    creado_en          TIMESTAMPTZ NOT NULL DEFAULT now(),
    actualizado_en     TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT chk_pedido_estado CHECK (estado IN
        ('PENDIENTE', 'EN_PREPARACION', 'LISTO', 'ENTREGADO', 'CANCELADO')),
    CONSTRAINT chk_pedido_estado_pago CHECK (estado_pago IN
        ('PENDIENTE', 'APROBADO', 'RECHAZADO', 'REEMBOLSADO')),
    CONSTRAINT chk_pedido_tipo_entrega CHECK (tipo_entrega IN ('RETIRO', 'DOMICILIO')),
    -- A domicilio es obligatoria la dirección.
    CONSTRAINT chk_pedido_direccion CHECK (tipo_entrega = 'RETIRO' OR NULLIF(btrim(direccion_entrega), '') IS NOT NULL),
    CONSTRAINT chk_pedido_montos CHECK (subtotal >= 0 AND descuento >= 0 AND costo_envio >= 0 AND total >= 0),
    CONSTRAINT chk_pedido_total CHECK (total = subtotal - descuento + costo_envio)
);
CREATE INDEX idx_pedidos_usuario       ON ventas.pedidos (usuario_id);
CREATE INDEX idx_pedidos_fecha_entrega ON ventas.pedidos (fecha_entrega);
CREATE INDEX idx_pedidos_estado        ON ventas.pedidos (estado);

-- RF-13 RN-03: el estado solo avanza en secuencia PENDIENTE -> EN_PREPARACION -> LISTO -> ENTREGADO.
-- CANCELADO (extensión) solo antes de que el pedido esté listo.
-- RF-14 RN-01: no se confirma (pasa a EN_PREPARACION) hasta que el pago esté APROBADO.
CREATE FUNCTION ventas.fn_validar_estado_pedido() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.estado <> 'PENDIENTE' OR NEW.estado_pago <> 'PENDIENTE' THEN
            RAISE EXCEPTION 'El pedido debe crearse pendiente, sin pago aprobado' USING ERRCODE = 'check_violation';
        END IF;
        RETURN NEW;
    END IF;
    IF NEW.estado = OLD.estado THEN RETURN NEW; END IF;

    IF NOT (
        (OLD.estado = 'PENDIENTE'      AND NEW.estado IN ('EN_PREPARACION', 'CANCELADO')) OR
        (OLD.estado = 'EN_PREPARACION' AND NEW.estado IN ('LISTO', 'CANCELADO')) OR
        (OLD.estado = 'LISTO'          AND NEW.estado = 'ENTREGADO')
    ) THEN
        RAISE EXCEPTION 'Transición de estado no permitida: % -> %', OLD.estado, NEW.estado
            USING ERRCODE = 'check_violation';
    END IF;

    IF NEW.estado = 'EN_PREPARACION' AND NEW.estado_pago <> 'APROBADO' THEN
        RAISE EXCEPTION 'El pedido no puede confirmarse hasta que el pago sea aprobado'
            USING ERRCODE = 'check_violation';
    END IF;
    RETURN NEW;
END $$;
CREATE TRIGGER trg_pedidos_validar_estado BEFORE INSERT OR UPDATE OF estado ON ventas.pedidos
    FOR EACH ROW EXECUTE FUNCTION ventas.fn_validar_estado_pedido();

-- Línea del pedido: guarda una "foto" (snapshot) de nombre, precio y diseño,
-- para que el historial no cambie si el catálogo cambia después.
CREATE TABLE ventas.detalles_pedido (
    id                      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    pedido_id               BIGINT NOT NULL REFERENCES ventas.pedidos(id) ON DELETE CASCADE,
    producto_id             BIGINT NOT NULL REFERENCES catalogo.productos(id) ON DELETE RESTRICT,

    nombre_producto         VARCHAR(150) NOT NULL,
    cantidad                INT NOT NULL,
    precio_unitario         NUMERIC(10,2) NOT NULL,
    subtotal                NUMERIC(10,2) NOT NULL,

    tipo_configuracion      VARCHAR(50),
    nombre_diseno           VARCHAR(100),
    costo_diseno            NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    indicaciones            TEXT,

    -- Las FK compuestas garantizan que el diseño corresponde al producto.
    -- Se desactivan diseños usados; el snapshot conserva sus datos históricos.
    diseno_torta_id         BIGINT,
    plantilla_diseno_id     BIGINT,
    diseno_personalizado_id BIGINT,

    creado_en               TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT fk_detped_diseno_torta FOREIGN KEY (diseno_torta_id, producto_id)
        REFERENCES catalogo.disenos_torta (id, torta_id) ON DELETE RESTRICT,
    CONSTRAINT fk_detped_plantilla FOREIGN KEY (plantilla_diseno_id, producto_id)
        REFERENCES catalogo.plantillas_diseno (id, sublimacion_id) ON DELETE RESTRICT,
    CONSTRAINT fk_detped_diseno_pers FOREIGN KEY (diseno_personalizado_id, producto_id)
        REFERENCES ventas.disenos_personalizados (id, producto_id) ON DELETE RESTRICT,
    CONSTRAINT chk_det_pedido_cantidad  CHECK (cantidad > 0),
    CONSTRAINT chk_det_pedido_precio    CHECK (precio_unitario >= 0),
    CONSTRAINT chk_det_pedido_subtotal  CHECK (subtotal >= 0),
    CONSTRAINT chk_det_pedido_costo     CHECK (costo_diseno >= 0),
    CONSTRAINT chk_det_pedido_configuracion CHECK (
        num_nonnulls(diseno_torta_id, plantilla_diseno_id, diseno_personalizado_id) <= 1)
);
CREATE INDEX idx_det_pedido_pedido   ON ventas.detalles_pedido (pedido_id);
CREATE INDEX idx_det_pedido_producto ON ventas.detalles_pedido (producto_id);
CREATE INDEX idx_det_pedido_dtorta   ON ventas.detalles_pedido (diseno_torta_id);
CREATE INDEX idx_det_pedido_plant    ON ventas.detalles_pedido (plantilla_diseno_id);
CREATE INDEX idx_det_pedido_dpers    ON ventas.detalles_pedido (diseno_personalizado_id);

-- Historial de NEGOCIO (visible para cliente/admin). Distinto de `auditoria`
-- (que es técnica). Se llena solo, con el trigger de abajo.
CREATE TABLE ventas.pedido_historial_estado (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    pedido_id       BIGINT NOT NULL REFERENCES ventas.pedidos(id) ON DELETE RESTRICT,   -- el historial no se pierde con el pedido
    estado_anterior VARCHAR(50),
    estado_nuevo    VARCHAR(50) NOT NULL,
    usuario_id      BIGINT REFERENCES auth.usuarios(id) ON DELETE RESTRICT,
    comentario      TEXT,
    creado_en       TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);
CREATE INDEX idx_hist_pedido  ON ventas.pedido_historial_estado (pedido_id, creado_en);
CREATE INDEX idx_hist_usuario ON ventas.pedido_historial_estado (usuario_id);

CREATE FUNCTION ventas.fn_historial_estado() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
BEGIN
    IF TG_OP = 'INSERT' OR NEW.estado IS DISTINCT FROM OLD.estado THEN
        INSERT INTO ventas.pedido_historial_estado (pedido_id, estado_anterior, estado_nuevo, usuario_id)
        VALUES (NEW.id,
                CASE WHEN TG_OP = 'UPDATE' THEN OLD.estado END,
                NEW.estado,
                public.fn_actor_id());
    END IF;
    RETURN NULL;
END $$;

CREATE TRIGGER trg_pedidos_historial
    AFTER INSERT OR UPDATE OF estado ON ventas.pedidos
    FOR EACH ROW EXECUTE FUNCTION ventas.fn_historial_estado();

-- El historial es solo de inserción (lo escribe únicamente el trigger de arriba).
CREATE TRIGGER trg_historial_inmutable BEFORE UPDATE OR DELETE ON ventas.pedido_historial_estado
    FOR EACH ROW EXECUTE FUNCTION public.fn_auditoria_inmutable();
CREATE TRIGGER trg_historial_no_truncate BEFORE TRUNCATE ON ventas.pedido_historial_estado
    FOR EACH STATEMENT EXECUTE FUNCTION public.fn_auditoria_inmutable();




-- ============================================================
