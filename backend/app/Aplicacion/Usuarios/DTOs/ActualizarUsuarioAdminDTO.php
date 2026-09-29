<?php

declare(strict_types=1);

namespace App\Aplicacion\Usuarios\DTOs;

final readonly class ActualizarUsuarioAdminDTO
{
    public function __construct(
        /** ADMIN | CLIENTE | null (sin cambio) */
        public ?string $rol,
        public ?bool $activo,
    ) {}
}
