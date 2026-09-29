<?php

declare(strict_types=1);

namespace App\Aplicacion\Pedidos\CasosUso;

use App\Aplicacion\Pedidos\DTOs\CrearPedidoDTO;
use App\Dominio\Compartido\Excepciones\DominioException;
use App\Dominio\Pedidos\Entidades\Pedido;
use App\Dominio\Pedidos\Repositorios\PedidoRepositorioInterface;

final readonly class CrearPedidoDesdeCarrito
{
    public function __construct(private PedidoRepositorioInterface $repositorio) {}

    public function execute(int $usuarioId, CrearPedidoDTO $datos): Pedido
    {
        $resultado = $this->repositorio->crearDesdeCarrito($usuarioId, $datos->fecha_entrega, $datos->total_esperado);
        if ($resultado instanceof DominioException) {
            throw $resultado;
        }

        return $resultado;
    }
}
