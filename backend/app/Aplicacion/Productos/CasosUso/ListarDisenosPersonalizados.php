<?php

declare(strict_types=1);

namespace App\Aplicacion\Productos\CasosUso;

use App\Dominio\Productos\Repositorios\ProductoRepositorioInterface;

final readonly class ListarDisenosPersonalizados
{
    public function __construct(private ProductoRepositorioInterface $repositorio) {}

    public function execute(int $usuarioId): array
    {
        return $this->repositorio->listarDisenosPersonalizados($usuarioId);
    }
}
