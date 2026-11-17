<?php

declare(strict_types=1);

namespace App\Dominio\Pedidos\Repositorios;

use App\Dominio\Compartido\Excepciones\DominioException;
use App\Dominio\Pedidos\Entidades\Pedido;

interface PedidoRepositorioInterface
{
    /**
     * @param  array{tipo_entrega: string, direccion_entrega: ?string, telefono_contacto: ?string, hora_entrega: ?string}  $entrega
     * @return Pedido|DominioException Rechazos de negocio se devuelven para confirmar el recálculo del carrito.
     */
    public function crearDesdeCarrito(int $usuarioId, string $fechaEntrega, string $totalEsperado, array $entrega): Pedido|DominioException;

    /** @return array{datos: list<Pedido>, pagina_actual: int, por_pagina: int, total: int, total_paginas: int} */
    public function listar(array $filtros, ?int $usuarioId): array;

    public function buscarPorId(int $id): ?Pedido;

    public function cambiarEstado(int $id, string $estado): Pedido;
}
