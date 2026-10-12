<?php

declare(strict_types=1);

namespace App\Aplicacion\Publicaciones\CasosUso;

use App\Aplicacion\Publicaciones\DTOs\CrearPublicacionDTO;
use App\Dominio\Publicaciones\Entidades\Publicacion;
use App\Dominio\Publicaciones\Repositorios\PublicacionRepositorioInterface;

final readonly class CrearPublicacion
{
    public function __construct(private PublicacionRepositorioInterface $repositorio) {}

    public function execute(int $usuarioId, CrearPublicacionDTO $dto): Publicacion
    {
        return $this->repositorio->crear($usuarioId, $dto->toArray());
    }
}
