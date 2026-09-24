<?php

declare(strict_types=1);

namespace App\Dominio\Produccion\Excepciones;

use App\Dominio\Compartido\Excepciones\DominioException;

final class ConfiguracionProduccionNoEncontradaException extends DominioException
{
    public function __construct()
    {
        parent::__construct(
            'No existe capacidad de produccion configurada para la fecha y categoria solicitadas.',
            'PRD_CAPACIDAD_NO_CONFIGURADA',
            404,
        );
    }
}
