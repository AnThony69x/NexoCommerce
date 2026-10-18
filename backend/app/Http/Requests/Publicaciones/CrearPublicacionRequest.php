<?php

declare(strict_types=1);

namespace App\Http\Requests\Publicaciones;

use App\Http\Requests\ExisteEnTabla;
use Illuminate\Foundation\Http\FormRequest;

class CrearPublicacionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'titulo' => ['required', 'string', 'max:150'],
            'descripcion' => ['nullable', 'string'],
            'categoria_id' => ['nullable', 'integer', new ExisteEnTabla('catalogo.categorias', 'id')],
            'producto_id' => ['nullable', 'integer', new ExisteEnTabla('catalogo.productos', 'id')],
            'activo' => ['sometimes', 'boolean'],
            'imagenes' => ['sometimes', 'array', 'max:8'],
            'imagenes.*.multimedia_id' => ['required', 'integer', 'distinct', new ExisteEnTabla('media.multimedia', 'id')],
            'imagenes.*.orden' => ['sometimes', 'integer', 'min:0', 'max:9'],
        ];
    }
}
