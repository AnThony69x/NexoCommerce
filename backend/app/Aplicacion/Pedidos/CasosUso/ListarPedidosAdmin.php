<?php

declare(strict_types=1);

namespace App\Aplicacion\Pedidos\CasosUso;

use App\Dominio\Pedidos\Repositorios\PedidoRepositorioInterface;

final readonly class ListarPedidosAdmin
{
    public function __construct(private PedidoRepositorioInterface $repositorio) {}

    public function execute(array $filtros): array
    {
        return $this->repositorio->listar($filtros, null);
    }
}
