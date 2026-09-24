<?php

declare(strict_types=1);

namespace App\Aplicacion\Publicaciones\CasosUso;

use App\Aplicacion\Publicaciones\DTOs\FiltrosPublicacionDTO;
use App\Dominio\Publicaciones\Repositorios\PublicacionRepositorioInterface;

final readonly class ListarPublicaciones
{
    public function __construct(private PublicacionRepositorioInterface $repositorio) {}

    public function execute(FiltrosPublicacionDTO $filtros): array
    {
        return $this->repositorio->listar($filtros->filtros(), $filtros->incluir_inactivas);
    }
}
