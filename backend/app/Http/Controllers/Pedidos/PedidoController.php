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
use App\Infraestructura\Persistencia\Eloquent\Modelos\UsuarioModelo;
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
        $pedido = $this->crear->execute((int) $request->user()->id, new CrearPedidoDTO(
            $datos['fecha_entrega'], $datos['total_esperado'], $datos['tipo_entrega'] ?? 'RETIRO',
            $datos['direccion_entrega'] ?? null, $datos['telefono_contacto'] ?? null, $datos['hora_entrega'] ?? null,
        ));

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
        $resultado = $this->listarAdmin->execute($request->validated());
        $usuarioIds = array_map(static fn (Pedido $pedido): int => $pedido->usuario_id, $resultado['datos']);
        $usuarios = $usuarioIds === [] ? collect() : UsuarioModelo::query()->whereIn('id', $usuarioIds)
            ->get(['id', 'nombre_completo'])->keyBy('id');
        $items = array_map(static function (Pedido $pedido) use ($request, $usuarios): array {
            $usuario = $usuarios->get($pedido->usuario_id);
            return [
                ...(new PedidoResumenResource($pedido))->toArray($request),
                'cliente' => $usuario === null ? null : ['id' => (int) $usuario->id, 'nombre_completo' => $usuario->nombre_completo],
            ];
        }, $resultado['datos']);
        return response()->json(['success' => true, 'data' => $items, 'meta' => [
            'pagina_actual' => $resultado['pagina_actual'], 'por_pagina' => $resultado['por_pagina'],
            'total' => $resultado['total'], 'total_paginas' => $resultado['total_paginas'],
        ]]);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $pedido = $this->consultar->execute($id, (int) $request->user()->id, $request->user()->rol?->nombre === 'ADMIN');

        $datos = (new PedidoDetalleResource($pedido))->toArray($request);
        if ($request->user()->rol?->nombre === 'ADMIN') {
            $cliente = UsuarioModelo::query()->find($pedido->usuario_id, ['id', 'nombre_completo', 'correo', 'telefono']);
            $datos['cliente'] = $cliente === null ? null : [
                'id' => (int) $cliente->id, 'nombre_completo' => $cliente->nombre_completo,
                'correo' => $cliente->correo, 'telefono' => $cliente->telefono,
            ];
        }
        return response()->json(['success' => true, 'data' => $datos]);
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
