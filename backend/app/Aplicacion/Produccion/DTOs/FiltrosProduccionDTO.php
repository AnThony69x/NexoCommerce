<?php

declare(strict_types=1);

namespace App\Aplicacion\Produccion\DTOs;

final readonly class FiltrosProduccionDTO
{
    public function __construct(
        public ?string $fecha = null,
        public ?int $categoria_id = null,
        public ?bool $activo = null,
    ) {}

    /** @return array<string, bool|int|string|null> */
    public function toArray(): array
    {
        return get_object_vars($this);
    }
}
