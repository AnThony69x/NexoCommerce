<?php

declare(strict_types=1);

namespace App\Aplicacion\Publicaciones\CasosUso;

use App\Dominio\Publicaciones\Entidades\Publicacion;
use App\Dominio\Publicaciones\Excepciones\PublicacionNoEncontradaException;
use App\Dominio\Publicaciones\Repositorios\PublicacionRepositorioInterface;

final readonly class ConsultarPublicacion
{
    public function __construct(private PublicacionRepositorioInterface $repositorio) {}

    public function execute(int $id, bool $incluirInactivas = false): Publicacion
    {
        return $this->repositorio->buscarPorId($id, ! $incluirInactivas)
            ?? throw new PublicacionNoEncontradaException;
    }
}
