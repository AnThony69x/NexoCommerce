<?php

declare(strict_types=1);

namespace App\Dominio\Autenticacion\Excepciones;

use App\Dominio\Compartido\Excepciones\DominioException;

final class PasswordActualIncorrectoException extends DominioException
{
    public function __construct()
    {
        parent::__construct(
            'La contrasena actual proporcionada es incorrecta.',
            'AUTH_PASSWORD_ACTUAL_INCORRECTO',
            400,
        );
    }
}
