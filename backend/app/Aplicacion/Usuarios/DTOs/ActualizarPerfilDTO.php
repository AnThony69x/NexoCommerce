<?php

declare(strict_types=1);

namespace App\Aplicacion\Usuarios\DTOs;

final readonly class ActualizarPerfilDTO
{
    public function __construct(
        public string $nombre_completo,
        public ?string $telefono,
    ) {}
}
