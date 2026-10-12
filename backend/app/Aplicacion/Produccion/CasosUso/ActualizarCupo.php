<?php

declare(strict_types=1);

namespace App\Aplicacion\Produccion\CasosUso;

use App\Aplicacion\Produccion\DTOs\ActualizarConfiguracionProduccionDTO;
use App\Dominio\Produccion\Entidades\ConfiguracionProduccion;
use App\Dominio\Produccion\Repositorios\ConfiguracionProduccionRepositorioInterface;

final readonly class ActualizarCupo
{
    public function __construct(private ConfiguracionProduccionRepositorioInterface $repositorio) {}

    public function execute(int $id, ActualizarConfiguracionProduccionDTO $dto): ConfiguracionProduccion
    {
        return $this->repositorio->actualizar($id, $dto->datos);
    }
}
