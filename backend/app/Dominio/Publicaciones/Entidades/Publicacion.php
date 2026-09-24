<?php

declare(strict_types=1);

namespace App\Dominio\Publicaciones\Entidades;

use DateTimeImmutable;

final readonly class Publicacion
{
    /** @param list<ImagenPublicacion> $imagenes */
    public function __construct(
        public int $id,
        public int $usuario_id,
        public ?int $categoria_id,
        public ?int $producto_id,
        public string $titulo,
        public ?string $descripcion,
        public bool $activo,
        public DateTimeImmutable $creado_en,
        public DateTimeImmutable $actualizado_en,
        public array $imagenes,
    ) {}
}
