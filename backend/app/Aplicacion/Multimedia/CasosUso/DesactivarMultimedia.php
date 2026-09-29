<?php

declare(strict_types=1);

namespace App\Aplicacion\Multimedia\CasosUso;

use App\Dominio\Multimedia\Excepciones\MultimediaEnUsoException;
use App\Dominio\Multimedia\Excepciones\MultimediaNoAutorizadaException;
use App\Dominio\Multimedia\Excepciones\MultimediaNoEncontradaException;
use App\Dominio\Multimedia\Repositorios\MultimediaRepositorioInterface;

/**
 * RN-MED-05: activo = false. Lanza MED_EN_USO si FK RESTRICT activa.
 * Solo ADMIN o el propio dueno pueden desactivar.
 */
final class DesactivarMultimedia
{
    public function __construct(
        private readonly MultimediaRepositorioInterface $multimediaRepo,
    ) {}

    public function execute(int $id, int $usuarioId, bool $esAdmin): void
    {
        $multimedia = $this->multimediaRepo->buscarPorId($id);

        if ($multimedia === null || ! $multimedia->estaActivo()) {
            throw new MultimediaNoEncontradaException;
        }

        if (! $esAdmin && ! $multimedia->esDueno($usuarioId)) {
            throw new MultimediaNoAutorizadaException;
        }

        if ($this->multimediaRepo->estaEnUsoRestrict($id)) {
            throw new MultimediaEnUsoException;
        }

        $this->multimediaRepo->desactivar($id);
    }
}
