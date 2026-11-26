<?php

declare(strict_types=1);

namespace App\Aplicacion\Notificaciones\Enrutamiento;

final class FiltrarAvisoPedido
{
    public function acepta(string $tipo): bool
    {
        return $tipo !== 'PEDIDO_PENDIENTE';
    }
}
