<?php

declare(strict_types=1);

namespace App\Aplicacion\Multimedia\CasosUso;

use App\Aplicacion\Multimedia\Contratos\AlmacenamientoArchivosInterface;
use App\Aplicacion\Multimedia\DTOs\SubirMultimediaDTO;
use App\Dominio\Multimedia\Entidades\Multimedia;
use App\Dominio\Multimedia\Repositorios\MultimediaRepositorioInterface;

/**
 * RN-MED-01: jpeg, png, jpg, webp para imagenes; + pdf para comprobantes.
 * RN-MED-02: max 5 MB (validado en FormRequest; aqui se asume valido).
 * RN-MED-04: subido_por_id = usuario autenticado.
 * RN-MED-06: prefijo de ruta segun destino.
 *
 * No usa facades de Laravel. getimagesizefromstring() es funcion nativa PHP.
 */
final class SubirArchivoMultimedia
{
    public function __construct(
        private readonly MultimediaRepositorioInterface $multimediaRepo,
        private readonly AlmacenamientoArchivosInterface $almacenamiento,
    ) {}

    public function execute(SubirMultimediaDTO $dto): Multimedia
    {
        // Nombre generado: destino/Ymd_random.ext
        $nombreGenerado = sprintf(
            '%s/%s_%s.%s',
            $dto->destino,
            date('Ymd'),
            bin2hex(random_bytes(8)),
            strtolower($dto->extension),
        );

        // Guardar binario via puerto de almacenamiento
        $rutaRelativa = $this->almacenamiento->guardar($nombreGenerado, $dto->contenido_binario);

        // Leer dimensiones si es imagen (PHP nativo, sin facades)
        $ancho = null;
        $alto = null;

        if ($this->esImagen($dto->tipo_mime)) {
            $info = $this->dimensionesDesdeContenido($dto->contenido_binario);
            $ancho = $info['ancho'];
            $alto = $info['alto'];
        }

        return $this->multimediaRepo->guardar([
            'nombre_archivo' => $dto->nombre_original,
            'ruta_archivo' => $rutaRelativa,
            'tipo_mime' => $dto->tipo_mime,
            'tamano_bytes' => $dto->tamano_bytes,
            'ancho' => $ancho,
            'alto' => $alto,
            'activo' => true,
            'subido_por_id' => $dto->subido_por_id,
        ]);
    }

    private function esImagen(string $mime): bool
    {
        return str_starts_with($mime, 'image/');
    }

    /**
     * Extrae ancho y alto sin guardar en disco (usa stream de memoria).
     *
     * @return array{ancho: int|null, alto: int|null}
     */
    private function dimensionesDesdeContenido(string $contenido): array
    {
        $info = @getimagesizefromstring($contenido);

        if ($info === false || $info[0] === 0 || $info[1] === 0) {
            return ['ancho' => null, 'alto' => null];
        }

        return ['ancho' => $info[0], 'alto' => $info[1]];
    }
}
