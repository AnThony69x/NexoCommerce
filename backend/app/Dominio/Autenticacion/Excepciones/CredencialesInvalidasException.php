<?php

declare(strict_types=1);

namespace App\Dominio\Autenticacion\Excepciones;

use App\Dominio\Compartido\Excepciones\DominioException;

final class CredencialesInvalidasException extends DominioException
{
    public function __construct()
    {
        parent::__construct(
            'Las credenciales proporcionadas son incorrectas.',
            'AUTH_CREDENCIALES_INVALIDAS',
            401,
        );
    }
}
