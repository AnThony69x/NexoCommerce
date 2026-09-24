<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Aplicacion\Categorias\DTOs\CategoriaArbolDTO;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin CategoriaArbolDTO */
class CategoriaArbolResource extends JsonResource
{
    public function __construct(CategoriaArbolDTO $resource)
    {
        parent::__construct($resource);
    }

    public function toArray(Request $request): array
    {
        /** @var CategoriaArbolDTO $nodo */
        $nodo = $this->resource;
        $categoria = $nodo->categoria;
        $imagen = null;

        if ($categoria->imagen !== null) {
            $baseUrl = rtrim((string) config('app.multimedia_public_base_url', ''), '/');
            $imagen = [
                'id' => $categoria->imagen->id,
                'ruta_archivo' => $categoria->imagen->ruta_archivo,
                'url' => $baseUrl !== ''
                    ? $baseUrl.'/'.$categoria->imagen->ruta_archivo
                    : null,
            ];
        }

        return [
            'id' => $categoria->id,
            'categoria_padre_id' => $categoria->categoria_padre_id,
            'nombre' => $categoria->nombre,
            'descripcion' => $categoria->descripcion,
            'imagen' => $imagen,
            'activo' => $categoria->activo,
            'subcategorias' => array_map(
                static fn (CategoriaArbolDTO $subcategoria): array => (new self($subcategoria))->toArray($request),
                $nodo->subcategorias,
            ),
        ];
    }
}
