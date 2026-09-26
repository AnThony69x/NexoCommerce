<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Dominio\Pagos\Entidades\Pago;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Pago */
class PagoResource extends JsonResource
{
    public function __construct(Pago $resource)
    {
        parent::__construct($resource);
    }

    public function toArray(Request $request): array
    {
        /** @var Pago $pago */
        $pago = $this->resource;

        return [
            'id' => $pago->id, 'pedido_id' => $pago->pedido_id,
            'metodo' => $pago->metodo, 'estado' => $pago->estado,
            'monto' => (float) $pago->monto, 'referencia_pasarela' => $pago->referencia_pasarela,
            'fecha_pago' => $pago->fecha_pago?->setTimezone(new \DateTimeZone('UTC'))->format('Y-m-d\TH:i:s.u\Z'),
            'pedido_estado' => $pago->pedido_estado,
            'comprobante' => $pago->comprobante === null ? null : [
                'id' => $pago->comprobante->id,
                'multimedia_id' => $pago->comprobante->multimedia_id,
                'revisado_por_id' => $pago->comprobante->revisado_por_id,
                'fecha_revision' => $pago->comprobante->fecha_revision?->setTimezone(new \DateTimeZone('UTC'))->format('Y-m-d\TH:i:s.u\Z'),
                'comentario_revision' => $pago->comprobante->comentario_revision,
            ],
        ];
    }
}
