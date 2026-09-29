<?php

declare(strict_types=1);

namespace App\Dominio\Pagos\Servicios;

use App\Dominio\Carrito\Servicios\ReglasCarrito;

final class ReglasPago
{
    public static function montoCoincide(string $enviado, string $totalPedido): bool
    {
        return ReglasCarrito::centavos($enviado) === ReglasCarrito::centavos($totalPedido);
    }

    public static function puedeVerificarse(string $estadoActual, string $nuevoEstado): bool
    {
        return $estadoActual === 'PENDIENTE' && in_array($nuevoEstado, ['APROBADO', 'RECHAZADO'], true);
    }
}
