<?php

declare(strict_types=1);

namespace App\Aplicacion\Pedidos\DTOs;

final readonly class CrearPedidoDTO
{
    public function __construct(
        public string $fecha_entrega,
        public string $total_esperado,
        public string $tipo_entrega = 'RETIRO',
        public ?string $direccion_entrega = null,
        public ?string $telefono_contacto = null,
        public ?string $hora_entrega = null,
    ) {}
}
