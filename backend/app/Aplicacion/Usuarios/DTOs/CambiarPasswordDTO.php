<?php

declare(strict_types=1);

namespace App\Aplicacion\Usuarios\DTOs;

final readonly class CambiarPasswordDTO
{
    public function __construct(
        public string $password_actual,
        public string $password_nueva,
    ) {}
}
