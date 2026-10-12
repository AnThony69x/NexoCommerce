<?php

declare(strict_types=1);

namespace App\Dominio\Notificaciones\Eventos;

final readonly class PedidoCreado
{
    public function __construct(public int $pedidoId, public int $usuarioId) {}
}
