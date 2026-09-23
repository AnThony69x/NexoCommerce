<?php

declare(strict_types=1);

namespace App\Dominio\Autenticacion\Excepciones;

use App\Dominio\Compartido\Excepciones\DominioException;

final class UltimoAdminException extends DominioException
{
    public function __construct()
    {
        parent::__construct(
            'No se puede realizar esta operacion: el sistema debe conservar al menos un administrador activo.',
            'USR_ULTIMO_ADMIN',
            400,
        );
    }
}
