<?php

declare(strict_types=1);

namespace App\Dominio\Productos\Excepciones;

use App\Dominio\Compartido\Excepciones\DominioException;

final class ProductoNoEncontradoException extends DominioException
{
    public function __construct()
    {
        parent::__construct('Producto no encontrado.', 'PROD_NO_ENCONTRADO', 404);
    }
}
