<?php

declare(strict_types=1);

namespace App\Http\Controllers\Multimedia;

use App\Aplicacion\Multimedia\CasosUso\DesactivarMultimedia;
use App\Aplicacion\Multimedia\CasosUso\DescargarMultimedia;
use App\Aplicacion\Multimedia\CasosUso\ObtenerMultimedia;
use App\Aplicacion\Multimedia\CasosUso\SubirArchivoMultimedia;
use App\Aplicacion\Multimedia\DTOs\SubirMultimediaDTO;
use App\Http\Controllers\Controller;
use App\Http\Requests\Multimedia\SubirMultimediaRequest;
use App\Http\Resources\MultimediaResource;
use App\Infraestructura\Persistencia\Eloquent\Modelos\UsuarioModelo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

/**
 * Controlador delgado para /api/v1/multimedia.
 * Toda la logica de negocio vive en los casos de uso.
 */
class MultimediaController extends Controller
{
    public function __construct(
        private readonly SubirArchivoMultimedia $subirArchivo,
        private readonly ObtenerMultimedia $obtener,
        private readonly DesactivarMultimedia $desactivar,
        private readonly DescargarMultimedia $descargar,
    ) {}

    /**
     * POST /api/v1/multimedia
     * Sube un archivo y persiste sus metadatos.
     */
    public function subir(SubirMultimediaRequest $request): JsonResponse
    {
        /** @var UsuarioModelo $usuario */
        $usuario = $request->user();

        $archivo = $request->file('archivo');
        $datos = $request->validated();

        $dto = new SubirMultimediaDTO(
            destino: $datos['destino'],
            nombre_original: $archivo->getClientOriginalName(),
            extension: strtolower($archivo->getClientOriginalExtension()),
            tipo_mime: $archivo->getMimeType() ?? $archivo->getClientMimeType(),
            tamano_bytes: $archivo->getSize(),
            contenido_binario: $archivo->getContent(),
            subido_por_id: $usuario->id,
        );

        $multimedia = $this->subirArchivo->execute($dto);

        return response()->json([
            'success' => true,
            'message' => 'Archivo registrado.',
            'data' => new MultimediaResource($multimedia),
        ], 201);
    }

    /**
     * GET /api/v1/multimedia/{id}
     * Devuelve los metadatos de un archivo activo.
     */
    public function mostrar(int $id, Request $request): JsonResponse
    {
        $usuario = $request->user();
        $multimedia = $this->obtener->execute($id, (int) $usuario->id, $usuario->rol?->nombre === 'ADMIN');

        return response()->json([
            'success' => true,
            'data' => new MultimediaResource($multimedia),
        ]);
    }

    public function archivoPublico(string $ruta): Response
    {
        $archivo = $this->descargar->publica($ruta);

        return response($archivo->contenido, 200, [
            'Content-Type' => $archivo->tipoMime,
            'Content-Disposition' => 'inline; filename="'.$archivo->nombre.'"',
            'Cache-Control' => 'public, max-age=60',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }

    public function archivoPrivado(int $id, Request $request): Response
    {
        $usuario = $request->user();
        $archivo = $this->descargar->privada($id, (int) $usuario->id, $usuario->rol?->nombre === 'ADMIN');

        return response($archivo->contenido, 200, [
            'Content-Type' => $archivo->tipoMime,
            'Content-Disposition' => 'inline; filename="'.$archivo->nombre.'"',
            'Cache-Control' => 'no-store',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }

    /**
     * DELETE /api/v1/multimedia/{id}
     * Desactiva logicamente (activo = false).
     */
    public function desactivar(int $id, Request $request): JsonResponse
    {
        /** @var UsuarioModelo $usuario */
        $usuario = $request->user();

        $esAdmin = $usuario->rol?->nombre === 'ADMIN';

        $this->desactivar->execute($id, $usuario->id, $esAdmin);

        return response()->json([
            'success' => true,
            'message' => 'Archivo desactivado correctamente.',
        ]);
    }
}
