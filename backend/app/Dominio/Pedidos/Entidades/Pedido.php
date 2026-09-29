<?php

declare(strict_types=1);

namespace App\Dominio\Pedidos\Entidades;

use DateTimeImmutable;

final readonly class Pedido
{
    /** @param list<DetallePedido> $items */
    public function __construct(
        public int $id,
        public int $usuario_id,
        public string $fecha_entrega,
        public string $estado,
        public string $subtotal,
        public string $total,
        public DateTimeImmutable $creado_en,
        public array $items = [],
        public ?array $pago = null,
    ) {}
}
