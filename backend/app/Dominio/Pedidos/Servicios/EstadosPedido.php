<?php

declare(strict_types=1);

namespace App\Dominio\Pedidos\Servicios;

final class EstadosPedido
{
    /** Coincide con ventas.fn_validar_estado_pedido del esquema. */
    private const TRANSICIONES = [
        'PENDIENTE' => ['EN_PREPARACION', 'CANCELADO'],
        'EN_PREPARACION' => ['LISTO', 'CANCELADO'],
        'LISTO' => ['ENTREGADO'],
    ];

    public static function admite(string $actual, string $siguiente): bool
    {
        return in_array($siguiente, self::TRANSICIONES[$actual] ?? [], true);
    }
}
