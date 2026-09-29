<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Dominio\Productos\Entidades\DisenoTorta;
use App\Dominio\Productos\Entidades\PlantillaDiseno;

final class DisenoResource
{
    public static function desdeDisenoTorta(DisenoTorta $diseno): array
    {
        return [
            'id' => $diseno->id,
            'nombre' => $diseno->nombre,
            'descripcion' => $diseno->descripcion,
            'costo_adicional' => (float) $diseno->costo_adicional,
            'multimedia_id' => $diseno->multimedia_id,
            'activo' => $diseno->activo,
        ];
    }

    public static function desdePlantilla(PlantillaDiseno $plantilla): array
    {
        return [
            'id' => $plantilla->id,
            'nombre' => $plantilla->nombre,
            'descripcion' => $plantilla->descripcion,
            'costo_adicional' => (float) $plantilla->costo_adicional,
            'multimedia_id' => $plantilla->multimedia_id,
            'activo' => $plantilla->activo,
        ];
    }
}
