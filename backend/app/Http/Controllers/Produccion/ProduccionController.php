<?php

declare(strict_types=1);

namespace App\Http\Controllers\Produccion;

use App\Aplicacion\Produccion\CasosUso\ActualizarCupo;
use App\Aplicacion\Produccion\CasosUso\ConsultarDisponibilidad;
use App\Aplicacion\Produccion\CasosUso\CrearCupo;
use App\Aplicacion\Produccion\CasosUso\DesactivarCupo;
use App\Aplicacion\Produccion\CasosUso\ListarCupos;
use App\Aplicacion\Produccion\DTOs\ActualizarConfiguracionProduccionDTO;
use App\Aplicacion\Produccion\DTOs\CrearConfiguracionProduccionDTO;
use App\Aplicacion\Produccion\DTOs\FiltrosProduccionDTO;
use App\Dominio\Produccion\Entidades\ConfiguracionProduccion;
use App\Http\Controllers\Controller;
use App\Http\Requests\Produccion\ActualizarConfiguracionProduccionRequest;
use App\Http\Requests\Produccion\ConsultarDisponibilidadRequest;
use App\Http\Requests\Produccion\CrearConfiguracionProduccionRequest;
use App\Http\Requests\Produccion\ListarProduccionRequest;
use App\Http\Resources\ConfiguracionProduccionResource;
use App\Http\Resources\DisponibilidadProduccionResource;
use Illuminate\Http\JsonResponse;

class ProduccionController extends Controller
{
    public function __construct(
        private readonly ListarCupos $listarCupos,
        private readonly ConsultarDisponibilidad $consultarDisponibilidad,
        private readonly CrearCupo $crearCupo,
        private readonly ActualizarCupo $actualizarCupo,
        private readonly DesactivarCupo $desactivarCupo,
    ) {}

    public function disponibilidad(ConsultarDisponibilidadRequest $request): JsonResponse
    {
        $datos = $request->validated();
        $configuracion = $this->consultarDisponibilidad->execute(
            $datos['fecha'],
            isset($datos['categoria_id']) ? (int) $datos['categoria_id'] : null,
        );

        return response()->json([
            'success' => true,
            'data' => new DisponibilidadProduccionResource($configuracion),
        ]);
    }

    public function index(ListarProduccionRequest $request): JsonResponse
    {
        $datos = $request->validated();
        $configuraciones = $this->listarCupos->execute(new FiltrosProduccionDTO(
            fecha: $datos['fecha'] ?? null,
            categoria_id: isset($datos['categoria_id']) ? (int) $datos['categoria_id'] : null,
            activo: array_key_exists('activo', $datos)
                ? filter_var($datos['activo'], FILTER_VALIDATE_BOOLEAN)
                : null,
        ));

        return response()->json([
            'success' => true,
            'data' => array_map(
                static fn (ConfiguracionProduccion $configuracion): array => (new ConfiguracionProduccionResource($configuracion))->toArray($request),
                $configuraciones,
            ),
        ]);
    }

    public function store(CrearConfiguracionProduccionRequest $request): JsonResponse
    {
        $datos = $request->validated();
        $configuracion = $this->crearCupo->execute(new CrearConfiguracionProduccionDTO(
            fecha: $datos['fecha'],
            categoria_id: isset($datos['categoria_id']) ? (int) $datos['categoria_id'] : null,
            capacidad_maxima: (int) $datos['capacidad_maxima'],
            activo: (bool) ($datos['activo'] ?? true),
        ));

        return response()->json([
            'success' => true,
            'message' => 'Configuracion de produccion creada con exito.',
            'data' => new ConfiguracionProduccionResource($configuracion),
        ], 201);
    }

    public function update(ActualizarConfiguracionProduccionRequest $request, int $id): JsonResponse
    {
        $configuracion = $this->actualizarCupo->execute(
            $id,
            new ActualizarConfiguracionProduccionDTO($request->validated()),
        );

        return response()->json([
            'success' => true,
            'message' => 'Configuracion de produccion actualizada con exito.',
            'data' => new ConfiguracionProduccionResource($configuracion),
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $this->desactivarCupo->execute($id);

        return response()->json([
            'success' => true,
            'message' => 'Configuracion de produccion desactivada.',
        ]);
    }
}
