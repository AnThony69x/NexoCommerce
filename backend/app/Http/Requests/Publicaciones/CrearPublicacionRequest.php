<?php

declare(strict_types=1);

namespace App\Http\Requests\Publicaciones;

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
            'categoria_id' => ['nullable', 'integer', 'exists:categorias,id'],
            'producto_id' => ['nullable', 'integer', 'exists:productos,id'],
            'activo' => ['sometimes', 'boolean'],
            'imagenes' => ['sometimes', 'array', 'max:8'],
            'imagenes.*.multimedia_id' => ['required', 'integer', 'distinct', 'exists:multimedia,id'],
            'imagenes.*.orden' => ['sometimes', 'integer', 'min:0'],
        ];
    }
}
