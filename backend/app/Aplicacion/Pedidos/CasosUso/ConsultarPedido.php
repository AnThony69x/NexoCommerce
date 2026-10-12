<?php

declare(strict_types=1);

namespace App\Aplicacion\Pedidos\CasosUso;

use App\Dominio\Compartido\Excepciones\DominioException;
use App\Dominio\Pedidos\Entidades\Pedido;
use App\Dominio\Pedidos\Repositorios\PedidoRepositorioInterface;

final readonly class ConsultarPedido
{
    public function __construct(private PedidoRepositorioInterface $repositorio) {}

    public function execute(int $id, int $usuarioId, bool $admin): Pedido
    {
        $pedido = $this->repositorio->buscarPorId($id) ?? throw new DominioException('Pedido no encontrado.', 'PED_NO_ENCONTRADO', 404);
        if (! $admin && $pedido->usuario_id !== $usuarioId) {
            throw new DominioException('Pedido de otro usuario.', 'PED_AJENO', 403);
        }

        return $pedido;
    }
}
