<?php

declare(strict_types=1);

namespace App\Http\Controllers\Pedidos;

use App\Aplicacion\Pedidos\CasosUso\CambiarEstadoPedido;
use App\Aplicacion\Pedidos\CasosUso\ConsultarPedido;
use App\Aplicacion\Pedidos\CasosUso\CrearPedidoDesdeCarrito;
use App\Aplicacion\Pedidos\CasosUso\ListarPedidosAdmin;
use App\Aplicacion\Pedidos\CasosUso\ListarPedidosUsuario;
use App\Aplicacion\Pedidos\DTOs\CrearPedidoDTO;
use App\Dominio\Pedidos\Entidades\Pedido;
use App\Http\Controllers\Controller;
use App\Http\Requests\Pedidos\CambiarEstadoPedidoRequest;
use App\Http\Requests\Pedidos\CrearPedidoRequest;
use App\Http\Requests\Pedidos\ListarPedidosRequest;
use App\Http\Resources\PedidoDetalleResource;
use App\Http\Resources\PedidoResumenResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PedidoController extends Controller
{
    public function __construct(
        private readonly CrearPedidoDesdeCarrito $crear,
        private readonly ListarPedidosUsuario $listarUsuario,
        private readonly ConsultarPedido $consultar,
        private readonly ListarPedidosAdmin $listarAdmin,
        private readonly CambiarEstadoPedido $cambiarEstado,
    ) {}

    public function store(CrearPedidoRequest $request): JsonResponse
    {
        $datos = $request->validated();
        $pedido = $this->crear->execute((int) $request->user()->id, new CrearPedidoDTO($datos['fecha_entrega'], $datos['total_esperado']));

        return response()->json([
            'success' => true, 'message' => 'Pedido creado. Pendiente de pago.',
            'data' => new PedidoResumenResource($pedido),
        ], 201);
    }

    public function index(ListarPedidosRequest $request): JsonResponse
    {
        return $this->respuestaListado($this->listarUsuario->execute((int) $request->user()->id, $request->validated()), $request);
    }

    public function adminIndex(ListarPedidosRequest $request): JsonResponse
    {
        return $this->respuestaListado($this->listarAdmin->execute($request->validated()), $request);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $pedido = $this->consultar->execute($id, (int) $request->user()->id, $request->user()->rol?->nombre === 'ADMIN');

        return response()->json(['success' => true, 'data' => new PedidoDetalleResource($pedido)]);
    }

    public function updateEstado(CambiarEstadoPedidoRequest $request, int $id): JsonResponse
    {
        $pedido = $this->cambiarEstado->execute($id, $request->validated('estado'));

        return response()->json(['success' => true, 'message' => 'Estado actualizado.', 'data' => new PedidoDetalleResource($pedido)]);
    }

    private function respuestaListado(array $resultado, Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => array_map(static fn (Pedido $pedido): array => (new PedidoResumenResource($pedido))->toArray($request), $resultado['datos']),
            'meta' => [
                'pagina_actual' => $resultado['pagina_actual'], 'por_pagina' => $resultado['por_pagina'],
                'total' => $resultado['total'], 'total_paginas' => $resultado['total_paginas'],
            ],
        ]);
    }
}
