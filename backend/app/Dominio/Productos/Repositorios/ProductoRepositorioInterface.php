<?php

declare(strict_types=1);

namespace App\Dominio\Productos\Repositorios;

use App\Dominio\Productos\Entidades\DisenoPersonalizado;
use App\Dominio\Productos\Entidades\DisenoTorta;
use App\Dominio\Productos\Entidades\PlantillaDiseno;
use App\Dominio\Productos\Entidades\Producto;

interface ProductoRepositorioInterface
{
    /** @return array{datos: list<Producto>, pagina_actual: int, por_pagina: int, total: int, total_paginas: int} */
    public function listar(array $filtros): array;

    public function buscarPorId(int $id, bool $soloActivo = true): ?Producto;

    public function crear(array $datos): Producto;

    public function actualizar(int $id, array $datos): Producto;

    public function desactivar(int $id): void;

    public function crearDisenoTorta(int $productoId, array $datos): DisenoTorta;

    public function actualizarDisenoTorta(int $id, array $datos): DisenoTorta;

    public function desactivarDisenoTorta(int $id): void;

    public function crearPlantilla(int $productoId, array $datos): PlantillaDiseno;

    public function actualizarPlantilla(int $id, array $datos): PlantillaDiseno;

    public function desactivarPlantilla(int $id): void;

    public function crearDisenoPersonalizado(int $usuarioId, array $datos): DisenoPersonalizado;

    /** @return list<DisenoPersonalizado> */
    public function listarDisenosPersonalizados(int $usuarioId): array;
}
