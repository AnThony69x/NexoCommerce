sql
-- ============================================================
-- NEXOCOMMERCE
-- Estructura de Base de Datos
-- Motor: PostgreSQL
--
-- Nota:
-- Esta estructura corresponde a una instalación independiente
-- del sistema. El software puede distribuirse posteriormente
-- a otros negocios mediante instalaciones independientes,
-- cada una con su propia base de datos.
-- ============================================================


-- ============================================================
-- 1. ROLES
-- ============================================================

CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL
);


-- ============================================================
-- 2. USUARIOS
-- ============================================================

CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    rol_id INT NOT NULL
        REFERENCES roles(id),

    nombre_completo VARCHAR(150) NOT NULL,
    correo VARCHAR(150) UNIQUE NOT NULL,
    telefono VARCHAR(20),

    password_hash VARCHAR(255),

    correo_verificado BOOLEAN NOT NULL DEFAULT FALSE,

    intentos_fallidos INT NOT NULL DEFAULT 0,
    bloqueado_hasta TIMESTAMP NULL,

    terminos_aceptados BOOLEAN NOT NULL DEFAULT FALSE,
    version_terminos VARCHAR(20),
    terminos_aceptados_en TIMESTAMP NULL,

    activo BOOLEAN NOT NULL DEFAULT TRUE,

    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_usuarios_intentos_fallidos
        CHECK (intentos_fallidos >= 0)
);


-- ============================================================
-- 3. CUENTAS_OAUTH
-- ============================================================

CREATE TABLE cuentas_oauth (
    id SERIAL PRIMARY KEY,

    usuario_id INT NOT NULL
        REFERENCES usuarios(id)
        ON DELETE CASCADE,

    proveedor VARCHAR(50) NOT NULL,
    id_proveedor VARCHAR(255) NOT NULL,

    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_cuenta_oauth_proveedor
        UNIQUE (proveedor, id_proveedor),

    CONSTRAINT chk_oauth_proveedor
        CHECK (proveedor IN ('GOOGLE'))
);


-- ============================================================
-- 4. VERIFICACIONES_CORREO
-- ============================================================

