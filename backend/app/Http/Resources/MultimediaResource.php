<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Dominio\Multimedia\Entidades\Multimedia;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Transforma la entidad Multimedia al envelope JSON de la API.
 * La URL publica se construye con MULTIMEDIA_PUBLIC_BASE_URL + ruta_archivo.
 * ruta_archivo NO es una columna SQL calculada; se computa aqui.
 *
 * @mixin Multimedia
 */
class MultimediaResource extends JsonResource
{
    public function __construct(Multimedia $resource)
    {
        parent::__construct($resource);
    }

    public function toArray(Request $request): array
    {
        /** @var Multimedia $multimedia */
        $multimedia = $this->resource;
        $baseUrl = rtrim((string) config('app.multimedia_public_base_url', ''), '/');
        $urlPublica = $baseUrl !== '' ? $baseUrl.'/'.$multimedia->ruta_archivo : null;

        return [
            'id' => $multimedia->id,
            'nombre_archivo' => $multimedia->nombre_archivo,
            'ruta_archivo' => $multimedia->ruta_archivo,
            'tipo_mime' => $multimedia->tipo_mime,
            'tamano_bytes' => $multimedia->tamano_bytes,
            'ancho' => $multimedia->ancho,
            'alto' => $multimedia->alto,
            'activo' => $multimedia->activo,
            'subido_por_id' => $multimedia->subido_por_id,
            'creado_en' => $multimedia->creado_en->format('Y-m-d\TH:i:s\Z'),
            'url' => $urlPublica,
        ];
    }
}
