<?php

declare(strict_types=1);

namespace App\Infraestructura\Persistencia\Eloquent\Repositorios;

use App\Aplicacion\Produccion\CasosUso\VerificarCapacidadProduccion;
use App\Aplicacion\Produccion\DTOs\SolicitudCapacidadProduccionDTO;
use App\Dominio\Carrito\Servicios\ReglasCarrito;
use App\Dominio\Compartido\Excepciones\DominioException;
use App\Dominio\Notificaciones\Eventos\EstadoPedidoCambiado;
use App\Dominio\Notificaciones\Eventos\PedidoCreado;
use App\Dominio\Pedidos\Entidades\DetallePedido;
use App\Dominio\Pedidos\Entidades\Pedido;
use App\Dominio\Pedidos\Repositorios\PedidoRepositorioInterface;
use App\Dominio\Pedidos\Servicios\EstadosPedido;
use App\Dominio\Pedidos\Servicios\IndicacionesPedido;
use App\Dominio\Produccion\Excepciones\CapacidadProduccionExcedidaException;
use App\Infraestructura\Persistencia\Eloquent\Modelos\CarritoModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\DetalleModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\DisenoPersonalizadoModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\DisenoTortaModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\PedidoModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\PlantillaDisenoModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\ProductoModelo;
use App\Infraestructura\Persistencia\Eloquent\Modelos\UsuarioModelo;
use DateTimeImmutable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;

