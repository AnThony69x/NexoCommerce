<?php

declare(strict_types=1);

namespace App\Aplicacion\Produccion\CasosUso;

use App\Aplicacion\Produccion\DTOs\CrearConfiguracionProduccionDTO;
use App\Dominio\Produccion\Entidades\ConfiguracionProduccion;
use App\Dominio\Produccion\Repositorios\ConfiguracionProduccionRepositorioInterface;

final readonly class CrearCupo
{
    public function __construct(private ConfiguracionProduccionRepositorioInterface $repositorio) {}

    public function execute(CrearConfiguracionProduccionDTO $dto): ConfiguracionProduccion
    {
        return $this->repositorio->crear($dto->toArray());
    }
}
