<?php

declare(strict_types=1);

namespace App\Dominio\Categorias\Excepciones;

use App\Dominio\Compartido\Excepciones\DominioException;

final class CategoriaConProductosException extends DominioException
{
    public function __construct()
    {
        parent::__construct(
            'La categoria tiene productos activos asociados.',
            'CAT_CON_PRODUCTOS',
            400,
        );
    }
}
