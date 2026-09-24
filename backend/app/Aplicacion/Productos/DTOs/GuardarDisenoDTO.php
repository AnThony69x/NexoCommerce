<?php

declare(strict_types=1);

namespace App\Aplicacion\Productos\DTOs;

final readonly class GuardarDisenoDTO
{
    /** @param array<string, mixed> $datos */
    public function __construct(public array $datos) {}
}
