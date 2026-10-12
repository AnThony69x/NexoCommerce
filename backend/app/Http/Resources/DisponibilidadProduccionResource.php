<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Dominio\Produccion\Entidades\ConfiguracionProduccion;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin ConfiguracionProduccion */
class DisponibilidadProduccionResource extends JsonResource
{
    public function __construct(ConfiguracionProduccion $resource)
    {
        parent::__construct($resource);
    }

    public function toArray(Request $request): array
    {
        /** @var ConfiguracionProduccion $configuracion */
        $configuracion = $this->resource;

        return [
            'fecha' => $configuracion->fecha,
            'categoria_id' => $configuracion->categoria_id,
            'capacidad_maxima' => $configuracion->capacidad_maxima,
            'ocupado' => $configuracion->ocupado,
            'disponible' => $configuracion->disponible(),
        ];
    }
}
