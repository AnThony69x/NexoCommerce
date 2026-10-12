<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Dominio\Productos\Entidades\ImagenProducto;
use App\Dominio\Productos\Entidades\Producto;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Producto */
class ProductoListadoResource extends JsonResource
{
    public function __construct(Producto $resource)
    {
        parent::__construct($resource);
    }

    public function toArray(Request $request): array
    {
        /** @var Producto $producto */
        $producto = $this->resource;
        $principal = collect($producto->imagenes)->first(
            static fn (ImagenProducto $imagen): bool => $imagen->es_principal,
        );

        return [
            'id' => $producto->id,
            'tipo' => $producto->tipo(),
            'nombre' => $producto->nombre,
            'descripcion' => $producto->descripcion,
            'precio_base' => (float) $producto->precio_base,
            'activo' => $producto->activo,
            'categoria' => [
                'id' => $producto->categoria_id,
                'nombre' => $producto->categoria_nombre,
            ],
            'imagen_principal' => $principal !== null ? $this->imagen($principal) : null,
            'torta' => $producto->torta !== null ? [
                'tamano' => $producto->torta->tamano,
                'porciones' => $producto->torta->porciones,
                'sabor' => $producto->torta->sabor,
            ] : null,
            'detalle' => $producto->detalle !== null ? ['stock' => $producto->detalle->stock] : null,
            'sublimacion' => $producto->sublimacion !== null ? [
                'tipo_material' => $producto->sublimacion->tipo_material,
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
            'es_principal' => true,
        ];
    }
}
