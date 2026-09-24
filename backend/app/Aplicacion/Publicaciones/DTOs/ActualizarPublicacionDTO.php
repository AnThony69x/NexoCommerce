<?php

declare(strict_types=1);

namespace App\Aplicacion\Publicaciones\DTOs;

final readonly class ActualizarPublicacionDTO
{
    /** @param array<string, mixed> $datos */
    public function __construct(public array $datos) {}
}
