<?php

declare(strict_types=1);

namespace App\Aplicacion\Multimedia\CasosUso;

use App\Aplicacion\Multimedia\Contratos\AlmacenamientoArchivosInterface;
use App\Dominio\Compartido\Excepciones\DominioException;
use App\Dominio\Multimedia\Entidades\ArchivoDescargable;
use App\Dominio\Multimedia\Entidades\Multimedia;
use App\Dominio\Multimedia\Excepciones\MultimediaNoEncontradaException;
use App\Dominio\Multimedia\Repositorios\MultimediaRepositorioInterface;
use App\Dominio\Multimedia\Servicios\VisibilidadMultimedia;

final readonly class DescargarMultimedia
{
    public function __construct(
        private MultimediaRepositorioInterface $repositorio,
        private AlmacenamientoArchivosInterface $almacenamiento,
    ) {}

    public function publica(string $ruta): ArchivoDescargable
    {
        if (! VisibilidadMultimedia::rutaPublicaValida($ruta)) {
            throw new MultimediaNoEncontradaException;
        }
        $multimedia = $this->repositorio->buscarPorRuta($ruta);
        if ($multimedia === null || ! $multimedia->estaActivo()
            || ! in_array($multimedia->tipo_mime, ['image/jpeg', 'image/png', 'image/webp'], true)) {
            throw new MultimediaNoEncontradaException;
        }

        return $this->leer($multimedia);
    }

    public function privada(int $id, int $usuarioId, bool $esAdmin): ArchivoDescargable
    {
        $multimedia = $this->repositorio->buscarPorId($id);
        if ($multimedia === null || ! $multimedia->estaActivo() || ! VisibilidadMultimedia::esPrivada($multimedia->ruta_archivo)) {
            throw new MultimediaNoEncontradaException;
        }
        if (! $esAdmin && ! $multimedia->esDueno($usuarioId)) {
            throw new DominioException('Archivo de otro usuario.', 'MED_AJENO', 403);
        }

        return $this->leer($multimedia);
    }

    private function leer(Multimedia $multimedia): ArchivoDescargable
    {
        $contenido = $this->almacenamiento->leer($multimedia->ruta_archivo);
        if ($contenido === null) {
            throw new MultimediaNoEncontradaException;
        }

        return new ArchivoDescargable($contenido, $multimedia->tipo_mime, basename($multimedia->ruta_archivo));
    }
}
