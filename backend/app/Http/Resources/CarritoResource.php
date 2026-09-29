<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Dominio\Carrito\Entidades\Carrito;
use App\Dominio\Carrito\Entidades\DetalleCarrito;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Carrito */
class CarritoResource extends JsonResource
{
    public function __construct(Carrito $resource)
    {
        parent::__construct($resource);
    }

    public function toArray(Request $request): array
    {
        /** @var Carrito $carrito */
        $carrito = $this->resource;

        return [
            'id' => $carrito->id,
            'usuario_id' => $carrito->usuario_id,
            'activo' => $carrito->activo,
            'items' => array_map(static fn (DetalleCarrito $item): array => [
                'id' => $item->id,
                'producto_id' => $item->producto_id,
                'nombre' => $item->nombre,
                'tipo' => $item->tipo,
                'imagen_principal_url' => $item->imagen_principal_url,
                'cantidad' => $item->cantidad,
                'precio_unitario' => (float) $item->precio_unitario,
                'comentario' => $item->comentario,
                'diseno_torta_id' => $item->diseno_torta_id,
                'plantilla_diseno_id' => $item->plantilla_diseno_id,
                'diseno_personalizado_id' => $item->diseno_personalizado_id,
                'configuracion' => $item->configuracion === null ? null : [
                    ...$item->configuracion,
                    'costo_adicional' => (float) $item->configuracion['costo_adicional'],
                ],
                'subtotal' => (float) $item->subtotal(),
                'precio_actualizado' => $item->precio_actualizado,
                'disponible' => $item->avisos === [],
                'avisos' => $item->avisos,
            ], $carrito->items),
            'subtotal' => (float) $carrito->total(),
            'total' => (float) $carrito->total(),
            'precios_actualizados' => $carrito->preciosActualizados(),
        ];
    }
}
