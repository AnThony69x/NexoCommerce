<?php

declare(strict_types=1);

namespace App\Aplicacion\Productos\CasosUso;

use App\Dominio\Productos\Excepciones\ProductoNoEncontradoException;
use App\Dominio\Productos\Repositorios\ProductoRepositorioInterface;

final readonly class DesactivarProducto
{
    public function __construct(private ProductoRepositorioInterface $repositorio) {}

    public function execute(int $id): void
    {
        if ($this->repositorio->buscarPorId($id, false) === null) {
            throw new ProductoNoEncontradoException;
        }

        $this->repositorio->desactivar($id);
    }
}
