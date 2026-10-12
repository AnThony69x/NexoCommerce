<?php

declare(strict_types=1);

namespace App\Dominio\Categorias\Excepciones;

use App\Dominio\Compartido\Excepciones\DominioException;

final class CategoriaPadreInvalidaException extends DominioException
{
    public function __construct()
    {
        parent::__construct(
            'La categoria padre es invalida porque no existe o genera un ciclo.',
            'CAT_PADRE_INVALIDO',
            422,
        );
    }
}
