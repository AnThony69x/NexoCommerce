<?php

declare(strict_types=1);

namespace App\Aplicacion\Categorias\DTOs;

final readonly class CrearCategoriaDTO
{
    public function __construct(
        public ?int $categoria_padre_id,
        public string $nombre,
        public ?string $descripcion,
        public ?int $imagen_id,
        public bool $activo,
    ) {}
}
