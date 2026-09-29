<?php

declare(strict_types=1);

namespace App\Dominio\Productos\Excepciones;

use App\Dominio\Compartido\Excepciones\DominioException;

final class DisenoNoEncontradoException extends DominioException
{
    public function __construct()
    {
        parent::__construct('Diseno o plantilla no encontrado.', 'PROD_DISENO_NO_ENCONTRADO', 404);
    }
}
