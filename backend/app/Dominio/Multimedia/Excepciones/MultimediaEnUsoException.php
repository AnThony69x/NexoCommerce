<?php

declare(strict_types=1);

namespace App\Dominio\Multimedia\Excepciones;

use App\Dominio\Compartido\Excepciones\DominioException;

final class MultimediaEnUsoException extends DominioException
{
    public function __construct()
    {
        parent::__construct(
            'El archivo no puede desactivarse porque esta referenciado por un comprobante o diseno personalizado.',
            'MED_EN_USO',
            400,
        );
    }
}
