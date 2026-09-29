<?php

declare(strict_types=1);

namespace App\Http\Controllers\Carrito;

use App\Aplicacion\Carrito\CasosUso\ActualizarCantidad;
use App\Aplicacion\Carrito\CasosUso\AgregarItem;
use App\Aplicacion\Carrito\CasosUso\EliminarItem;
use App\Aplicacion\Carrito\CasosUso\ObtenerCarrito;
use App\Aplicacion\Carrito\CasosUso\VaciarCarrito;
use App\Aplicacion\Carrito\DTOs\AgregarItemDTO;
use App\Http\Controllers\Controller;
use App\Http\Requests\Carrito\ActualizarCantidadRequest;
use App\Http\Requests\Carrito\AgregarItemRequest;
use App\Http\Resources\CarritoResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CarritoController extends Controller
{
    public function __construct(
        private readonly ObtenerCarrito $obtener,
        private readonly AgregarItem $agregar,
        private readonly ActualizarCantidad $actualizar,
        private readonly EliminarItem $eliminar,
        private readonly VaciarCarrito $vaciar,
    ) {}

    public function index(Request $request): JsonResponse
    {
        return response()->json(['success' => true, 'data' => new CarritoResource($this->obtener->execute((int) $request->user()->id))]);
    }

    public function store(AgregarItemRequest $request): JsonResponse
    {
        $datos = $request->validated();
        $carrito = $this->agregar->execute((int) $request->user()->id, new AgregarItemDTO(
            (int) $datos['producto_id'], (int) $datos['cantidad'], $datos['comentario'] ?? null,
            isset($datos['diseno_torta_id']) ? (int) $datos['diseno_torta_id'] : null,
            isset($datos['plantilla_diseno_id']) ? (int) $datos['plantilla_diseno_id'] : null,
            isset($datos['diseno_personalizado_id']) ? (int) $datos['diseno_personalizado_id'] : null,
        ));

        return response()->json(['success' => true, 'message' => 'Producto agregado al carrito.', 'data' => new CarritoResource($carrito)], 201);
    }

    public function update(ActualizarCantidadRequest $request, int $id): JsonResponse
    {
        $carrito = $this->actualizar->execute((int) $request->user()->id, $id, (int) $request->validated('cantidad'));

        return response()->json(['success' => true, 'message' => 'Cantidad actualizada.', 'data' => new CarritoResource($carrito)]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $carrito = $this->eliminar->execute((int) $request->user()->id, $id);

        return response()->json(['success' => true, 'message' => 'Item eliminado.', 'data' => new CarritoResource($carrito)]);
    }

    public function clear(Request $request): JsonResponse
    {
        $carrito = $this->vaciar->execute((int) $request->user()->id);

        return response()->json(['success' => true, 'message' => 'Carrito vaciado.', 'data' => new CarritoResource($carrito)]);
    }
}
