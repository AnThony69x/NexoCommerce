<?php

declare(strict_types=1);

namespace App\Aplicacion\Pedidos\CasosUso;

use App\Dominio\Pedidos\Entidades\Pedido;
use App\Dominio\Pedidos\Repositorios\PedidoRepositorioInterface;

final readonly class CambiarEstadoPedido
{
    public function __construct(private PedidoRepositorioInterface $repositorio) {}

    public function execute(int $id, string $estado): Pedido
    {
        return $this->repositorio->cambiarEstado($id, $estado);
    }
}
