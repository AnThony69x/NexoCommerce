<?php

declare(strict_types=1);

namespace App\Aplicacion\Produccion\CasosUso;

use App\Aplicacion\Produccion\DTOs\FiltrosProduccionDTO;
use App\Dominio\Produccion\Repositorios\ConfiguracionProduccionRepositorioInterface;

final readonly class ListarCupos
{
    public function __construct(private ConfiguracionProduccionRepositorioInterface $repositorio) {}

    public function execute(FiltrosProduccionDTO $filtros): array
    {
        return $this->repositorio->listar($filtros->toArray());
    }
}
