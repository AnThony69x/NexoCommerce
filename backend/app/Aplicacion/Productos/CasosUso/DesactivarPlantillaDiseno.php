<?php

declare(strict_types=1);

namespace App\Aplicacion\Productos\CasosUso;

use App\Dominio\Productos\Repositorios\ProductoRepositorioInterface;

final readonly class DesactivarPlantillaDiseno
{
    public function __construct(private ProductoRepositorioInterface $repositorio) {}

    public function execute(int $id): void
    {
        $this->repositorio->desactivarPlantilla($id);
    }
}
