-- 5. SCHEMA catalogo
-- ============================================================

CREATE TABLE catalogo.categorias (
    id                 BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    -- RF-04: categorías principales con subcategorías. RESTRICT: no se pierde la jerarquía.
    categoria_padre_id BIGINT REFERENCES catalogo.categorias(id) ON DELETE RESTRICT,
    nombre             VARCHAR(100) NOT NULL,
    descripcion        TEXT,
    imagen_id          BIGINT REFERENCES media.multimedia(id) ON DELETE RESTRICT,   -- RF-16 RN-03
    activo             BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en          TIMESTAMPTZ NOT NULL DEFAULT now(),
    actualizado_en     TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT chk_categoria_no_autoreferencia CHECK (categoria_padre_id IS DISTINCT FROM id),
    CONSTRAINT uq_categoria_nombre_padre UNIQUE (categoria_padre_id, nombre)
);
-- UNIQUE normal no controla NULL: las categorías raíz se validan con índice parcial.
CREATE UNIQUE INDEX uq_categoria_raiz_nombre ON catalogo.categorias (nombre)
    WHERE categoria_padre_id IS NULL;
CREATE INDEX idx_categorias_padre  ON catalogo.categorias (categoria_padre_id);
CREATE INDEX idx_categorias_imagen ON catalogo.categorias (imagen_id);

-- `tipo` hace explícito qué subtabla corresponde a cada producto.
CREATE TABLE catalogo.productos (
    id             BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    -- Sin ON DELETE: no se puede eliminar una categoría con productos (RF-04 RN-01), solo desactivarla.
    categoria_id   BIGINT NOT NULL REFERENCES catalogo.categorias(id),
    tipo           VARCHAR(20) NOT NULL,
    nombre         VARCHAR(150) NOT NULL,
    descripcion    TEXT,
    precio_base    NUMERIC(10,2) NOT NULL,
    activo         BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en      TIMESTAMPTZ NOT NULL DEFAULT now(),
    actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT chk_producto_tipo   CHECK (tipo IN ('TORTA', 'DETALLE', 'SUBLIMACION')),
    CONSTRAINT chk_producto_precio CHECK (precio_base >= 0),
    -- Permite a las subtablas apuntar a (id, tipo) y así impedir tipos cruzados.
    CONSTRAINT uq_producto_id_tipo UNIQUE (id, tipo)
);
CREATE INDEX idx_productos_categoria ON catalogo.productos (categoria_id);
CREATE INDEX idx_productos_activo    ON catalogo.productos (activo);

-- Subtablas por tipo: la FK compuesta (producto_id, tipo) garantiza que
-- un producto TORTA solo pueda tener fila en `tortas`, y no en otra subtabla.
CREATE TABLE catalogo.tortas (
    producto_id BIGINT PRIMARY KEY,
    tipo        VARCHAR(20) NOT NULL DEFAULT 'TORTA' CHECK (tipo = 'TORTA'),
    tamano      VARCHAR(50)  NOT NULL,
    porciones   INT NOT NULL,
    sabor       VARCHAR(100) NOT NULL,

    CONSTRAINT chk_torta_porciones CHECK (porciones > 0),
    CONSTRAINT fk_torta_producto FOREIGN KEY (producto_id, tipo)
        REFERENCES catalogo.productos (id, tipo) ON DELETE CASCADE
);

CREATE TABLE catalogo.detalles (
    producto_id BIGINT PRIMARY KEY,
    tipo        VARCHAR(20) NOT NULL DEFAULT 'DETALLE' CHECK (tipo = 'DETALLE'),
    stock       INT NOT NULL DEFAULT 0,

    CONSTRAINT chk_detalle_stock CHECK (stock >= 0),
    CONSTRAINT fk_detalle_producto FOREIGN KEY (producto_id, tipo)
        REFERENCES catalogo.productos (id, tipo) ON DELETE CASCADE
);

CREATE TABLE catalogo.sublimaciones (
    producto_id   BIGINT PRIMARY KEY,
    tipo          VARCHAR(20) NOT NULL DEFAULT 'SUBLIMACION' CHECK (tipo = 'SUBLIMACION'),
    tipo_material VARCHAR(100) NOT NULL,
    -- RF-09 RN-02: el diseño propio del cliente puede tener un costo adicional configurable.
    costo_diseno_personalizado NUMERIC(10,2) NOT NULL DEFAULT 0.00
        CONSTRAINT chk_sublimacion_costo CHECK (costo_diseno_personalizado >= 0),

    CONSTRAINT fk_sublimacion_producto FOREIGN KEY (producto_id, tipo)
        REFERENCES catalogo.productos (id, tipo) ON DELETE CASCADE
);

