<?php

declare(strict_types=1);

namespace App\Dominio\Productos\Entidades;

final readonly class PlantillaDiseno
{
    public function __construct(
        public int $id,
        public int $sublimacion_id,
        public string $nombre,
        public ?string $descripcion,
        public string $costo_adicional,
        public ?int $multimedia_id,
        public bool $activo,
    ) {}
}
