<?php

declare(strict_types=1);

namespace App\Infraestructura\Almacenamiento;

use App\Aplicacion\Multimedia\Contratos\AlmacenamientoArchivosInterface;
use App\Dominio\Compartido\Excepciones\DominioException;
use Illuminate\Support\Facades\Storage;
use Throwable;

/**
 * Implementacion SFTP del puerto de almacenamiento (disco `multimedia_sftp`, Laptop 5).
 * Cualquier fallo del servidor se devuelve como 503 controlado, nunca como 404 ni 500.
 */
final class SftpAlmacenamientoArchivos implements AlmacenamientoArchivosInterface
{
    public function guardar(string $rutaRelativa, string $contenido): string
    {
        $this->ejecutar(fn () => Storage::disk('multimedia_sftp')->put($rutaRelativa, $contenido));

        return $rutaRelativa;
    }

    public function eliminar(string $rutaRelativa): void
    {
        $this->ejecutar(function () use ($rutaRelativa): void {
            if (Storage::disk('multimedia_sftp')->exists($rutaRelativa)) {
                Storage::disk('multimedia_sftp')->delete($rutaRelativa);
            }
        });
    }

    public function leer(string $rutaRelativa): ?string
    {
        return $this->ejecutar(function () use ($rutaRelativa): ?string {
            $disco = Storage::disk('multimedia_sftp');

            return $disco->exists($rutaRelativa) ? $disco->get($rutaRelativa) : null;
        });
    }

    /**
     * @template T
     *
     * @param  callable(): T  $operacion
     * @return T
     */
    private function ejecutar(callable $operacion): mixed
    {
        try {
            return $operacion();
        } catch (Throwable $excepcion) {
            throw new DominioException(
                'El servidor de archivos no esta disponible.',
                'MUL_ALMACENAMIENTO_NO_DISPONIBLE',
                503,
                $excepcion,
            );
        }
    }
}
