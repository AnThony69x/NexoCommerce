-- Verifica que el rol de la aplicacion (nexo_backend) no puede hacer lo que el esquema le prohibe.
-- Ejecutar como nexo_backend: psql -U nexo_backend -d <base> -v ON_ERROR_STOP=1 -f backend/tests/Sql/permisos_nexo_backend.sql
-- Cada operacion prohibida debe fallar con insufficient_privilege (42501); si alguna pasa, el script falla.

DO $$
DECLARE
    prohibida TEXT;
BEGIN
    FOREACH prohibida IN ARRAY ARRAY[
        'DELETE FROM ventas.pedidos',
        'INSERT INTO ventas.pedido_historial_estado (pedido_id, estado_anterior, estado_nuevo) VALUES (1, NULL, ''PENDIENTE'')',
        'UPDATE ventas.pedido_historial_estado SET estado_nuevo = estado_nuevo',
        'DELETE FROM ventas.pedido_historial_estado',
        'SELECT 1 FROM auditoria.auditoria_catalogo LIMIT 1',
        'DELETE FROM auditoria.auditoria_catalogo',
        'UPDATE auditoria.auditoria_catalogo SET tabla = tabla',
        'TRUNCATE auditoria.auditoria_catalogo',
        'SELECT 1 FROM auditoria_control.politicas LIMIT 1'
    ] LOOP
        BEGIN
            EXECUTE prohibida;
            RAISE EXCEPTION 'PERMITIDO y debia rechazarse: %', prohibida;
        EXCEPTION
            WHEN insufficient_privilege THEN
                RAISE NOTICE 'OK rechazada: %', prohibida;
        END;
    END LOOP;
END $$;

-- Lo que la aplicacion si necesita debe seguir funcionando.
SELECT 1 FROM ventas.pedidos LIMIT 1;
SELECT 1 FROM catalogo.detalles LIMIT 1;
