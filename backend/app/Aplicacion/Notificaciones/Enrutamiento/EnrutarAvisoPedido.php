<?php

declare(strict_types=1);

namespace App\Aplicacion\Notificaciones\Enrutamiento;

final readonly class EnrutarAvisoPedido
{
    public function __construct(
        private AvisarPreparacion $preparacion,
        private AvisarEntrega $entrega,
        private AvisarCancelacion $cancelacion,
    ) {}

    public function enrutar(string $tipo, int $pedidoId, int $usuarioId): string
    {
        return match ($tipo) {
            'PEDIDO_EN_PREPARACION' => $this->preparacion->procesar($pedidoId, $usuarioId),
            'PEDIDO_LISTO', 'PEDIDO_ENTREGADO' => $this->entrega->procesar($tipo, $pedidoId, $usuarioId),
            'PEDIDO_CANCELADO' => $this->cancelacion->procesar($pedidoId, $usuarioId),
            default => 'no_enrutables',
        };
    }
}
