<?php

declare(strict_types=1);

namespace App\Dominio\Autenticacion\Excepciones;

use App\Dominio\Compartido\Excepciones\DominioException;

final class CuentaBloqueadaException extends DominioException
{
    public function __construct()
    {
        parent::__construct(
            'Cuenta bloqueada temporalmente por intentos fallidos.',
            'AUTH_CUENTA_BLOQUEADA',
            429,
        );
    }
}
