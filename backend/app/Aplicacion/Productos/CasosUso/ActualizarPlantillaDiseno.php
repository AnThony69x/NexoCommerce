<?php

declare(strict_types=1);

namespace App\Aplicacion\Productos\CasosUso;

use App\Aplicacion\Productos\DTOs\GuardarDisenoDTO;
use App\Dominio\Productos\Entidades\PlantillaDiseno;
use App\Dominio\Productos\Repositorios\ProductoRepositorioInterface;

final readonly class ActualizarPlantillaDiseno
{
    public function __construct(private ProductoRepositorioInterface $repositorio) {}

    public function execute(int $id, GuardarDisenoDTO $dto): PlantillaDiseno
    {
        return $this->repositorio->actualizarPlantilla($id, $dto->datos);
    }
}
