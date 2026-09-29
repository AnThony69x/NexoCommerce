<?php

declare(strict_types=1);

namespace App\Dominio\Tienda\Excepciones;

use App\Dominio\Compartido\Excepciones\DominioException;

final class ConfiguracionTiendaNoEncontradaException extends DominioException
{
    public function __construct()
    {
        parent::__construct(
            'La configuracion activa de la tienda no existe.',
            'TND_NO_ENCONTRADA',
            404,
        );
    }
}
