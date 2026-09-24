<?php

declare(strict_types=1);

namespace App\Infraestructura\Persistencia\Eloquent\Repositorios;

use App\Dominio\Multimedia\Entidades\Multimedia;
use App\Dominio\Multimedia\Repositorios\MultimediaRepositorioInterface;
use App\Infraestructura\Persistencia\Eloquent\Modelos\MultimediaModelo;
use DateTimeImmutable;
use Illuminate\Support\Facades\DB;

class MultimediaRepositorioEloquent implements MultimediaRepositorioInterface
{
    public function guardar(array $datos): Multimedia
    {
        $modelo = MultimediaModelo::create($datos);

        return $this->mapearAEntidad($modelo);
    }

    public function buscarPorId(int $id): ?Multimedia
    {
        $modelo = MultimediaModelo::find($id);

        return $modelo !== null ? $this->mapearAEntidad($modelo) : null;
    }

    public function desactivar(int $id): void
    {
        MultimediaModelo::where('id', $id)->update(['activo' => false]);
    }

    public function estaEnUsoRestrict(int $id): bool
    {
        // Tablas con ON DELETE RESTRICT sobre multimedia_id
        $enComprobantes = DB::table('comprobantes_pago')
            ->where('multimedia_id', $id)
            ->exists();

        if ($enComprobantes) {
            return true;
        }

        return DB::table('disenos_personalizados')
            ->where('multimedia_id', $id)
            ->exists();
    }

    private function mapearAEntidad(MultimediaModelo $modelo): Multimedia
    {
        return new Multimedia(
            id: $modelo->id,
            nombre_archivo: $modelo->nombre_archivo,
            ruta_archivo: $modelo->ruta_archivo,
            tipo_mime: $modelo->tipo_mime,
            tamano_bytes: (int) $modelo->tamano_bytes,
            ancho: $modelo->ancho !== null ? (int) $modelo->ancho : null,
            alto: $modelo->alto !== null ? (int) $modelo->alto : null,
            activo: (bool) $modelo->activo,
            subido_por_id: $modelo->subido_por_id !== null ? (int) $modelo->subido_por_id : null,
            creado_en: new DateTimeImmutable($modelo->creado_en->toDateTimeString()),
            actualizado_en: new DateTimeImmutable($modelo->actualizado_en->toDateTimeString()),
        );
    }
}
