<?php

declare(strict_types=1);

namespace App\Aplicacion\Pedidos\DTOs;

final readonly class CrearPedidoDTO
{
    public function __construct(public string $fecha_entrega, public string $total_esperado) {}
}
