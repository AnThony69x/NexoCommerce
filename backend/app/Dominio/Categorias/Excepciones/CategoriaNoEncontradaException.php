<?php

declare(strict_types=1);

namespace App\Dominio\Categorias\Excepciones;

use App\Dominio\Compartido\Excepciones\DominioException;

final class CategoriaNoEncontradaException extends DominioException
{
    public function __construct()
    {
        parent::__construct(
            'La categoria no existe.',
            'CAT_NO_ENCONTRADA',
            404,
        );
    }
}
