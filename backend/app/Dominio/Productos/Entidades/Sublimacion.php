<?php

declare(strict_types=1);

namespace App\Dominio\Productos\Entidades;

final readonly class Sublimacion
{
    /** @param list<PlantillaDiseno> $plantillas */
    public function __construct(
        public int $producto_id,
        public string $tipo_material,
        public array $plantillas = [],
    ) {}
}
