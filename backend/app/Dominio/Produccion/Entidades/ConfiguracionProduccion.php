<?php

declare(strict_types=1);

namespace App\Dominio\Produccion\Entidades;

use DateTimeImmutable;

final readonly class ConfiguracionProduccion
{
    public function __construct(
        public int $id,
        public string $fecha,
        public ?int $categoria_id,
        public int $capacidad_maxima,
        public bool $activo,
        public int $ocupado,
        public DateTimeImmutable $creado_en,
        public DateTimeImmutable $actualizado_en,
    ) {}

    public function disponible(): int
    {
        return max(0, $this->capacidad_maxima - $this->ocupado);
    }

    public function admite(int $cantidadAdicional): bool
    {
        return $cantidadAdicional <= $this->disponible();
    }
}
