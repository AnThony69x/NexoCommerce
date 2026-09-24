<?php

declare(strict_types=1);

namespace App\Dominio\Multimedia\Excepciones;

use App\Dominio\Compartido\Excepciones\DominioException;

final class MultimediaNoAutorizadaException extends DominioException
{
    public function __construct()
    {
        parent::__construct(
            'No tienes permiso para modificar este archivo.',
            'MED_NO_AUTORIZADO',
            403,
        );
    }
}
