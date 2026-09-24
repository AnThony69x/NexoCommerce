<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Dominio\Tienda\Entidades\ConfiguracionTienda;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Resource JSON con los campos definidos por la tabla y la spec de Tienda.
 *
 * @mixin ConfiguracionTienda
 */
class ConfiguracionTiendaResource extends JsonResource
{
    public function __construct(ConfiguracionTienda $resource)
    {
        parent::__construct($resource);
    }

    public function toArray(Request $request): array
    {
        /** @var ConfiguracionTienda $configuracion */
        $configuracion = $this->resource;

        return [
            'id' => $configuracion->id,
            'nombre_tienda' => $configuracion->nombre_tienda,
            'logo_url' => $configuracion->logo_url,
            'favicon_url' => $configuracion->favicon_url,
            'color_primario' => $configuracion->color_primario,
            'color_secundario' => $configuracion->color_secundario,
            'color_acento' => $configuracion->color_acento,
            'color_fondo' => $configuracion->color_fondo,
            'color_texto' => $configuracion->color_texto,
            'telefono' => $configuracion->telefono,
            'correo' => $configuracion->correo,
            'direccion' => $configuracion->direccion,
            'activo' => $configuracion->activo,
        ];
    }
}
