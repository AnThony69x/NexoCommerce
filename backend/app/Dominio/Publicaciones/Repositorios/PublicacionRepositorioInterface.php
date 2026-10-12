<?php

declare(strict_types=1);

namespace App\Dominio\Publicaciones\Repositorios;

use App\Dominio\Publicaciones\Entidades\Publicacion;

interface PublicacionRepositorioInterface
{
    /** @return array{datos: list<Publicacion>, pagina_actual: int, por_pagina: int, total: int, total_paginas: int} */
    public function listar(array $filtros, bool $incluirInactivas = false): array;

    public function buscarPorId(int $id, bool $soloActiva = true): ?Publicacion;

    public function crear(int $usuarioId, array $datos): Publicacion;

    public function actualizar(int $id, array $datos): Publicacion;

    public function desactivar(int $id): void;
}
