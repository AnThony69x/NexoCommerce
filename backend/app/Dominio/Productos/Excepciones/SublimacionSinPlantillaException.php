<?php

declare(strict_types=1);

namespace App\Dominio\Productos\Excepciones;

use App\Dominio\Compartido\Excepciones\DominioException;

final class SublimacionSinPlantillaException extends DominioException
{
    public function __construct()
    {
        parent::__construct(
            'Una sublimacion activa requiere al menos una plantilla activa.',
            'PROD_SUBLIMACION_SIN_PLANTILLA',
            400,
        );
    }
}
