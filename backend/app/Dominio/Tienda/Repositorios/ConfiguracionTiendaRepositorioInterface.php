<?php

declare(strict_types=1);

namespace App\Dominio\Tienda\Repositorios;

use App\Dominio\Tienda\Entidades\ConfiguracionTienda;

interface ConfiguracionTiendaRepositorioInterface
{
    public function buscarActiva(): ?ConfiguracionTienda;

    /**
     * Actualiza una configuracion existente sin crear registros.
     *
     * @param  array<string, mixed>  $datos
     */
    public function actualizar(int $id, array $datos): ConfiguracionTienda;
}
