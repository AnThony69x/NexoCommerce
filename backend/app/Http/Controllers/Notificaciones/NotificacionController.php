<?php

declare(strict_types=1);

namespace App\Http\Controllers\Notificaciones;

use App\Aplicacion\Notificaciones\CasosUso\ListarNotificaciones;
use App\Aplicacion\Notificaciones\CasosUso\MarcarNotificacionLeida;
use App\Aplicacion\Notificaciones\CasosUso\MarcarTodasLeidas;
use App\Dominio\Notificaciones\Entidades\Notificacion;
use App\Http\Controllers\Controller;
use App\Http\Requests\Notificaciones\ListarNotificacionesRequest;
use App\Http\Resources\NotificacionResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificacionController extends Controller
{
    public function __construct(
        private readonly ListarNotificaciones $listar,
        private readonly MarcarNotificacionLeida $marcar,
        private readonly MarcarTodasLeidas $marcarTodas,
    ) {}

    public function index(ListarNotificacionesRequest $request): JsonResponse
    {
        $datos = $request->validated();
        $leida = isset($datos['leida']) ? filter_var($datos['leida'], FILTER_VALIDATE_BOOLEAN) : null;
        $resultado = $this->listar->execute((int) $request->user()->id, $leida, (int) ($datos['page'] ?? 1));

        return response()->json([
            'success' => true,
            'data' => array_map(static fn (Notificacion $notificacion): array => (new NotificacionResource($notificacion))->toArray($request), $resultado['datos']),
            'meta' => [
                'pagina_actual' => $resultado['pagina_actual'], 'por_pagina' => $resultado['por_pagina'],
                'total' => $resultado['total'], 'total_paginas' => $resultado['total_paginas'],
                'total_no_leidas' => $resultado['total_no_leidas'],
            ],
        ]);
    }

    public function marcarLeida(Request $request, int $id): JsonResponse
    {
        $notificacion = $this->marcar->execute((int) $request->user()->id, $id);

        return response()->json([
            'success' => true, 'message' => 'Notificacion marcada como leida.',
            'data' => ['id' => $notificacion->id, 'leida' => $notificacion->leida, 'fecha_lectura' => NotificacionResource::fecha($notificacion->fechaLectura)],
        ]);
    }

    public function marcarTodas(Request $request): JsonResponse
    {
        $actualizadas = $this->marcarTodas->execute((int) $request->user()->id);

        return response()->json([
            'success' => true, 'message' => 'Notificaciones marcadas como leidas.',
            'data' => ['actualizadas' => $actualizadas],
        ]);
    }
}
