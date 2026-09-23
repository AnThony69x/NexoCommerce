<?php

declare(strict_types=1);

namespace App\Aplicacion\Autenticacion\DTOs;

final readonly class RegistrarClienteDTO
{
    public function __construct(
        public string $nombre_completo,
        public string $correo,
        public string $password,
        public ?string $telefono,
        public bool $terminos_aceptados,
        public string $version_terminos,
    ) {}
}
