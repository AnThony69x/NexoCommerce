<?php

declare(strict_types=1);

namespace App\Dominio\Autenticacion\Excepciones;

use App\Dominio\Compartido\Excepciones\DominioException;

final class CodigoVerificacionInvalidoException extends DominioException
{
    public function __construct()
    {
        parent::__construct(
            'El codigo de verificacion es invalido, ya fue usado o ha expirado.',
            'AUTH_CODIGO_INVALIDO',
            400,
        );
    }
}
