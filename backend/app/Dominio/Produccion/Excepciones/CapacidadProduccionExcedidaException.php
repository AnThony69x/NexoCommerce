<?php

declare(strict_types=1);

namespace App\Dominio\Produccion\Excepciones;

use App\Dominio\Compartido\Excepciones\DominioException;

final class CapacidadProduccionExcedidaException extends DominioException
{
    public function __construct()
    {
        parent::__construct(
            'No existe capacidad de produccion suficiente para la fecha solicitada.',
            'PED_SIN_CAPACIDAD',
            400,
        );
    }
}
