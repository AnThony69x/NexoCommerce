<?php

declare(strict_types=1);

namespace App\Aplicacion\Productos\DTOs;

final readonly class FiltrosProductoDTO
{
    public function __construct(
        public ?int $categoria_id = null,
        public ?string $tipo = null,
        public ?string $buscar = null,
        public ?float $precio_min = null,
        public ?float $precio_max = null,
        public ?int $porciones_min = null,
        public ?int $porciones_max = null,
        public ?string $sabor = null,
        public string $ordenar = 'recientes',
        public int $page = 1,
    ) {}

    /** @return array<string, int|float|string|null> */
    public function toArray(): array
    {
        return get_object_vars($this);
    }
}
