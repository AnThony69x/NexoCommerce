<?php

declare(strict_types=1);

namespace App\Aplicacion\Multimedia\CasosUso;

use App\Dominio\Multimedia\Entidades\Multimedia;
use App\Dominio\Multimedia\Excepciones\MultimediaNoEncontradaException;
use App\Dominio\Multimedia\Repositorios\MultimediaRepositorioInterface;

/**
 * RN-MED-04: lectura autenticada.
 * Retorna 404 si no existe o si esta desactivado.
 */
final class ObtenerMultimedia
{
    public function __construct(
        private readonly MultimediaRepositorioInterface $multimediaRepo,
    ) {}

    public function execute(int $id): Multimedia
    {
        $multimedia = $this->multimediaRepo->buscarPorId($id);

        if ($multimedia === null || ! $multimedia->estaActivo()) {
            throw new MultimediaNoEncontradaException;
        }

        return $multimedia;
    }
}
