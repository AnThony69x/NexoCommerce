<?php

declare(strict_types=1);

namespace App\Http\Controllers\Tienda;

use App\Aplicacion\Tienda\CasosUso\ActualizarConfiguracionTienda;
use App\Aplicacion\Tienda\CasosUso\ObtenerConfiguracionTienda;
use App\Aplicacion\Tienda\DTOs\ActualizarConfiguracionTiendaDTO;
use App\Http\Controllers\Controller;
use App\Http\Requests\Tienda\ActualizarConfiguracionTiendaRequest;
use App\Http\Resources\ConfiguracionTiendaResource;
use Illuminate\Http\JsonResponse;

class ConfiguracionTiendaController extends Controller
{
    public function __construct(
        private readonly ObtenerConfiguracionTienda $obtener,
        private readonly ActualizarConfiguracionTienda $actualizar,
    ) {}

    public function mostrar(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => new ConfiguracionTiendaResource($this->obtener->execute()),
        ]);
    }

    public function actualizar(ActualizarConfiguracionTiendaRequest $request): JsonResponse
    {
        $datos = $request->validated();

        $configuracion = $this->actualizar->execute(new ActualizarConfiguracionTiendaDTO(
            nombre_tienda: $datos['nombre_tienda'],
            logo_url: $datos['logo_url'] ?? null,
            favicon_url: $datos['favicon_url'] ?? null,
            color_primario: $datos['color_primario'],
            color_secundario: $datos['color_secundario'],
            color_acento: $datos['color_acento'] ?? null,
            color_fondo: $datos['color_fondo'] ?? null,
            color_texto: $datos['color_texto'] ?? null,
            telefono: $datos['telefono'] ?? null,
            correo: $datos['correo'] ?? null,
            direccion: $datos['direccion'] ?? null,
            activo: (bool) ($datos['activo'] ?? true),
        ));

        return response()->json([
            'success' => true,
            'message' => 'Configuracion de la tienda actualizada.',
            'data' => new ConfiguracionTiendaResource($configuracion),
        ]);
    }
}
