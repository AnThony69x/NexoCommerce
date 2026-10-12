<?php

declare(strict_types=1);

namespace App\Http\Controllers\Productos;

use App\Aplicacion\Productos\CasosUso\CrearDisenoPersonalizado;
use App\Aplicacion\Productos\CasosUso\ListarDisenosPersonalizados;
use App\Aplicacion\Productos\DTOs\CrearDisenoPersonalizadoDTO;
use App\Dominio\Productos\Entidades\DisenoPersonalizado;
use App\Http\Controllers\Controller;
use App\Http\Requests\Productos\CrearDisenoPersonalizadoRequest;
use App\Http\Resources\DisenoPersonalizadoResource;
use App\Infraestructura\Persistencia\Eloquent\Modelos\UsuarioModelo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DisenoPersonalizadoController extends Controller
{
    public function __construct(
        private readonly ListarDisenosPersonalizados $listarDisenos,
        private readonly CrearDisenoPersonalizado $crearDiseno,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $usuarioId = $this->usuarioId($request);
        $disenos = $this->listarDisenos->execute($usuarioId);

        return response()->json([
            'success' => true,
            'data' => array_map(
                static fn (DisenoPersonalizado $diseno): array => (new DisenoPersonalizadoResource($diseno))->toArray($request),
                $disenos,
            ),
        ]);
    }

    public function store(CrearDisenoPersonalizadoRequest $request): JsonResponse
    {
        $datos = $request->validated();
        $diseno = $this->crearDiseno->execute(
            $this->usuarioId($request),
            new CrearDisenoPersonalizadoDTO(
                sublimacion_id: (int) $datos['sublimacion_id'],
                multimedia_id: (int) $datos['multimedia_id'],
                indicaciones: $datos['indicaciones'] ?? null,
            ),
        );

        return response()->json([
            'success' => true,
            'message' => 'Diseno personalizado creado.',
            'data' => new DisenoPersonalizadoResource($diseno),
        ], 201);
    }

    private function usuarioId(Request $request): int
    {
        /** @var UsuarioModelo $usuario */
        $usuario = $request->user();

        return (int) $usuario->id;
    }
}
