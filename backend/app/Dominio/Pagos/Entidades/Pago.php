<?php

declare(strict_types=1);

namespace App\Dominio\Pagos\Entidades;

use DateTimeImmutable;

final readonly class Pago
{
    public function __construct(
        public int $id,
        public int $pedido_id,
        public string $metodo,
        public string $estado,
        public string $monto,
        public ?string $referencia_pasarela,
        public ?DateTimeImmutable $fecha_pago,
        public ?ComprobantePago $comprobante,
        public string $pedido_estado,
    ) {}
}
