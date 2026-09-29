<?php

declare(strict_types=1);

namespace App\Dominio\Autenticacion\Excepciones;

use App\Dominio\Compartido\Excepciones\DominioException;

final class SinPasswordLocalException extends DominioException
{
    public function __construct()
    {
        parent::__construct(
            'Esta cuenta fue creada con OAuth y no tiene contrasena local.',
            'AUTH_SIN_PASSWORD_LOCAL',
            400,
        );
    }
}
