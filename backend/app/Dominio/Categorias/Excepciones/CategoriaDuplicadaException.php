<?php

declare(strict_types=1);

namespace App\Dominio\Categorias\Excepciones;

use App\Dominio\Compartido\Excepciones\DominioException;

final class CategoriaDuplicadaException extends DominioException
{
    public function __construct(?\Throwable $previous = null)
    {
        parent::__construct(
            'Ya existe una categoria con el mismo nombre dentro del padre indicado.',
            'CAT_NOMBRE_DUPLICADO',
            422,
            $previous,
        );
    }
}
