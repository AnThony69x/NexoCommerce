<?php

declare(strict_types=1);

namespace App\Dominio\Carrito\Entidades;

use App\Dominio\Carrito\Servicios\ReglasCarrito;

final readonly class DetalleCarrito
{
    /** @param list<string> $avisos */
    public function __construct(
        public int $id,
        public int $producto_id,
        public string $nombre,
        public string $tipo,
        public ?string $imagen_principal_url,
        public int $cantidad,
        public string $precio_unitario,
        public ?string $comentario,
        public ?int $diseno_torta_id,
        public ?int $plantilla_diseno_id,
        public ?int $diseno_personalizado_id,
        public ?array $configuracion,
        public bool $precio_actualizado,
        public array $avisos,
    ) {}

    public function subtotal(): string
    {
        return ReglasCarrito::decimal(ReglasCarrito::centavos($this->precio_unitario) * $this->cantidad);
    }
}
