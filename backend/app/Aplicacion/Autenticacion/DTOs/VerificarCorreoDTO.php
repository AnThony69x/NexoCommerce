<?php

declare(strict_types=1);

namespace App\Aplicacion\Autenticacion\DTOs;

final readonly class VerificarCorreoDTO
{
    public function __construct(
        public string $codigo,
    ) {}
}
