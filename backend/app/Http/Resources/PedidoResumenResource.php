<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Dominio\Pedidos\Entidades\Pedido;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Pedido */
class PedidoResumenResource extends JsonResource
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
            'id' => $pedido->id, 'usuario_id' => $pedido->usuario_id,
            'fecha_entrega' => $pedido->fecha_entrega, 'estado' => $pedido->estado,
            'subtotal' => (float) $pedido->subtotal, 'total' => (float) $pedido->total,
            'creado_en' => $pedido->creado_en->setTimezone(new \DateTimeZone('UTC'))->format('Y-m-d\TH:i:s.u\Z'),
        ];
    }
}
