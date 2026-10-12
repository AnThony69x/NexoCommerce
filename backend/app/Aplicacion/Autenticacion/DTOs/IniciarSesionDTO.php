<?php

declare(strict_types=1);

namespace App\Aplicacion\Autenticacion\DTOs;

final readonly class IniciarSesionDTO
{
    public function __construct(
        public string $correo,
        public string $password,
        public ?string $device_name,
    ) {}
}
