<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Dominio\Notificaciones\Entidades\Notificacion;
use DateTimeImmutable;
use DateTimeZone;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Notificacion */
class NotificacionResource extends JsonResource
{
    public function __construct(Notificacion $resource)
    {
        parent::__construct($resource);
    }

    public function toArray(Request $request): array
    {
        /** @var Notificacion $notificacion */
        $notificacion = $this->resource;

        return [
            'id' => $notificacion->id, 'usuario_id' => $notificacion->usuarioId,
            'pedido_id' => $notificacion->pedidoId, 'pago_id' => $notificacion->pagoId,
            'tipo' => $notificacion->tipo, 'titulo' => $notificacion->titulo,
            'mensaje' => $notificacion->mensaje, 'leida' => $notificacion->leida,
            'fecha_lectura' => self::fecha($notificacion->fechaLectura),
            'creado_en' => self::fecha($notificacion->creadoEn),
        ];
    }

    public static function fecha(?DateTimeImmutable $fecha): ?string
    {
        return $fecha?->setTimezone(new DateTimeZone('UTC'))->format('Y-m-d\TH:i:s.u\Z');
    }
}
