<?php

declare(strict_types=1);

namespace App\Aplicacion\Pagos\DTOs;

final readonly class RegistrarPagoDTO
{
    public function __construct(
        public int $pedido_id,
        public string $metodo,
        public string $monto,
        public ?string $referencia_pasarela,
        public ?int $multimedia_id,
    ) {}
}
