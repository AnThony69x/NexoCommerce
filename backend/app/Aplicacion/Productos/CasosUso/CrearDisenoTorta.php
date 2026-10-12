<?php

declare(strict_types=1);

namespace App\Aplicacion\Productos\CasosUso;

use App\Aplicacion\Productos\DTOs\GuardarDisenoDTO;
use App\Dominio\Productos\Entidades\DisenoTorta;
use App\Dominio\Productos\Repositorios\ProductoRepositorioInterface;

final readonly class CrearDisenoTorta
{
    public function __construct(private ProductoRepositorioInterface $repositorio) {}

    public function execute(int $productoId, GuardarDisenoDTO $dto): DisenoTorta
    {
        return $this->repositorio->crearDisenoTorta($productoId, $dto->datos);
    }
}
