<?php

declare(strict_types=1);

namespace App\Dominio\Productos\Entidades;

use DateTimeImmutable;

final readonly class Producto
{
    /** @param list<ImagenProducto> $imagenes */
    public function __construct(
        public int $id,
        public int $categoria_id,
        public string $categoria_nombre,
        public string $nombre,
        public ?string $descripcion,
        public string $precio_base,
        public bool $activo,
        public DateTimeImmutable $creado_en,
        public DateTimeImmutable $actualizado_en,
        public array $imagenes,
        public ?Torta $torta,
        public ?Detalle $detalle,
        public ?Sublimacion $sublimacion,
    ) {}

    public function tipo(): string
    {
        return match (true) {
            $this->torta !== null => 'TORTA',
            $this->detalle !== null => 'DETALLE',
            default => 'SUBLIMACION',
        };
    }
}
