<?php

declare(strict_types=1);

namespace App\Aplicacion\Produccion\DTOs;

final readonly class SolicitudCapacidadProduccionDTO
{
    /**
     * @param  array<int, int>  $cantidades_por_categoria
     * @param  list<int>  $categorias_torta
     */
    public function __construct(
        public string $fecha,
        public array $cantidades_por_categoria,
        public array $categorias_torta,
    ) {}
}
