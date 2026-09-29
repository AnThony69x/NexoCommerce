<?php

declare(strict_types=1);

namespace App\Aplicacion\Categorias\CasosUso;

use App\Aplicacion\Categorias\DTOs\CrearCategoriaDTO;
use App\Dominio\Categorias\Entidades\Categoria;
use App\Dominio\Categorias\Excepciones\CategoriaPadreInvalidaException;
use App\Dominio\Categorias\Repositorios\CategoriaRepositorioInterface;

final class CrearCategoria
{
    public function __construct(
        private readonly CategoriaRepositorioInterface $categoriaRepo,
    ) {}

    public function execute(CrearCategoriaDTO $dto): Categoria
    {
        if ($dto->categoria_padre_id !== null
            && $this->categoriaRepo->buscarPorId($dto->categoria_padre_id) === null) {
            throw new CategoriaPadreInvalidaException;
        }

        return $this->categoriaRepo->guardar([
            'categoria_padre_id' => $dto->categoria_padre_id,
            'nombre' => $dto->nombre,
            'descripcion' => $dto->descripcion,
            'imagen_id' => $dto->imagen_id,
            'activo' => $dto->activo,
        ]);
    }
}
