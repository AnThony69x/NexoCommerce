<?php

declare(strict_types=1);

namespace App\Dominio\Categorias\Repositorios;

use App\Dominio\Categorias\Entidades\Categoria;

interface CategoriaRepositorioInterface
{
    /** @return list<Categoria> */
    public function listar(bool $soloActivas): array;

    public function buscarPorId(int $id): ?Categoria;

    /** @param array<string, mixed> $datos */
    public function guardar(array $datos): Categoria;

    /** @param array<string, mixed> $datos */
    public function actualizar(int $id, array $datos): Categoria;

    public function desactivar(int $id): void;

    public function tieneProductosActivos(int $id): bool;

    /** @return array<int, int|null> */
    public function mapaPadres(): array;
}
