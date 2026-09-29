<?php

declare(strict_types=1);

namespace App\Dominio\Pedidos\Entidades;

final readonly class DetallePedido
{
    public function __construct(
        public int $id,
        public int $producto_id,
        public string $nombre_producto,
        public int $cantidad,
        public string $precio_unitario,
        public string $subtotal,
        public ?string $tipo_configuracion,
        public ?string $nombre_diseno,
        public string $costo_diseno,
        public ?string $indicaciones,
        public ?int $diseno_torta_id,
        public ?int $plantilla_diseno_id,
        public ?int $diseno_personalizado_id,
    ) {}
}
