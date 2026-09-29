<?php

declare(strict_types=1);

namespace App\Http\Controllers\Pagos;

use App\Aplicacion\Pagos\CasosUso\ConsultarPagoPedido;
use App\Aplicacion\Pagos\CasosUso\RegistrarPago;
use App\Aplicacion\Pagos\CasosUso\VerificarPagoAdmin;
use App\Aplicacion\Pagos\DTOs\RegistrarPagoDTO;
use App\Http\Controllers\Controller;
use App\Http\Requests\Pagos\RegistrarPagoRequest;
use App\Http\Requests\Pagos\VerificarPagoRequest;
use App\Http\Resources\PagoResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PagoController extends Controller
{
    public function __construct(
        private readonly RegistrarPago $registrar,
        private readonly ConsultarPagoPedido $consultar,
        private readonly VerificarPagoAdmin $verificar,
    ) {}

    public function store(RegistrarPagoRequest $request): JsonResponse
    {
        $datos = $request->validated();
        $pago = $this->registrar->execute((int) $request->user()->id, new RegistrarPagoDTO(
            (int) $datos['pedido_id'], $datos['metodo'], $datos['monto'],
            $datos['referencia_pasarela'] ?? null,
            isset($datos['multimedia_id']) ? (int) $datos['multimedia_id'] : null,
        ));

        return response()->json([
            'success' => true, 'message' => 'Pago registrado. En espera de verificacion.',
            'data' => new PagoResource($pago),
        ], 201);
    }

    public function show(Request $request, int $pedidoId): JsonResponse
    {
        $pago = $this->consultar->execute(
            (int) $request->user()->id,
            $request->user()->rol?->nombre === 'ADMIN',
            $pedidoId,
        );

        return response()->json(['success' => true, 'data' => $pago !== null ? new PagoResource($pago) : null]);
    }

    public function verify(VerificarPagoRequest $request, int $id): JsonResponse
    {
        $datos = $request->validated();
        $pago = $this->verificar->execute((int) $request->user()->id, $id, $datos['estado'], $datos['comentario_revision'] ?? null);

        return response()->json([
            'success' => true, 'message' => 'Pago actualizado.', 'data' => new PagoResource($pago),
        ]);
    }
}
