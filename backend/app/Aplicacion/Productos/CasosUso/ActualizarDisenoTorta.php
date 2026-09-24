<?php

declare(strict_types=1);

namespace App\Aplicacion\Productos\CasosUso;

use App\Aplicacion\Productos\DTOs\GuardarDisenoDTO;
use App\Dominio\Productos\Entidades\DisenoTorta;
use App\Dominio\Productos\Repositorios\ProductoRepositorioInterface;

final readonly class ActualizarDisenoTorta
{
    public function __construct(private ProductoRepositorioInterface $repositorio) {}

    public function execute(int $id, GuardarDisenoDTO $dto): DisenoTorta
    {
        return $this->repositorio->actualizarDisenoTorta($id, $dto->datos);
    }
}
