<?php

declare(strict_types=1);

namespace App\Aplicacion\Notificaciones\Enrutamiento;

final readonly class ProcesarMensajePedido
{
    public function __construct(private FiltrarAvisoPedido $filtro, private EnrutarAvisoPedido $enrutador) {}

    /** @return array{resultado: string, destino: ?string, motivo: ?string} */
    public function ejecutar(array $mensaje): array
    {
        $id = $mensaje['id'] ?? null;
        $tipo = $mensaje['tipo'] ?? null;
        $prioridad = $mensaje['prioridad'] ?? null;
        $datos = $mensaje['datos'] ?? null;

        if (! is_string($id) || trim($id) === '' || strlen($id) > 100
            || ! is_string($tipo) || trim($tipo) === '' || strlen($tipo) > 50
            || ! in_array($prioridad, ['normal', 'alta'], true)
            || ! is_array($datos)
            || ! $this->esIdPositivo($datos['pedido_id'] ?? null)
            || ! $this->esIdPositivo($datos['usuario_id'] ?? null)) {
            return ['resultado' => 'invalido', 'destino' => null, 'motivo' => 'contrato_invalido'];
        }

        if (! $this->filtro->acepta($tipo)) {
            return ['resultado' => 'filtrado', 'destino' => null, 'motivo' => 'aviso_inicial_cubierto'];
        }

        $destino = $this->enrutador->enrutar($tipo, $datos['pedido_id'], $datos['usuario_id']);

        return $destino === 'no_enrutables'
            ? ['resultado' => 'no_enrutable', 'destino' => $destino, 'motivo' => 'tipo_desconocido']
            : ['resultado' => 'procesado', 'destino' => $destino, 'motivo' => null];
    }

    private function esIdPositivo(mixed $valor): bool
    {
        return is_int($valor) && $valor > 0;
    }
}
