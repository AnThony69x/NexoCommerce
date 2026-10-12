<?php

declare(strict_types=1);

namespace App\Aplicacion\Multimedia\DTOs;

/**
 * Datos de entrada para el caso de uso SubirArchivoMultimedia.
 * El contenido binario se pasa como string para mantener el caso de uso
 * independiente de Illuminate\Http\UploadedFile.
 */
final readonly class SubirMultimediaDTO
{
    public function __construct(
        public string $destino,
        public string $nombre_original,
        public string $extension,
        public string $tipo_mime,
        public int $tamano_bytes,
        public string $contenido_binario,
        public int $subido_por_id,
    ) {}
}
