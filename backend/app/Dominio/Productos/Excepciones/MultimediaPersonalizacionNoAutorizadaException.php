<?php

declare(strict_types=1);

namespace App\Dominio\Productos\Excepciones;

use App\Dominio\Compartido\Excepciones\DominioException;

final class MultimediaPersonalizacionNoAutorizadaException extends DominioException
{
    public function __construct()
    {
        parent::__construct(
            'La multimedia debe pertenecer al cliente autenticado y estar activa.',
            'PROD_MULTIMEDIA_NO_AUTORIZADA',
            403,
        );
    }
}
