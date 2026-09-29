<?php

declare(strict_types=1);

namespace App\Aplicacion\Publicaciones\DTOs;

final readonly class CrearPublicacionDTO
{
    /** @param list<array{multimedia_id: int, orden: int}> $imagenes */
    public function __construct(
        public string $titulo,
        public ?string $descripcion,
        public ?int $categoria_id,
        public ?int $producto_id,
        public bool $activo,
        public array $imagenes,
    ) {}

    /** @return array<string, mixed> */
    public function toArray(): array
    {
        return get_object_vars($this);
    }
}
