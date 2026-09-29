<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Dominio\Productos\Entidades\DisenoTorta;
use App\Dominio\Productos\Entidades\ImagenProducto;
use App\Dominio\Productos\Entidades\PlantillaDiseno;
use App\Dominio\Productos\Entidades\Producto;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Producto */
class ProductoDetalleResource extends JsonResource
{
    public function __construct(Producto $resource)
    {
        parent::__construct($resource);
    }

    public function toArray(Request $request): array
    {
        /** @var Producto $producto */
        $producto = $this->resource;

        return [
            'id' => $producto->id,
            'tipo' => $producto->tipo(),
            'nombre' => $producto->nombre,
            'descripcion' => $producto->descripcion,
            'precio_base' => (float) $producto->precio_base,
            'activo' => $producto->activo,
            'categoria_id' => $producto->categoria_id,
            'imagenes' => array_map(fn (ImagenProducto $imagen): array => $this->imagen($imagen), $producto->imagenes),
            'torta' => $producto->torta !== null ? [
                'tamano' => $producto->torta->tamano,
                'porciones' => $producto->torta->porciones,
                'sabor' => $producto->torta->sabor,
                'disenos' => array_map(
                    static fn (DisenoTorta $diseno): array => DisenoResource::desdeDisenoTorta($diseno),
                    $producto->torta->disenos,
                ),
            ] : null,
            'detalle' => $producto->detalle !== null ? ['stock' => $producto->detalle->stock] : null,
            'sublimacion' => $producto->sublimacion !== null ? [
                'tipo_material' => $producto->sublimacion->tipo_material,
                'plantillas' => array_map(
                    static fn (PlantillaDiseno $plantilla): array => DisenoResource::desdePlantilla($plantilla),
                    $producto->sublimacion->plantillas,
                ),
            ] : null,
        ];
    }

    private function imagen(ImagenProducto $imagen): array
    {
        $baseUrl = rtrim((string) config('app.multimedia_public_base_url', ''), '/');

        return [
            'id' => $imagen->id,
            'ruta_archivo' => $imagen->ruta_archivo,
            'url' => $baseUrl !== '' ? $baseUrl.'/'.$imagen->ruta_archivo : null,
            'orden' => $imagen->orden,
            'es_principal' => $imagen->es_principal,
        ];
    }
}
