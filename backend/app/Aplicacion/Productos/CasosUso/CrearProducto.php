<?php

declare(strict_types=1);

namespace App\Aplicacion\Productos\CasosUso;

use App\Aplicacion\Productos\DTOs\CrearProductoDTO;
use App\Dominio\Productos\Entidades\Producto;
use App\Dominio\Productos\Excepciones\SublimacionSinPlantillaException;
use App\Dominio\Productos\Repositorios\ProductoRepositorioInterface;

final readonly class CrearProducto
{
    public function __construct(private ProductoRepositorioInterface $repositorio) {}

    public function execute(CrearProductoDTO $dto): Producto
    {
        if ($dto->tipo === 'SUBLIMACION' && $dto->activo) {
            throw new SublimacionSinPlantillaException;
        }

        return $this->repositorio->crear($dto->toArray());
    }
}
