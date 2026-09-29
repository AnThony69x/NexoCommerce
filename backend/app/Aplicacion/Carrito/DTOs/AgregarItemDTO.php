<?php

declare(strict_types=1);

namespace App\Aplicacion\Carrito\DTOs;

final readonly class AgregarItemDTO
{
    public function __construct(
        public int $producto_id,
        public int $cantidad,
        public ?string $comentario,
        public ?int $diseno_torta_id,
        public ?int $plantilla_diseno_id,
        public ?int $diseno_personalizado_id,
    ) {}
}
