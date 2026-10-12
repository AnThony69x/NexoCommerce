<?php

declare(strict_types=1);

namespace App\Dominio\Carrito\Entidades;

use App\Dominio\Carrito\Servicios\ReglasCarrito;

final readonly class Carrito
{
    /** @param list<DetalleCarrito> $items */
    public function __construct(
        public int $id,
        public int $usuario_id,
        public bool $activo,
        public array $items,
    ) {}

    public function total(): string
    {
        $centavos = 0;
        foreach ($this->items as $item) {
            $centavos += ReglasCarrito::centavos($item->precio_unitario) * $item->cantidad;
        }

        return ReglasCarrito::decimal($centavos);
    }

    public function preciosActualizados(): array
    {
        return array_values(array_map(
            static fn (DetalleCarrito $item): int => $item->id,
            array_filter($this->items, static fn (DetalleCarrito $item): bool => $item->precio_actualizado),
        ));
    }
}
