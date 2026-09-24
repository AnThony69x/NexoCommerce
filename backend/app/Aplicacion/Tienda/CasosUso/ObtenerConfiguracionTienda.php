<?php

declare(strict_types=1);

namespace App\Aplicacion\Tienda\CasosUso;

use App\Dominio\Tienda\Entidades\ConfiguracionTienda;
use App\Dominio\Tienda\Excepciones\ConfiguracionTiendaNoEncontradaException;
use App\Dominio\Tienda\Repositorios\ConfiguracionTiendaRepositorioInterface;

final class ObtenerConfiguracionTienda
{
    public function __construct(
        private readonly ConfiguracionTiendaRepositorioInterface $configuracionRepo,
    ) {}

    public function execute(): ConfiguracionTienda
    {
        $configuracion = $this->configuracionRepo->buscarActiva();

        if ($configuracion === null) {
            throw new ConfiguracionTiendaNoEncontradaException;
        }

        return $configuracion;
    }
}
