<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Dominio\Categorias\Entidades\Categoria;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Categoria */
class CategoriaResource extends JsonResource
{
    public function __construct(Categoria $resource)
    {
        parent::__construct($resource);
    }

    public function toArray(Request $request): array
    {
        /** @var Categoria $categoria */
        $categoria = $this->resource;

        return [
            'id' => $categoria->id,
            'categoria_padre_id' => $categoria->categoria_padre_id,
            'nombre' => $categoria->nombre,
            'descripcion' => $categoria->descripcion,
            'imagen_id' => $categoria->imagen_id,
            'activo' => $categoria->activo,
        ];
    }
}
