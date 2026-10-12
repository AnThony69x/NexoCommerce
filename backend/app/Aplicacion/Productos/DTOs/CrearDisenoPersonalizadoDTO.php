<?php

declare(strict_types=1);

namespace App\Aplicacion\Productos\DTOs;

final readonly class CrearDisenoPersonalizadoDTO
{
    public function __construct(
        public int $sublimacion_id,
        public int $multimedia_id,
        public ?string $indicaciones,
    ) {}

    /** @return array{sublimacion_id: int, multimedia_id: int, indicaciones: string|null} */
    public function toArray(): array
    {
        return get_object_vars($this);
    }
}
