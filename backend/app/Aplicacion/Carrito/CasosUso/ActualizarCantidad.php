<?php

declare(strict_types=1);

namespace App\Aplicacion\Carrito\CasosUso;

use App\Dominio\Carrito\Entidades\Carrito;
use App\Dominio\Carrito\Repositorios\CarritoRepositorioInterface;

final readonly class ActualizarCantidad
{
    public function __construct(private CarritoRepositorioInterface $repositorio) {}

    public function execute(int $usuarioId, int $itemId, int $cantidad): Carrito
    {
        return $this->repositorio->actualizarCantidad($usuarioId, $itemId, $cantidad);
    }
}
