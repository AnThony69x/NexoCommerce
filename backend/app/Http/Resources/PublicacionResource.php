<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Dominio\Publicaciones\Entidades\ImagenPublicacion;
use App\Dominio\Publicaciones\Entidades\Publicacion;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Publicacion */
class PublicacionResource extends JsonResource
{
    public function __construct(Publicacion $resource)
    {
        parent::__construct($resource);
    }

    public function toArray(Request $request): array
    {
        /** @var Publicacion $publicacion */
        $publicacion = $this->resource;

        return [
            'id' => $publicacion->id,
            'titulo' => $publicacion->titulo,
            'descripcion' => $publicacion->descripcion,
            'categoria_id' => $publicacion->categoria_id,
            'producto_id' => $publicacion->producto_id,
            'activo' => $publicacion->activo,
            'imagenes' => array_map(
                fn (ImagenPublicacion $imagen): array => $this->imagen($imagen),
                $publicacion->imagenes,
            ),
            'creado_en' => $publicacion->creado_en->format('Y-m-d\TH:i:s.u\Z'),
        ];
    }

    private function imagen(ImagenPublicacion $imagen): array
    {
        $baseUrl = rtrim((string) config('app.multimedia_public_base_url', ''), '/');

        return [
            'id' => $imagen->id,
            'ruta_archivo' => $imagen->ruta_archivo,
            'url' => $baseUrl !== '' ? $baseUrl.'/'.$imagen->ruta_archivo : null,
            'orden' => $imagen->orden,
        ];
    }
}
