<?php

declare(strict_types=1);

namespace App\Dominio\Notificaciones\Eventos;

final readonly class PagoRegistrado
{
    public function __construct(public int $pagoId, public int $pedidoId) {}
}
