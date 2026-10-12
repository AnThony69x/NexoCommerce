<?php

declare(strict_types=1);

namespace App\Aplicacion\Categorias\CasosUso;

use App\Aplicacion\Categorias\DTOs\ActualizarCategoriaDTO;
use App\Dominio\Categorias\Entidades\Categoria;
use App\Dominio\Categorias\Excepciones\CategoriaNoEncontradaException;
use App\Dominio\Categorias\Excepciones\CategoriaPadreInvalidaException;
use App\Dominio\Categorias\Repositorios\CategoriaRepositorioInterface;

final class ActualizarCategoria
{
    public function __construct(
        private readonly CategoriaRepositorioInterface $categoriaRepo,
    ) {}

    public function execute(int $id, ActualizarCategoriaDTO $dto): Categoria
    {
        if ($this->categoriaRepo->buscarPorId($id) === null) {
            throw new CategoriaNoEncontradaException;
        }

        $datos = ['nombre' => $dto->nombre];

        if ($dto->incluye_categoria_padre_id) {
            if ($dto->categoria_padre_id !== null) {
                $this->validarNuevoPadre($id, $dto->categoria_padre_id);
            }

            $datos['categoria_padre_id'] = $dto->categoria_padre_id;
        }

        if ($dto->incluye_descripcion) {
            $datos['descripcion'] = $dto->descripcion;
        }

        if ($dto->incluye_imagen_id) {
            $datos['imagen_id'] = $dto->imagen_id;
        }

        if ($dto->activo !== null) {
            $datos['activo'] = $dto->activo;
        }

        return $this->categoriaRepo->actualizar($id, $datos);
    }

    private function validarNuevoPadre(int $categoriaId, int $nuevoPadreId): void
    {
        $mapaPadres = $this->categoriaRepo->mapaPadres();

        if (! array_key_exists($nuevoPadreId, $mapaPadres)) {
            throw new CategoriaPadreInvalidaException;
        }

        $actual = $nuevoPadreId;
        $visitados = [];

        while ($actual !== null) {
            if ($actual === $categoriaId || isset($visitados[$actual])) {
                throw new CategoriaPadreInvalidaException;
            }

            $visitados[$actual] = true;
            $actual = $mapaPadres[$actual] ?? null;
        }
    }
}
