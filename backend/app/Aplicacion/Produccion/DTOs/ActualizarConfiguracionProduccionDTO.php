<?php

declare(strict_types=1);

namespace App\Aplicacion\Produccion\DTOs;

final readonly class ActualizarConfiguracionProduccionDTO
{
    /** @param array<string, bool|int|string|null> $datos */
    public function __construct(public array $datos) {}
}
