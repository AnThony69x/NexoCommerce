<?php

declare(strict_types=1);

namespace App\Dominio\Productos\Excepciones;

use App\Dominio\Compartido\Excepciones\DominioException;

final class TipoProductoInmutableException extends DominioException
{
    public function __construct()
    {
        parent::__construct('El tipo del producto no puede modificarse.', 'PROD_TIPO_INMUTABLE', 400);
    }
}