final readonly class PedidoRepositorioEloquent implements PedidoRepositorioInterface
{
    public function __construct(private VerificarCapacidadProduccion $verificarCapacidad) {}

    public function crearDesdeCarrito(int $usuarioId, string $fechaEntrega, string $totalEsperado): Pedido|DominioException
    {
        return DB::transaction(function () use ($usuarioId, $fechaEntrega, $totalEsperado): Pedido|DominioException {
            UsuarioModelo::query()->whereKey($usuarioId)->lockForUpdate()->firstOrFail();
            $carrito = CarritoModelo::query()->where('usuario_id', $usuarioId)->where('activo', true)->first();
            $items = $carrito?->items()->orderBy('id')->get();
            if ($items === null || $items->isEmpty()) {
                return $this->error('El carrito esta vacio.', 'PED_CARRITO_VACIO');
            }

            $productoIds = $items->pluck('producto_id')->unique()->sort()->values()->all();
            $productos = ProductoModelo::query()->whereIn('id', $productoIds)->orderBy('id')->lockForUpdate()->get()->keyBy('id');
            $productos->each(fn (ProductoModelo $producto) => $producto->load(['torta', 'sublimacion']));
            $disenos = DisenoTortaModelo::query()->whereIn('id', $items->pluck('diseno_torta_id')->filter()->all())->orderBy('id')->lockForUpdate()->get()->keyBy('id');
            $plantillas = PlantillaDisenoModelo::query()->whereIn('id', $items->pluck('plantilla_diseno_id')->filter()->all())->orderBy('id')->lockForUpdate()->get()->keyBy('id');
            $personalizados = DisenoPersonalizadoModelo::query()->whereIn('id', $items->pluck('diseno_personalizado_id')->filter()->all())->orderBy('id')->lockForUpdate()->get()->keyBy('id');
            $stocks = DetalleModelo::query()->whereIn('producto_id', $productoIds)->orderBy('producto_id')->lockForUpdate()->get()->keyBy('producto_id');

            $filas = [];
            $cantidadesPorProducto = [];
            $cantidadesPorCategoria = [];
            $categoriasTorta = [];
            $totalCentavos = 0;
            $error = null;
            foreach ($items as $item) {
                $producto = $productos->get($item->producto_id);
                if ($producto === null) {
                    $error ??= $this->error('Item no disponible.', 'PED_ITEM_NO_DISPONIBLE');

                    continue;
                }
                $torta = $producto->torta !== null;
                $detalle = $stocks->has($producto->id);
                $tipo = $torta ? 'TORTA' : ($detalle ? 'DETALLE' : 'SUBLIMACION');
                $diseno = $item->diseno_torta_id !== null ? $disenos->get($item->diseno_torta_id) : null;
                $plantilla = $item->plantilla_diseno_id !== null ? $plantillas->get($item->plantilla_diseno_id) : null;
                $personalizado = $item->diseno_personalizado_id !== null ? $personalizados->get($item->diseno_personalizado_id) : null;
                $configuracionValida = ReglasCarrito::configuracionValida($tipo, $item->diseno_torta_id, $item->plantilla_diseno_id, $item->diseno_personalizado_id)
                    && ($item->diseno_torta_id === null || ($diseno !== null && $diseno->activo && $diseno->torta_id === $producto->id))
                    && ($item->plantilla_diseno_id === null || ($plantilla !== null && $plantilla->activo && $plantilla->sublimacion_id === $producto->id))
                    && ($item->diseno_personalizado_id === null || ($personalizado !== null && $personalizado->usuario_id === $usuarioId && $personalizado->sublimacion_id === $producto->id));
                if (! $producto->activo || ($tipo === 'SUBLIMACION' && $producto->sublimacion === null) || ! $configuracionValida) {
                    $error ??= $this->error('Item no disponible.', 'PED_ITEM_NO_DISPONIBLE');
                }

                $costo = (string) ($diseno?->costo_adicional ?? $plantilla?->costo_adicional ?? '0.00');
                $precio = ReglasCarrito::precio((string) $producto->precio_base, $costo);
                if ($precio !== (string) $item->precio_unitario) {
                    $item->update(['precio_unitario' => $precio]);
                }
                $subtotalCentavos = ReglasCarrito::centavos($precio) * $item->cantidad;
                $totalCentavos += $subtotalCentavos;
                $cantidadesPorProducto[$producto->id] = ($cantidadesPorProducto[$producto->id] ?? 0) + $item->cantidad;
                $cantidadesPorCategoria[$producto->categoria_id] = ($cantidadesPorCategoria[$producto->categoria_id] ?? 0) + $item->cantidad;
                if ($torta) {
                    $categoriasTorta[$producto->categoria_id] = (int) $producto->categoria_id;
                }
                $filas[] = [
                    'producto_id' => $producto->id, 'nombre_producto' => $producto->nombre,
                    'cantidad' => $item->cantidad, 'precio_unitario' => $precio,
                    'subtotal' => ReglasCarrito::decimal($subtotalCentavos),
                    'tipo_configuracion' => $diseno !== null ? 'DISENO_TORTA' : ($plantilla !== null ? 'PLANTILLA' : ($personalizado !== null ? 'DISENO_PERSONALIZADO' : null)),
                    'nombre_diseno' => $diseno?->nombre ?? $plantilla?->nombre,
                    'costo_diseno' => $costo,
                    'indicaciones' => IndicacionesPedido::combinar($item->comentario, $personalizado?->indicaciones),
                    'diseno_torta_id' => $item->diseno_torta_id,
                    'plantilla_diseno_id' => $item->plantilla_diseno_id,
                    'diseno_personalizado_id' => $item->diseno_personalizado_id,
                ];
            }
            if ($error !== null) {
                return $error;
            }
            foreach ($cantidadesPorProducto as $productoId => $cantidad) {
                if ($stocks->has($productoId) && $cantidad > $stocks->get($productoId)->stock) {
                    return $this->error('Stock insuficiente.', 'PED_SIN_STOCK');
                }
            }
            if ($totalCentavos > 9_999_999_999) {
                return $this->error('Total fuera de rango.', 'PED_TOTAL_INVALIDO');
            }
            $total = ReglasCarrito::decimal($totalCentavos);
            if ($totalCentavos !== ReglasCarrito::centavos($totalEsperado)) {
                return $this->error('El precio del carrito cambio. Consulta el carrito y confirma el total vigente.', 'PED_PRECIO_CAMBIADO');
            }

            try {
                $this->verificarCapacidad->execute(new SolicitudCapacidadProduccionDTO($fechaEntrega, $cantidadesPorCategoria, array_values($categoriasTorta)));
            } catch (CapacidadProduccionExcedidaException $excepcion) {
                return $excepcion;
            }

            $pedido = PedidoModelo::create([
                'usuario_id' => $usuarioId, 'fecha_entrega' => $fechaEntrega,
                'estado' => 'PENDIENTE', 'subtotal' => $total, 'total' => $total,
            ]);
            $pedido->items()->createMany($filas);
            foreach ($cantidadesPorProducto as $productoId => $cantidad) {
                if ($stocks->has($productoId)) {
                    $stocks->get($productoId)->decrement('stock', $cantidad);
                }
            }
            $carrito->items()->delete();

            Event::dispatch(new PedidoCreado((int) $pedido->id, $usuarioId));

            return $this->mapear($pedido->load('items'));
        }, 3);
    }

    public function listar(array $filtros, ?int $usuarioId): array
    {
        $consulta = PedidoModelo::query();
        if ($usuarioId !== null) {
            $consulta->where('usuario_id', $usuarioId);
        }
        foreach (['estado', 'fecha_entrega', 'usuario_id'] as $campo) {
            if (isset($filtros[$campo]) && ($campo !== 'usuario_id' || $usuarioId === null)) {
                $consulta->where($campo, $filtros[$campo]);
            }
        }
        $pagina = $consulta->orderByDesc('creado_en')->orderByDesc('id')->paginate(15, ['*'], 'page', (int) ($filtros['page'] ?? 1));

        return [
            'datos' => array_map(fn (PedidoModelo $modelo): Pedido => $this->mapear($modelo), $pagina->items()),
            'pagina_actual' => $pagina->currentPage(), 'por_pagina' => $pagina->perPage(),
            'total' => $pagina->total(), 'total_paginas' => $pagina->lastPage(),
        ];
    }

    public function buscarPorId(int $id): ?Pedido
    {
        $modelo = PedidoModelo::query()->with('items')->find($id);

        return $modelo !== null ? $this->mapear($modelo, true) : null;
    }

    public function cambiarEstado(int $id, string $estado): Pedido
    {
        return DB::transaction(function () use ($id, $estado): Pedido {
            $modelo = PedidoModelo::query()->whereKey($id)->lockForUpdate()->first();
            if ($modelo === null) {
                throw new DominioException('Pedido no encontrado.', 'PED_NO_ENCONTRADO', 404);
            }
            if (! EstadosPedido::admite($modelo->estado, $estado)) {
                throw $this->error('Transicion de estado invalida.', 'PED_ESTADO_INVALIDO');
            }
            if ($estado === 'EN_PREPARACION' && ! DB::table('pagos')->where('pedido_id', $id)->where('estado', 'APROBADO')->exists()) {
                throw $this->error('El pago no esta aprobado.', 'PED_PAGO_NO_APROBADO');
            }
            $modelo->update(['estado' => $estado]);

            Event::dispatch(new EstadoPedidoCambiado((int) $modelo->id, (int) $modelo->usuario_id, $estado));

            return $this->mapear($modelo->load('items'), true);
        }, 3);
    }

    private function mapear(PedidoModelo $modelo, bool $conPago = false): Pedido
    {
        $items = $modelo->relationLoaded('items')
            ? $modelo->items->map(static fn ($item): DetallePedido => new DetallePedido(
                (int) $item->id, (int) $item->producto_id, $item->nombre_producto, (int) $item->cantidad,
                (string) $item->precio_unitario, (string) $item->subtotal,
                $item->tipo_configuracion, $item->nombre_diseno, (string) $item->costo_diseno,
                $item->indicaciones, $item->diseno_torta_id, $item->plantilla_diseno_id, $item->diseno_personalizado_id,
            ))->all()
            : [];
        $pago = null;
        if ($conPago) {
            $registro = DB::table('pagos')->where('pedido_id', $modelo->id)->orderByDesc('id')->first();
            if ($registro !== null) {
                $pago = ['id' => (int) $registro->id, 'metodo' => $registro->metodo, 'estado' => $registro->estado, 'monto' => (string) $registro->monto];
            }
        }

        return new Pedido(
            (int) $modelo->id, (int) $modelo->usuario_id, $modelo->fecha_entrega->format('Y-m-d'),
            $modelo->estado, (string) $modelo->subtotal, (string) $modelo->total,
            DateTimeImmutable::createFromInterface($modelo->creado_en), $items, $pago,
        );
    }

    private function error(string $mensaje, string $codigo): DominioException
    {
        return new DominioException($mensaje, $codigo, 400);
    }
}
