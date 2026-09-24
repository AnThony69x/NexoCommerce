<?php

declare(strict_types=1);

namespace App\Http\Controllers\Publicaciones;

use App\Aplicacion\Publicaciones\CasosUso\ActualizarPublicacion;
use App\Aplicacion\Publicaciones\CasosUso\ConsultarPublicacion;
use App\Aplicacion\Publicaciones\CasosUso\CrearPublicacion;
use App\Aplicacion\Publicaciones\CasosUso\DesactivarPublicacion;
use App\Aplicacion\Publicaciones\CasosUso\ListarPublicaciones;
use App\Aplicacion\Publicaciones\DTOs\ActualizarPublicacionDTO;
use App\Aplicacion\Publicaciones\DTOs\CrearPublicacionDTO;
use App\Aplicacion\Publicaciones\DTOs\FiltrosPublicacionDTO;
use App\Dominio\Publicaciones\Entidades\Publicacion;
use App\Http\Controllers\Controller;
use App\Http\Requests\Publicaciones\ActualizarPublicacionRequest;
use App\Http\Requests\Publicaciones\CrearPublicacionRequest;
use App\Http\Requests\Publicaciones\ListarPublicacionesRequest;
use App\Http\Resources\PublicacionResource;
use App\Infraestructura\Persistencia\Eloquent\Modelos\UsuarioModelo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PublicacionController extends Controller
{
    public function __construct(
        private readonly ListarPublicaciones $listarPublicaciones,
        private readonly ConsultarPublicacion $consultarPublicacion,
        private readonly CrearPublicacion $crearPublicacion,
        private readonly ActualizarPublicacion $actualizarPublicacion,
        private readonly DesactivarPublicacion $desactivarPublicacion,
    ) {}

    public function index(ListarPublicacionesRequest $request): JsonResponse
    {
        $datos = $request->validated();
        $resultado = $this->listarPublicaciones->execute(new FiltrosPublicacionDTO(
            categoria_id: isset($datos['categoria_id']) ? (int) $datos['categoria_id'] : null,
            producto_id: isset($datos['producto_id']) ? (int) $datos['producto_id'] : null,
            page: (int) ($datos['page'] ?? 1),
            incluir_inactivas: $this->esAdmin($request),
        ));

        return response()->json([
            'success' => true,
            'data' => array_map(
                static fn (Publicacion $publicacion): array => (new PublicacionResource($publicacion))->toArray($request),
                $resultado['datos'],
            ),
            'meta' => [
                'pagina_actual' => $resultado['pagina_actual'],
                'por_pagina' => $resultado['por_pagina'],
                'total' => $resultado['total'],
                'total_paginas' => $resultado['total_paginas'],
            ],
        ]);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $publicacion = $this->consultarPublicacion->execute($id, $this->esAdmin($request));

        return response()->json([
            'success' => true,
            'data' => new PublicacionResource($publicacion),
        ]);
    }

    public function store(CrearPublicacionRequest $request): JsonResponse
    {
        $datos = $request->validated();
        $publicacion = $this->crearPublicacion->execute(
            (int) $request->user()->id,
            new CrearPublicacionDTO(
                titulo: $datos['titulo'],
                descripcion: $datos['descripcion'] ?? null,
                categoria_id: isset($datos['categoria_id']) ? (int) $datos['categoria_id'] : null,
                producto_id: isset($datos['producto_id']) ? (int) $datos['producto_id'] : null,
                activo: (bool) ($datos['activo'] ?? true),
                imagenes: $this->normalizarImagenes($datos['imagenes'] ?? []),
            ),
        );

        return response()->json([
            'success' => true,
            'message' => 'Publicacion creada con exito.',
            'data' => new PublicacionResource($publicacion),
        ], 201);
    }

    public function update(ActualizarPublicacionRequest $request, int $id): JsonResponse
    {
        $datos = $request->validated();
        if (array_key_exists('imagenes', $datos)) {
            $datos['imagenes'] = $this->normalizarImagenes($datos['imagenes']);
        }

        $publicacion = $this->actualizarPublicacion->execute($id, new ActualizarPublicacionDTO($datos));

        return response()->json([
            'success' => true,
            'message' => 'Publicacion actualizada con exito.',
            'data' => new PublicacionResource($publicacion),
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $this->desactivarPublicacion->execute($id);

        return response()->json([
            'success' => true,
            'message' => 'Publicacion desactivada.',
        ]);
    }

    private function esAdmin(Request $request): bool
    {
        Auth::guard('sanctum')->forgetUser();

        /** @var UsuarioModelo|null $usuario */
        $usuario = $request->user('sanctum');

        if ($usuario === null) {
            return false;
        }

        $usuario->loadMissing('rol');

        return $usuario->rol?->nombre === 'ADMIN';
    }

    private function normalizarImagenes(array $imagenes): array
    {
        return array_map(static fn (array $imagen): array => [
            'multimedia_id' => (int) $imagen['multimedia_id'],
            'orden' => (int) ($imagen['orden'] ?? 0),
        ], $imagenes);
    }
}
