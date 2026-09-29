<?php

declare(strict_types=1);

namespace App\Dominio\Publicaciones\Excepciones;

use App\Dominio\Compartido\Excepciones\DominioException;

final class PublicacionNoEncontradaException extends DominioException
{
    public function __construct()
    {
        parent::__construct('Publicacion no encontrada.', 'PUB_NO_ENCONTRADA', 404);
    }
}