CREATE TABLE catalogo.disenos_torta (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    torta_id        BIGINT NOT NULL REFERENCES catalogo.tortas(producto_id) ON DELETE CASCADE,
    nombre          VARCHAR(100) NOT NULL,
    descripcion     TEXT,
    costo_adicional NUMERIC(10,2) NOT NULL DEFAULT 0.00,   -- RF-06: se suma al precio de la torta
    multimedia_id   BIGINT NOT NULL REFERENCES media.multimedia(id) ON DELETE RESTRICT,  -- imagen obligatoria
    activo          BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en       TIMESTAMPTZ NOT NULL DEFAULT now(),
    actualizado_en  TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT chk_diseno_torta_costo CHECK (costo_adicional >= 0),
    -- Permite validar en ventas que el diseño pertenece a la torta elegida.
    CONSTRAINT uq_diseno_torta_id_torta UNIQUE (id, torta_id)
);
CREATE INDEX idx_disenos_torta_torta ON catalogo.disenos_torta (torta_id);
CREATE INDEX idx_disenos_torta_media ON catalogo.disenos_torta (multimedia_id);

CREATE TABLE catalogo.plantillas_diseno (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    sublimacion_id  BIGINT NOT NULL REFERENCES catalogo.sublimaciones(producto_id) ON DELETE CASCADE,
    nombre          VARCHAR(100) NOT NULL,
    descripcion     TEXT,
    costo_adicional NUMERIC(10,2) NOT NULL DEFAULT 0.00,   -- RF-11 RN-02: 0 salvo que el admin lo configure
    multimedia_id   BIGINT NOT NULL REFERENCES media.multimedia(id) ON DELETE RESTRICT,
    activo          BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en       TIMESTAMPTZ NOT NULL DEFAULT now(),
    actualizado_en  TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT chk_plantilla_costo CHECK (costo_adicional >= 0),
    CONSTRAINT uq_plantilla_id_sublimacion UNIQUE (id, sublimacion_id)
);
CREATE INDEX idx_plantillas_sublimacion ON catalogo.plantillas_diseno (sublimacion_id);
CREATE INDEX idx_plantillas_media       ON catalogo.plantillas_diseno (multimedia_id);

-- Galería de imágenes del producto (relación N:M con media.multimedia).
CREATE TABLE catalogo.producto_multimedia (
    producto_id   BIGINT NOT NULL REFERENCES catalogo.productos(id) ON DELETE CASCADE,
    -- RESTRICT: no se elimina una imagen en uso en un producto (RF-16 RN-03).
    multimedia_id BIGINT NOT NULL REFERENCES media.multimedia(id)   ON DELETE RESTRICT,
    orden         INT NOT NULL DEFAULT 0,
    es_principal  BOOLEAN NOT NULL DEFAULT FALSE,

    PRIMARY KEY (producto_id, multimedia_id),
    CONSTRAINT chk_producto_multimedia_orden CHECK (orden >= 0)
);
-- Un producto solo puede tener una imagen principal.
CREATE UNIQUE INDEX uq_producto_multimedia_principal
    ON catalogo.producto_multimedia (producto_id) WHERE es_principal;
CREATE INDEX idx_prodmedia_multimedia ON catalogo.producto_multimedia (multimedia_id);

-- RF-07: la galería de un producto de DETALLES admite entre 1 y 8 imágenes (el mínimo lo valida el API).
CREATE FUNCTION catalogo.fn_limite_imagenes_detalle() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
    -- Serializa cambios de galería mediante la fila del producto.
    PERFORM id FROM catalogo.productos WHERE id = NEW.producto_id FOR UPDATE;
    IF (SELECT tipo FROM catalogo.productos WHERE id = NEW.producto_id) = 'DETALLE'
       AND (SELECT count(*) FROM catalogo.producto_multimedia WHERE producto_id = NEW.producto_id
           AND (TG_OP <> 'UPDATE' OR
                (producto_id, multimedia_id) IS DISTINCT FROM (OLD.producto_id, OLD.multimedia_id))) >= 8 THEN
        RAISE EXCEPTION 'Un producto de Detalles admite máximo 8 imágenes' USING ERRCODE = 'check_violation';
    END IF;
    RETURN NEW;
END $$;
CREATE TRIGGER trg_limite_imagenes_detalle BEFORE INSERT OR UPDATE OF producto_id, multimedia_id ON catalogo.producto_multimedia
    FOR EACH ROW EXECUTE FUNCTION catalogo.fn_limite_imagenes_detalle();

-- Descuento atómico de stock: evita sobreventa con dos backends concurrentes.
-- Devuelve TRUE si había stock suficiente. Uso: SELECT catalogo.descontar_stock(id, cantidad);
CREATE FUNCTION catalogo.descontar_stock(p_producto_id BIGINT, p_cantidad INT)
RETURNS BOOLEAN LANGUAGE plpgsql AS $$
BEGIN
    IF p_cantidad IS NULL OR p_cantidad <= 0 THEN
        RAISE EXCEPTION 'La cantidad debe ser positiva' USING ERRCODE = 'check_violation';
    END IF;
    UPDATE catalogo.detalles
       SET stock = stock - p_cantidad
     WHERE producto_id = p_producto_id AND stock >= p_cantidad;
    RETURN FOUND;
END $$;




-- ============================================================
