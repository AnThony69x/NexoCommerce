<?php

declare(strict_types=1);

namespace App\Aplicacion\Produccion\DTOs;

final readonly class CrearConfiguracionProduccionDTO
{
    public function __construct(
        public string $fecha,
        public ?int $categoria_id,
        public int $capacidad_maxima,
        public bool $activo,
    ) {}

    /** @return array{fecha: string, categoria_id: ?int, capacidad_maxima: int, activo: bool} */
    public function toArray(): array
    {
        return get_object_vars($this);
    }
}
