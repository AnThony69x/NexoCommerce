<?php

declare(strict_types=1);

namespace App\Aplicacion\Categorias\DTOs;

final readonly class ActualizarCategoriaDTO
{
    public function __construct(
        public string $nombre,
        public bool $incluye_categoria_padre_id,
        public ?int $categoria_padre_id,
        public bool $incluye_descripcion,
        public ?string $descripcion,
        public bool $incluye_imagen_id,
        public ?int $imagen_id,
        public ?bool $activo,
    ) {}
}
