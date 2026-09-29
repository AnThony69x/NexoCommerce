<?php

declare(strict_types=1);

namespace App\Dominio\Productos\Entidades;

final readonly class Detalle
{
    public function __construct(
        public int $producto_id,
        public int $stock,
    ) {}
}
