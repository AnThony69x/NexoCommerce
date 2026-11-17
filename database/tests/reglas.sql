-- Ejecutar después de instalar.sql en una base de prueba sin datos de negocio.
-- Todos los datos de prueba se revierten al finalizar.
\set ON_ERROR_STOP on
BEGIN;
CREATE FUNCTION pg_temp.rechaza(q TEXT) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
    BEGIN EXECUTE q;
    EXCEPTION WHEN check_violation THEN RETURN;
    END;
    RAISE EXCEPTION 'Se aceptó una operación inválida: %', q;
END $$;
CREATE FUNCTION pg_temp.verifica(ok BOOLEAN) RETURNS void LANGUAGE plpgsql AS $$
BEGIN IF ok IS DISTINCT FROM TRUE THEN RAISE EXCEPTION 'Verificación fallida'; END IF; END $$;

INSERT INTO auth.usuarios(rol_id,nombre_completo,correo)
SELECT id,'Prueba SQL','prueba@example.test' FROM auth.roles WHERE nombre='CLIENTE';
INSERT INTO catalogo.categorias(nombre) VALUES ('Prueba A'),('Prueba B');
INSERT INTO catalogo.productos(categoria_id,tipo,nombre,precio_base)
SELECT id,'DETALLE','Prueba detalle',10 FROM catalogo.categorias WHERE nombre='Prueba A';
INSERT INTO catalogo.detalles(producto_id,stock) SELECT id,10 FROM catalogo.productos;
INSERT INTO media.multimedia(nombre_archivo,ruta_archivo,tipo_mime,tamano_bytes,ancho,alto)
SELECT 'imagen','prueba/'||n,'image/png',100,800,800 FROM generate_series(1,10) n;
INSERT INTO media.multimedia(nombre_archivo,ruta_archivo,tipo_mime,tamano_bytes,modulo)
VALUES ('pdf','prueba/pdf','application/pdf',100,'COMPROBANTE');
INSERT INTO catalogo.producto_multimedia(producto_id,multimedia_id)
SELECT p.id,m.id FROM catalogo.productos p CROSS JOIN media.multimedia m WHERE m.ruta_archivo IN
('prueba/1','prueba/2','prueba/3','prueba/4','prueba/5','prueba/6','prueba/7','prueba/8');
UPDATE catalogo.producto_multimedia SET multimedia_id=(SELECT id FROM media.multimedia WHERE ruta_archivo='prueba/9')
WHERE multimedia_id=(SELECT id FROM media.multimedia WHERE ruta_archivo='prueba/1');
SELECT pg_temp.verifica((SELECT count(*)=8 FROM catalogo.producto_multimedia));
SELECT pg_temp.rechaza('INSERT INTO catalogo.producto_multimedia SELECT p.id,m.id,0,false FROM catalogo.productos p CROSS JOIN media.multimedia m WHERE m.ruta_archivo=''prueba/10''');
SELECT pg_temp.rechaza('UPDATE media.multimedia SET ancho=1 WHERE ruta_archivo=''prueba/9''');
SELECT pg_temp.rechaza('INSERT INTO publicaciones.publicaciones(usuario_id,titulo,estado) SELECT id,''Prueba'',''PUBLICADA'' FROM auth.usuarios');
INSERT INTO publicaciones.publicaciones(usuario_id,titulo) SELECT id,'Prueba' FROM auth.usuarios;
SELECT pg_temp.rechaza('INSERT INTO publicaciones.publicacion_multimedia SELECT p.id,m.id,1 FROM publicaciones.publicaciones p CROSS JOIN media.multimedia m WHERE tipo_mime=''application/pdf''');
SELECT pg_temp.rechaza('INSERT INTO notificaciones.notificaciones(usuario_id,tipo,titulo,mensaje,estado_envio) SELECT id,''PRUEBA'',''Prueba'',''Prueba'',''ENVIADA'' FROM auth.usuarios');
SELECT pg_temp.rechaza('INSERT INTO ventas.pedidos(usuario_id,fecha_entrega,subtotal,total,tipo_entrega,direccion_entrega) SELECT id,current_date,10,10,''DOMICILIO'',''   '' FROM auth.usuarios');
INSERT INTO ventas.pedidos(usuario_id,fecha_entrega,subtotal,total) SELECT id,current_date,10,10 FROM auth.usuarios;
SELECT pg_temp.rechaza('UPDATE ventas.pedidos SET estado_pago=''APROBADO''');
INSERT INTO pagos.pagos(pedido_id,metodo,estado,monto) SELECT id,'TRANSFERENCIA','APROBADO',4 FROM ventas.pedidos;
SELECT pg_temp.verifica((SELECT estado_pago='PENDIENTE' FROM ventas.pedidos));
INSERT INTO pagos.pagos(pedido_id,metodo,estado,monto) SELECT id,'TRANSFERENCIA','APROBADO',6 FROM ventas.pedidos;
SELECT pg_temp.verifica((SELECT estado_pago='APROBADO' FROM ventas.pedidos));
DELETE FROM pagos.pagos WHERE monto=6;
SELECT pg_temp.verifica((SELECT estado_pago='PENDIENTE' FROM ventas.pedidos));
UPDATE catalogo.categorias SET categoria_padre_id=(SELECT id FROM catalogo.categorias WHERE nombre='Prueba A') WHERE nombre='Prueba B';
SELECT pg_temp.rechaza('UPDATE catalogo.categorias SET categoria_padre_id=(SELECT id FROM catalogo.categorias WHERE nombre=''Prueba B'') WHERE nombre=''Prueba A''');
SELECT pg_temp.rechaza('SELECT catalogo.descontar_stock(id,-1) FROM catalogo.productos');
SELECT catalogo.descontar_stock(id,3) FROM catalogo.productos;
SELECT pg_temp.verifica((SELECT stock=7 FROM catalogo.detalles));
INSERT INTO catalogo.productos(categoria_id,tipo,nombre,precio_base)
SELECT id,'TORTA','Prueba torta',20 FROM catalogo.categorias WHERE nombre='Prueba A';
INSERT INTO ventas.disenos_personalizados(usuario_id,producto_id,tipo_producto,multimedia_id)
SELECT u.id,p.id,p.tipo,m.id FROM auth.usuarios u CROSS JOIN catalogo.productos p CROSS JOIN media.multimedia m
WHERE p.tipo='TORTA' AND m.ruta_archivo='prueba/2';
SELECT pg_temp.verifica((SELECT estado_cotizacion='PENDIENTE' AND costo_adicional IS NULL FROM ventas.disenos_personalizados));
ROLLBACK;
\echo Pruebas de reglas completadas; datos revertidos.
