<?php

declare(strict_types=1);

namespace App\Aplicacion\Carrito\CasosUso;

use App\Aplicacion\Carrito\DTOs\AgregarItemDTO;
use App\Dominio\Carrito\Entidades\Carrito;
use App\Dominio\Carrito\Repositorios\CarritoRepositorioInterface;

final readonly class AgregarItem
{
    public function __construct(private CarritoRepositorioInterface $repositorio) {}

    public function execute(int $usuarioId, AgregarItemDTO $datos): Carrito
    {
        return $this->repositorio->agregar($usuarioId, $datos->producto_id, $datos->cantidad, $datos->comentario, $datos->diseno_torta_id, $datos->plantilla_diseno_id, $datos->diseno_personalizado_id);
    }
}
