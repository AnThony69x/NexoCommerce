<?php

declare(strict_types=1);

namespace App\Dominio\Productos\Excepciones;

use App\Dominio\Compartido\Excepciones\DominioException;

final class EspecializacionNoEncontradaException extends DominioException
{
    public function __construct(string $recurso = 'Especializacion')
    {
        parent::__construct("{$recurso} no encontrada.", 'PROD_ESPECIALIZACION_NO_ENCONTRADA', 404);
    }
}
