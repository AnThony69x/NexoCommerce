<?php

declare(strict_types=1);

namespace App\Dominio\Multimedia\Excepciones;

use App\Dominio\Compartido\Excepciones\DominioException;

final class MultimediaNoEncontradaException extends DominioException
{
    public function __construct()
    {
        parent::__construct(
            'El archivo multimedia no existe o ha sido desactivado.',
            'MED_NO_ENCONTRADO',
            404,
        );
    }
}
