<?php

declare(strict_types=1);

namespace App\Aplicacion\Productos\CasosUso;

use App\Aplicacion\Productos\DTOs\ActualizarProductoDTO;
use App\Dominio\Productos\Entidades\Producto;
use App\Dominio\Productos\Excepciones\ProductoNoEncontradoException;
use App\Dominio\Productos\Excepciones\SublimacionSinPlantillaException;
use App\Dominio\Productos\Excepciones\TipoProductoInmutableException;
use App\Dominio\Productos\Repositorios\ProductoRepositorioInterface;

final readonly class ActualizarProducto
{
    public function __construct(private ProductoRepositorioInterface $repositorio) {}

    public function execute(int $id, ActualizarProductoDTO $dto): Producto
    {
        $actual = $this->repositorio->buscarPorId($id, false)
            ?? throw new ProductoNoEncontradoException;
        $datos = $dto->datos;

        if (isset($datos['tipo']) && $datos['tipo'] !== $actual->tipo()) {
            throw new TipoProductoInmutableException;
        }

        if (($datos['activo'] ?? false) === true
            && $actual->tipo() === 'SUBLIMACION'
            && $actual->sublimacion?->plantillas === []) {
            throw new SublimacionSinPlantillaException;
        }

        unset($datos['tipo']);

        return $this->repositorio->actualizar($id, $datos);
    }
}
