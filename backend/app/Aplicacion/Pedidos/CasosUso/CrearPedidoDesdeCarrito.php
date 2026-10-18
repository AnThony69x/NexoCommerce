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
        $entrega = [
            'tipo_entrega' => $datos->tipo_entrega, 'direccion_entrega' => $datos->direccion_entrega,
            'telefono_contacto' => $datos->telefono_contacto, 'hora_entrega' => $datos->hora_entrega,
        ];
        $resultado = $this->repositorio->crearDesdeCarrito($usuarioId, $datos->fecha_entrega, $datos->total_esperado, $entrega);
        if ($resultado instanceof DominioException) {
            throw $resultado;
        }

        return $resultado;
    }
}
