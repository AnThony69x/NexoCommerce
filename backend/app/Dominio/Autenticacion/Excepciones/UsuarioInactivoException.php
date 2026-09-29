<?php

declare(strict_types=1);

namespace App\Dominio\Autenticacion\Excepciones;

use App\Dominio\Compartido\Excepciones\DominioException;

final class UsuarioInactivoException extends DominioException
{
    public function __construct()
    {
        parent::__construct(
            'La cuenta de usuario esta desactivada.',
            'AUTH_USUARIO_INACTIVO',
            403,
        );
    }
}
