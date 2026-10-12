<?php

declare(strict_types=1);

namespace App\Aplicacion\Publicaciones\CasosUso;

use App\Dominio\Publicaciones\Excepciones\PublicacionNoEncontradaException;
use App\Dominio\Publicaciones\Repositorios\PublicacionRepositorioInterface;

final readonly class DesactivarPublicacion
{
    public function __construct(private PublicacionRepositorioInterface $repositorio) {}

    public function execute(int $id): void
    {
        if ($this->repositorio->buscarPorId($id, false) === null) {
            throw new PublicacionNoEncontradaException;
        }

        $this->repositorio->desactivar($id);
    }
}