CREATE TABLE verificaciones_correo (
    id SERIAL PRIMARY KEY,

    usuario_id INT NOT NULL
        REFERENCES usuarios(id)
        ON DELETE CASCADE,

    codigo VARCHAR(100) NOT NULL,
    expira_en TIMESTAMP NOT NULL,
    usado_en TIMESTAMP NULL,

    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- 5. MULTIMEDIA
-- ============================================================

CREATE TABLE multimedia (
    id SERIAL PRIMARY KEY,

    nombre_archivo VARCHAR(255) NOT NULL,
    ruta_archivo VARCHAR(500) NOT NULL,
    tipo_mime VARCHAR(100) NOT NULL,
    tamano_bytes BIGINT NOT NULL,

    ancho INT NULL,
    alto INT NULL,

    activo BOOLEAN NOT NULL DEFAULT TRUE,

    subido_por_id INT NULL
        REFERENCES usuarios(id)
        ON DELETE SET NULL,

    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_multimedia_tamano
        CHECK (tamano_bytes >= 0),

    CONSTRAINT chk_multimedia_ancho
        CHECK (ancho IS NULL OR ancho > 0),

    CONSTRAINT chk_multimedia_alto
        CHECK (alto IS NULL OR alto > 0)
);


-- ============================================================
-- 6. CONFIGURACION_TIENDA
--
-- Configuración propia de esta instalación del sistema.
-- Permite personalizar la identidad visual y comercial
-- sin modificar el código fuente.
--
-- Los archivos (logo/favicon) se almacenan en MinIO.
-- PostgreSQL guarda únicamente su referencia.
-- ============================================================

CREATE TABLE configuracion_tienda (
    id SERIAL PRIMARY KEY,

    nombre_tienda VARCHAR(150) NOT NULL,

    logo_url VARCHAR(500) NULL,
    favicon_url VARCHAR(500) NULL,

    color_primario VARCHAR(20) NOT NULL,
    color_secundario VARCHAR(20) NOT NULL,
    color_acento VARCHAR(20) NULL,
    color_fondo VARCHAR(20) NULL,
    color_texto VARCHAR(20) NULL,

    telefono VARCHAR(20) NULL,
    correo VARCHAR(150) NULL,
    direccion VARCHAR(255) NULL,

    activo BOOLEAN NOT NULL DEFAULT TRUE,

    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- 7. CATEGORIAS
-- ============================================================

CREATE TABLE categorias (
    id SERIAL PRIMARY KEY,

    categoria_padre_id INT NULL
        REFERENCES categorias(id)
        ON DELETE SET NULL,

    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,

    imagen_id INT NULL
        REFERENCES multimedia(id)
        ON DELETE SET NULL,

    activo BOOLEAN NOT NULL DEFAULT TRUE,

    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_categoria_nombre_padre
        UNIQUE (categoria_padre_id, nombre)
);

-- Las categorías principales no pueden tener nombres repetidos.
CREATE UNIQUE INDEX uq_categoria_raiz_nombre
ON categorias(nombre)
WHERE categoria_padre_id IS NULL;


-- ============================================================
-- 8. PRODUCTOS
-- ============================================================

CREATE TABLE productos (
    id SERIAL PRIMARY KEY,

    categoria_id INT NOT NULL
        REFERENCES categorias(id),

    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,

    precio_base DECIMAL(10,2) NOT NULL,

    activo BOOLEAN NOT NULL DEFAULT TRUE,

    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_producto_precio
        CHECK (precio_base >= 0)
);


-- ============================================================
-- 9. TORTAS
-- ============================================================

CREATE TABLE tortas (
    producto_id INT PRIMARY KEY
        REFERENCES productos(id)
        ON DELETE CASCADE,

    tamano VARCHAR(50) NOT NULL,
    porciones INT NOT NULL,
    sabor VARCHAR(100) NOT NULL,

    CONSTRAINT chk_torta_porciones
        CHECK (porciones > 0)
);


-- ============================================================
-- 10. DETALLES
-- ============================================================

CREATE TABLE detalles (
    producto_id INT PRIMARY KEY
        REFERENCES productos(id)
        ON DELETE CASCADE,

    stock INT NOT NULL DEFAULT 0,

    CONSTRAINT chk_detalle_stock
        CHECK (stock >= 0)
);


-- ============================================================
-- 11. SUBLIMACIONES
-- ============================================================

CREATE TABLE sublimaciones (
    producto_id INT PRIMARY KEY
        REFERENCES productos(id)
        ON DELETE CASCADE,

    tipo_material VARCHAR(100) NOT NULL
);

-- ============================================================
-- 12. DISENOS_TORTA
-- ============================================================

CREATE TABLE disenos_torta (
    id SERIAL PRIMARY KEY,

    torta_id INT NOT NULL
        REFERENCES tortas(producto_id)
        ON DELETE CASCADE,

    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,

    costo_adicional DECIMAL(10,2) NOT NULL DEFAULT 0.00,

    multimedia_id INT NULL
        REFERENCES multimedia(id)
        ON DELETE SET NULL,

    activo BOOLEAN NOT NULL DEFAULT TRUE,

    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_diseno_torta_costo
        CHECK (costo_adicional >= 0)
);


-- ============================================================
-- 13. PLANTILLAS_DISENO
-- ============================================================

CREATE TABLE plantillas_diseno (
    id SERIAL PRIMARY KEY,

    sublimacion_id INT NOT NULL
        REFERENCES sublimaciones(producto_id)
        ON DELETE CASCADE,

    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,

    costo_adicional DECIMAL(10,2) NOT NULL DEFAULT 0.00,

    multimedia_id INT NULL
        REFERENCES multimedia(id)
        ON DELETE SET NULL,

    activo BOOLEAN NOT NULL DEFAULT TRUE,

    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_plantilla_costo
        CHECK (costo_adicional >= 0)
);


-- ============================================================
-- 14. DISENOS_PERSONALIZADOS
-- ============================================================

CREATE TABLE disenos_personalizados (
    id SERIAL PRIMARY KEY,

    usuario_id INT NOT NULL
        REFERENCES usuarios(id)
        ON DELETE RESTRICT,

    sublimacion_id INT NOT NULL
        REFERENCES sublimaciones(producto_id)
        ON DELETE RESTRICT,

    multimedia_id INT NOT NULL
        REFERENCES multimedia(id)
        ON DELETE RESTRICT,

    indicaciones TEXT,

    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- 15. PRODUCTO_MULTIMEDIA
-- ============================================================

CREATE TABLE producto_multimedia (
    producto_id INT NOT NULL
        REFERENCES productos(id)
        ON DELETE CASCADE,

    multimedia_id INT NOT NULL
        REFERENCES multimedia(id)
        ON DELETE CASCADE,

    orden INT NOT NULL DEFAULT 0,
    es_principal BOOLEAN NOT NULL DEFAULT FALSE,

    PRIMARY KEY (producto_id, multimedia_id),

    CONSTRAINT chk_producto_multimedia_orden
        CHECK (orden >= 0)
);

-- Un producto solo puede tener una imagen principal.
CREATE UNIQUE INDEX uq_producto_multimedia_principal
ON producto_multimedia(producto_id)
WHERE es_principal = TRUE;


-- ============================================================
-- 16. PUBLICACIONES
-- ============================================================

CREATE TABLE publicaciones (
    id SERIAL PRIMARY KEY,

    usuario_id INT NOT NULL
        REFERENCES usuarios(id)
        ON DELETE RESTRICT,

    categoria_id INT NULL
        REFERENCES categorias(id)
        ON DELETE SET NULL,

    producto_id INT NULL
        REFERENCES productos(id)
        ON DELETE SET NULL,

    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT,

    activo BOOLEAN NOT NULL DEFAULT TRUE,

    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- 17. PUBLICACION_MULTIMEDIA
-- ============================================================

CREATE TABLE publicacion_multimedia (
    publicacion_id INT NOT NULL
        REFERENCES publicaciones(id)
        ON DELETE CASCADE,

    multimedia_id INT NOT NULL
        REFERENCES multimedia(id)
        ON DELETE CASCADE,

    orden INT NOT NULL DEFAULT 0,

    PRIMARY KEY (publicacion_id, multimedia_id),

    CONSTRAINT chk_publicacion_multimedia_orden
        CHECK (orden >= 0)
);


-- ============================================================
-- 18. CARRITOS
-- ============================================================

CREATE TABLE carritos (
    id SERIAL PRIMARY KEY,

    usuario_id INT NOT NULL
        REFERENCES usuarios(id)
        ON DELETE RESTRICT,

    activo BOOLEAN NOT NULL DEFAULT TRUE,

    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- Un usuario solo puede tener un carrito activo.
CREATE UNIQUE INDEX uq_carrito_activo_usuario
ON carritos(usuario_id)
WHERE activo = TRUE;


-- ============================================================
-- 19. DETALLES_CARRITO
-- ============================================================

CREATE TABLE detalles_carrito (
    id SERIAL PRIMARY KEY,

    carrito_id INT NOT NULL
        REFERENCES carritos(id)
        ON DELETE CASCADE,

    producto_id INT NOT NULL
        REFERENCES productos(id)
        ON DELETE RESTRICT,

    cantidad INT NOT NULL DEFAULT 1,
    precio_unitario DECIMAL(10,2) NOT NULL,

    comentario TEXT,

    diseno_torta_id INT NULL
        REFERENCES disenos_torta(id)
        ON DELETE RESTRICT,

    plantilla_diseno_id INT NULL
        REFERENCES plantillas_diseno(id)
        ON DELETE RESTRICT,

    diseno_personalizado_id INT NULL
        REFERENCES disenos_personalizados(id)
        ON DELETE RESTRICT,

    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_carrito_cantidad
        CHECK (cantidad > 0),

    CONSTRAINT chk_carrito_precio
        CHECK (precio_unitario >= 0),

    CONSTRAINT chk_carrito_configuracion
        CHECK (
            (CASE WHEN diseno_torta_id IS NOT NULL THEN 1 ELSE 0 END) +
            (CASE WHEN plantilla_diseno_id IS NOT NULL THEN 1 ELSE 0 END) +
            (CASE WHEN diseno_personalizado_id IS NOT NULL THEN 1 ELSE 0 END)
            <= 1
        )
);


-- ============================================================
-- 20. PEDIDOS
-- ============================================================

CREATE TABLE pedidos (
    id SERIAL PRIMARY KEY,

    usuario_id INT NOT NULL
        REFERENCES usuarios(id)
        ON DELETE RESTRICT,

    fecha_entrega DATE NOT NULL,

    estado VARCHAR(50) NOT NULL DEFAULT 'PENDIENTE',

    subtotal DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,

    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_pedido_estado
        CHECK (
            estado IN (
                'PENDIENTE',
                'EN_PREPARACION',
                'LISTO',
                'ENTREGADO'
            )
        ),

    CONSTRAINT chk_pedido_subtotal
        CHECK (subtotal >= 0),

    CONSTRAINT chk_pedido_total
        CHECK (total >= 0)
);


-- ============================================================
-- 21. DETALLES_PEDIDO
-- ============================================================

CREATE TABLE detalles_pedido (
    id SERIAL PRIMARY KEY,

    pedido_id INT NOT NULL
        REFERENCES pedidos(id)
        ON DELETE CASCADE,

    producto_id INT NOT NULL
        REFERENCES productos(id)
        ON DELETE RESTRICT,

    nombre_producto VARCHAR(150) NOT NULL,

    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,

    tipo_configuracion VARCHAR(50),
    nombre_diseno VARCHAR(100),
    costo_diseno DECIMAL(10,2) NOT NULL DEFAULT 0.00,

    indicaciones TEXT,

    diseno_torta_id INT NULL
        REFERENCES disenos_torta(id)
        ON DELETE SET NULL,

    plantilla_diseno_id INT NULL
        REFERENCES plantillas_diseno(id)
        ON DELETE SET NULL,

    diseno_personalizado_id INT NULL
        REFERENCES disenos_personalizados(id)
        ON DELETE SET NULL,

    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_pedido_detalle_cantidad
        CHECK (cantidad > 0),

    CONSTRAINT chk_pedido_detalle_precio
        CHECK (precio_unitario >= 0),

    CONSTRAINT chk_pedido_detalle_subtotal
        CHECK (subtotal >= 0),

    CONSTRAINT chk_pedido_detalle_costo_diseno
        CHECK (costo_diseno >= 0),

    CONSTRAINT chk_pedido_detalle_configuracion
        CHECK (
            (CASE WHEN diseno_torta_id IS NOT NULL THEN 1 ELSE 0 END) +
            (CASE WHEN plantilla_diseno_id IS NOT NULL THEN 1 ELSE 0 END) +
            (CASE WHEN diseno_personalizado_id IS NOT NULL THEN 1 ELSE 0 END)
            <= 1
        )
);


-- ============================================================
-- 22. CONFIGURACION_PRODUCCION
-- ============================================================

CREATE TABLE configuracion_produccion (
    id SERIAL PRIMARY KEY,

    fecha DATE NOT NULL,

    categoria_id INT NULL
        REFERENCES categorias(id)
        ON DELETE RESTRICT,

    capacidad_maxima INT NOT NULL,

    activo BOOLEAN NOT NULL DEFAULT TRUE,

    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_capacidad_maxima
        CHECK (capacidad_maxima > 0)
);


-- ============================================================
-- 23. PAGOS
-- ============================================================

CREATE TABLE pagos (
    id SERIAL PRIMARY KEY,

    pedido_id INT NOT NULL
        REFERENCES pedidos(id)
        ON DELETE CASCADE,

    metodo VARCHAR(50) NOT NULL,

    estado VARCHAR(50) NOT NULL DEFAULT 'PENDIENTE',

    monto DECIMAL(10,2) NOT NULL,

    referencia_pasarela VARCHAR(255) NULL,

    fecha_pago TIMESTAMP NULL,

    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_pago_metodo
        CHECK (
            metodo IN (
                'PASARELA',
                'TRANSFERENCIA'
            )
        ),

    CONSTRAINT chk_pago_estado
        CHECK (
            estado IN (
                'PENDIENTE',
                'APROBADO',
                'RECHAZADO'
            )
        ),

    CONSTRAINT chk_pago_monto
        CHECK (monto >= 0)
);


-- ============================================================
-- 24. COMPROBANTES_PAGO
-- ============================================================

CREATE TABLE comprobantes_pago (
    id SERIAL PRIMARY KEY,

    pago_id INT NOT NULL
        REFERENCES pagos(id)
        ON DELETE CASCADE,

    multimedia_id INT NOT NULL
        REFERENCES multimedia(id)
        ON DELETE RESTRICT,

    revisado_por_id INT NULL
        REFERENCES usuarios(id)
        ON DELETE SET NULL,

    fecha_revision TIMESTAMP NULL,
    comentario_revision TEXT,

    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- 25. NOTIFICACIONES
-- ============================================================

CREATE TABLE notificaciones (
    id SERIAL PRIMARY KEY,

    usuario_id INT NOT NULL
        REFERENCES usuarios(id)
        ON DELETE CASCADE,

    pedido_id INT NULL
        REFERENCES pedidos(id)
        ON DELETE SET NULL,

    pago_id INT NULL
        REFERENCES pagos(id)
        ON DELETE SET NULL,

    tipo VARCHAR(50) NOT NULL,

    titulo VARCHAR(150) NOT NULL,
    mensaje TEXT NOT NULL,

    leida BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_lectura TIMESTAMP NULL,

    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
); 


-- ============================================================
-- ÍNDICES ADICIONALES
-- ============================================================

CREATE INDEX idx_usuarios_rol
ON usuarios(rol_id);

CREATE INDEX idx_productos_categoria
ON productos(categoria_id);

CREATE INDEX idx_productos_activo
ON productos(activo);

CREATE INDEX idx_categorias_padre
ON categorias(categoria_padre_id);

CREATE INDEX idx_pedidos_usuario
ON pedidos(usuario_id);

CREATE INDEX idx_pedidos_fecha_entrega
ON pedidos(fecha_entrega);

CREATE INDEX idx_pedidos_estado
ON pedidos(estado);

CREATE INDEX idx_pagos_pedido
ON pagos(pedido_id);

CREATE INDEX idx_notificaciones_usuario
ON notificaciones(usuario_id);

CREATE INDEX idx_multimedia_subido_por
ON multimedia(subido_por_id);


-- ============================================================
-- DATOS INICIALES
-- ============================================================

INSERT INTO roles (id, nombre)
VALUES
    (1, 'ADMIN'),
    (2, 'CLIENTE');

SELECT setval(
    pg_get_serial_sequence('roles', 'id'),
    (SELECT MAX(id) FROM roles)
);


-- ============================================================
-- CONFIGURACIÓN INICIAL DE LA INSTALACIÓN
-- ============================================================

INSERT INTO configuracion_tienda (
    nombre_tienda,
    color_primario,
    color_secundario,
    color_acento,
    color_fondo,
    color_texto
)
VALUES (
    'Dulces Aesca',
    '#8B5CF6',
    '#EC4899',
    '#F59E0B',
    '#FFF7ED',
    '#1F2937'
);
