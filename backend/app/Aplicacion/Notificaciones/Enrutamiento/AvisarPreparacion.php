<?php

declare(strict_types=1);

namespace App\Aplicacion\Notificaciones\Enrutamiento;

use App\Dominio\Notificaciones\Repositorios\NotificacionRepositorioInterface;

final readonly class AvisarPreparacion
{
    public function __construct(private NotificacionRepositorioInterface $repositorio) {}

    public function procesar(int $pedidoId, int $usuarioId): string
    {
        $estado = 'EN_PREPARACION';
        $this->repositorio->guardar(
            $usuarioId, $pedidoId, null, 'PEDIDO_EN_PREPARACION', 'Pedido en preparacion',
            "Tu pedido {$pedidoId} ahora esta {$estado}.",
        );

        return 'preparacion';
    }
}
