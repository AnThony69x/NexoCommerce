<?php

declare(strict_types=1);

namespace App\Aplicacion\Multimedia\CasosUso;

use App\Dominio\Compartido\Excepciones\DominioException;
use App\Dominio\Multimedia\Entidades\Multimedia;
use App\Dominio\Multimedia\Excepciones\MultimediaNoEncontradaException;
use App\Dominio\Multimedia\Repositorios\MultimediaRepositorioInterface;
use App\Dominio\Multimedia\Servicios\VisibilidadMultimedia;

/**
 * RN-MED-04: lectura autenticada.
 * Retorna 404 si no existe o si esta desactivado.
 */
final class ObtenerMultimedia
{
    public function __construct(
        private readonly MultimediaRepositorioInterface $multimediaRepo,
    ) {}

    public function execute(int $id, int $usuarioId, bool $esAdmin): Multimedia
    {
        $multimedia = $this->multimediaRepo->buscarPorId($id);

        if ($multimedia === null || ! $multimedia->estaActivo()) {
            throw new MultimediaNoEncontradaException;
        }
        if (VisibilidadMultimedia::esPrivada($multimedia->ruta_archivo) && ! $esAdmin && ! $multimedia->esDueno($usuarioId)) {
            throw new DominioException('Archivo de otro usuario.', 'MED_AJENO', 403);
        }

        return $multimedia;
    }
}
