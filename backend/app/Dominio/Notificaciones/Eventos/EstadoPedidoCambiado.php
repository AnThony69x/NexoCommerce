<?php

declare(strict_types=1);

namespace App\Dominio\Notificaciones\Eventos;

final readonly class EstadoPedidoCambiado
{
    public function __construct(public int $pedidoId, public int $usuarioId, public string $estado) {}

    /** @return array{id: string, tipo: string, prioridad: string, datos: array{pedido_id: int, usuario_id: int}} */
    public function mensaje(): array
    {
        return [
            'id' => "pedido-{$this->pedidoId}-{$this->estado}",
            'tipo' => 'PEDIDO_'.$this->estado,
            'prioridad' => $this->estado === 'CANCELADO' ? 'alta' : 'normal',
            'datos' => ['pedido_id' => $this->pedidoId, 'usuario_id' => $this->usuarioId],
        ];
    }
}
