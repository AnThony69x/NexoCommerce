<?php

declare(strict_types=1);

namespace App\Infraestructura\Almacenamiento;

use App\Aplicacion\Multimedia\Contratos\AlmacenamientoArchivosInterface;
use Illuminate\Support\Facades\Storage;
use RuntimeException;

/**
 * Implementacion local del puerto de almacenamiento.
 * Usa el disco `multimedia` (storage/app/multimedia).
 *
 * Para migrar a SFTP (Laptop 5) solo cambiar el binding en AppServiceProvider
 * por una implementacion SftpAlmacenamientoArchivos que use el disco `multimedia_sftp`.
 */
final class LocalAlmacenamientoArchivos implements AlmacenamientoArchivosInterface
{
    public function guardar(string $rutaRelativa, string $contenido): string
    {
        $guardado = Storage::disk('multimedia')->put($rutaRelativa, $contenido);

        if ($guardado === false) {
            throw new RuntimeException('No se pudo guardar el archivo multimedia.');
        }

        return $rutaRelativa;
    }

    public function eliminar(string $rutaRelativa): void
    {
        if (Storage::disk('multimedia')->exists($rutaRelativa)) {
            Storage::disk('multimedia')->delete($rutaRelativa);
        }
    }
}
