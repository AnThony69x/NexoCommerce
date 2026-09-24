<?php

declare(strict_types=1);

namespace App\Aplicacion\Productos\CasosUso;

use App\Aplicacion\Productos\DTOs\CrearDisenoPersonalizadoDTO;
use App\Dominio\Productos\Entidades\DisenoPersonalizado;
use App\Dominio\Productos\Repositorios\ProductoRepositorioInterface;

final readonly class CrearDisenoPersonalizado
{
    public function __construct(private ProductoRepositorioInterface $repositorio) {}

    public function execute(int $usuarioId, CrearDisenoPersonalizadoDTO $dto): DisenoPersonalizado
    {
        return $this->repositorio->crearDisenoPersonalizado($usuarioId, $dto->toArray());
    }
}
