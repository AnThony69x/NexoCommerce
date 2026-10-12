<?php

declare(strict_types=1);

namespace App\Aplicacion\Categorias\CasosUso;

use App\Dominio\Categorias\Excepciones\CategoriaConProductosException;
use App\Dominio\Categorias\Excepciones\CategoriaNoEncontradaException;
use App\Dominio\Categorias\Repositorios\CategoriaRepositorioInterface;

final class DesactivarCategoria
{
    public function __construct(
        private readonly CategoriaRepositorioInterface $categoriaRepo,
    ) {}

    public function execute(int $id): void
    {
        if ($this->categoriaRepo->buscarPorId($id) === null) {
            throw new CategoriaNoEncontradaException;
        }

        if ($this->categoriaRepo->tieneProductosActivos($id)) {
            throw new CategoriaConProductosException;
        }

        $this->categoriaRepo->desactivar($id);
    }
}
