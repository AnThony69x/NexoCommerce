-- Vistas de consulta, no conceden capacidad de purga.
CREATE VIEW auditoria_control.v_politicas_cortes AS
SELECT dominio, version, meses_activos, meses_totales,
 (transaction_timestamp() - make_interval(months => meses_activos)) AS corte_activo_referencia,
 (transaction_timestamp() - make_interval(months => meses_totales)) AS corte_total_referencia
FROM auditoria_control.politicas;
