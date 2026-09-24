<?php

declare(strict_types=1);

namespace App\Aplicacion\Tienda\CasosUso;

use App\Aplicacion\Tienda\DTOs\ActualizarConfiguracionTiendaDTO;
use App\Dominio\Tienda\Entidades\ConfiguracionTienda;
use App\Dominio\Tienda\Excepciones\ConfiguracionTiendaNoEncontradaException;
use App\Dominio\Tienda\Repositorios\ConfiguracionTiendaRepositorioInterface;

final class ActualizarConfiguracionTienda
{
    public function __construct(
        private readonly ConfiguracionTiendaRepositorioInterface $configuracionRepo,
    ) {}

    public function execute(ActualizarConfiguracionTiendaDTO $dto): ConfiguracionTienda
    {
        $configuracion = $this->configuracionRepo->buscarActiva();

        if ($configuracion === null) {
            throw new ConfiguracionTiendaNoEncontradaException;
        }

        $datos = $dto->aArray();
        $datos['activo'] = true;

        return $this->configuracionRepo->actualizar($configuracion->id, $datos);
    }
}
