<?php

declare(strict_types=1);

namespace App\Aplicacion\Multimedia\CasosUso;

use App\Dominio\Multimedia\Excepciones\MultimediaNoEncontradaException;
use App\Dominio\Multimedia\Repositorios\MultimediaRepositorioInterface;

final class ActivarMultimedia
{
    public function __construct(
        private readonly MultimediaRepositorioInterface $multimediaRepo,
    ) {}

    public function execute(int $id): void
    {
        $multimedia = $this->multimediaRepo->buscarPorId($id);

        if ($multimedia === null) {
            throw new MultimediaNoEncontradaException;
        }

        if (! $multimedia->estaActivo()) {
            $this->multimediaRepo->activar($id);
        }
    }
}
