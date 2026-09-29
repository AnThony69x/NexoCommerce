<?php

declare(strict_types=1);

namespace App\Aplicacion\Productos\DTOs;

final readonly class CrearProductoDTO
{
    /**
     * @param  array{tamano: string, porciones: int, sabor: string}|null  $torta
     * @param  array{stock: int}|null  $detalle
     * @param  array{tipo_material: string}|null  $sublimacion
     * @param  list<array{multimedia_id: int, orden: int, es_principal: bool}>  $imagenes
     */
    public function __construct(
        public int $categoria_id,
        public string $nombre,
        public ?string $descripcion,
        public float $precio_base,
        public bool $activo,
        public string $tipo,
        public ?array $torta,
        public ?array $detalle,
        public ?array $sublimacion,
        public array $imagenes,
    ) {}

    /** @return array<string, mixed> */
    public function toArray(): array
    {
        return get_object_vars($this);
    }
}
