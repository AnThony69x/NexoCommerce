<?php

declare(strict_types=1);

namespace App\Aplicacion\Notificaciones\Enrutamiento;

use App\Dominio\Notificaciones\Repositorios\NotificacionRepositorioInterface;

final readonly class AvisarCancelacion
{
    public function __construct(private NotificacionRepositorioInterface $repositorio) {}

    public function procesar(int $pedidoId, int $usuarioId): string
    {
        $estado = 'CANCELADO';
        $this->repositorio->guardar(
            $usuarioId, $pedidoId, null, 'PEDIDO_CANCELADO', 'Pedido cancelado',
            "Tu pedido {$pedidoId} ahora esta {$estado}.",
        );

        return 'cancelacion';
    }
}
