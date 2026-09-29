<?php

declare(strict_types=1);

namespace App\Aplicacion\Productos\CasosUso;

use App\Dominio\Productos\Entidades\Producto;
use App\Dominio\Productos\Excepciones\ProductoNoEncontradoException;
use App\Dominio\Productos\Repositorios\ProductoRepositorioInterface;

final readonly class ConsultarProducto
{
    public function __construct(private ProductoRepositorioInterface $repositorio) {}

    public function execute(int $id, bool $soloActivo = true): Producto
    {
        return $this->repositorio->buscarPorId($id, $soloActivo)
            ?? throw new ProductoNoEncontradoException;
    }
}
