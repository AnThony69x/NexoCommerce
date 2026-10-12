<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Dominio\Productos\Entidades\DisenoPersonalizado;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin DisenoPersonalizado */
class DisenoPersonalizadoResource extends JsonResource
{
    public function __construct(DisenoPersonalizado $resource)
    {
        parent::__construct($resource);
    }

    public function toArray(Request $request): array
    {
        /** @var DisenoPersonalizado $diseno */
        $diseno = $this->resource;

        return [
            'id' => $diseno->id,
            'usuario_id' => $diseno->usuario_id,
            'sublimacion_id' => $diseno->sublimacion_id,
            'multimedia_id' => $diseno->multimedia_id,
            'indicaciones' => $diseno->indicaciones,
            'creado_en' => $diseno->creado_en->format('Y-m-d\TH:i:s\Z'),
        ];
    }
}
