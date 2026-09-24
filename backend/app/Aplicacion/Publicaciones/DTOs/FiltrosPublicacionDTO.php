<?php

declare(strict_types=1);

namespace App\Aplicacion\Publicaciones\DTOs;

final readonly class FiltrosPublicacionDTO
{
    public function __construct(
        public ?int $categoria_id = null,
        public ?int $producto_id = null,
        public int $page = 1,
        public bool $incluir_inactivas = false,
    ) {}

    /** @return array{categoria_id: ?int, producto_id: ?int, page: int} */
    public function filtros(): array
    {
        return [
            'categoria_id' => $this->categoria_id,
            'producto_id' => $this->producto_id,
            'page' => $this->page,
        ];
    }
}
