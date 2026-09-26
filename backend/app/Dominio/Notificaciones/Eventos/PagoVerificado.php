<?php

declare(strict_types=1);

namespace App\Dominio\Notificaciones\Eventos;

final readonly class PagoVerificado
{
    public function __construct(public int $pagoId, public int $pedidoId, public int $usuarioId, public string $estado) {}
}
