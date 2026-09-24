<?php

declare(strict_types=1);

namespace App\Aplicacion\Productos\CasosUso;

use App\Aplicacion\Productos\DTOs\FiltrosProductoDTO;
use App\Dominio\Productos\Repositorios\ProductoRepositorioInterface;

final readonly class ListarProductos
{
    public function __construct(private ProductoRepositorioInterface $repositorio) {}

    /** @return array<string, mixed> */
    public function execute(FiltrosProductoDTO $filtros): array
    {
        return $this->repositorio->listar($filtros->toArray());
    }
}
