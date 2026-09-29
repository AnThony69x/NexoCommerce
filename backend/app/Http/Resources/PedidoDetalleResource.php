<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Dominio\Pedidos\Entidades\DetallePedido;
use App\Dominio\Pedidos\Entidades\Pedido;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Pedido */
class PedidoDetalleResource extends JsonResource
{
    public function __construct(Pedido $resource)
    {
        parent::__construct($resource);
    }

    public function toArray(Request $request): array
    {
        /** @var Pedido $pedido */
        $pedido = $this->resource;

        return [
            ...(new PedidoResumenResource($pedido))->toArray($request),
            'items' => array_map(static fn (DetallePedido $item): array => [
                'id' => $item->id, 'producto_id' => $item->producto_id,
                'nombre_producto' => $item->nombre_producto, 'cantidad' => $item->cantidad,
                'precio_unitario' => (float) $item->precio_unitario, 'subtotal' => (float) $item->subtotal,
                'tipo_configuracion' => $item->tipo_configuracion, 'nombre_diseno' => $item->nombre_diseno,
                'costo_diseno' => (float) $item->costo_diseno, 'indicaciones' => $item->indicaciones,
                'diseno_torta_id' => $item->diseno_torta_id, 'plantilla_diseno_id' => $item->plantilla_diseno_id,
                'diseno_personalizado_id' => $item->diseno_personalizado_id,
            ], $pedido->items),
            'pago' => $pedido->pago === null ? null : [
                ...$pedido->pago, 'monto' => (float) $pedido->pago['monto'],
            ],
        ];
    }
}
