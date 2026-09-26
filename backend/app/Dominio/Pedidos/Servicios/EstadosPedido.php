<?php

declare(strict_types=1);

namespace App\Dominio\Pedidos\Servicios;

final class EstadosPedido
{
    private const SECUENCIA = ['PENDIENTE', 'EN_PREPARACION', 'LISTO', 'ENTREGADO'];

    public static function admite(string $actual, string $siguiente): bool
    {
        $indice = array_search($actual, self::SECUENCIA, true);

        return $indice !== false && (self::SECUENCIA[$indice + 1] ?? null) === $siguiente;
    }
}
