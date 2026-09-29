<?php

declare(strict_types=1);

namespace App\Dominio\Produccion\Excepciones;

use App\Dominio\Compartido\Excepciones\DominioException;

final class ConfiguracionProduccionDuplicadaException extends DominioException
{
    public function __construct()
    {
        parent::__construct(
            'Ya existe una configuracion activa para la fecha y categoria indicadas.',
            'PRD_CONFIG_DUPLICADA',
            422,
        );
    }
}
