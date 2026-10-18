-- 12. DATOS INICIALES
-- ============================================================
INSERT INTO auth.roles (nombre) VALUES ('ADMIN'), ('CLIENTE');

INSERT INTO tienda.configuracion_tienda
    (nombre_tienda, color_primario, color_secundario, color_acento, color_fondo, color_texto)
VALUES
    ('Dulces Aesca', '#8B5CF6', '#EC4899', '#F59E0B', '#FFF7ED', '#1F2937');
