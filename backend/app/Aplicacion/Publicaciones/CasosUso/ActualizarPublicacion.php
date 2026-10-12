<?php

declare(strict_types=1);

namespace App\Aplicacion\Publicaciones\CasosUso;

use App\Aplicacion\Publicaciones\DTOs\ActualizarPublicacionDTO;
use App\Dominio\Publicaciones\Entidades\Publicacion;
use App\Dominio\Publicaciones\Repositorios\PublicacionRepositorioInterface;

final readonly class ActualizarPublicacion
{
    public function __construct(private PublicacionRepositorioInterface $repositorio) {}

    public function execute(int $id, ActualizarPublicacionDTO $dto): Publicacion
    {
        return $this->repositorio->actualizar($id, $dto->datos);
    }
}
