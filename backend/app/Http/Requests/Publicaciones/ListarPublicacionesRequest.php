<?php

declare(strict_types=1);

namespace App\Http\Requests\Publicaciones;

use Illuminate\Foundation\Http\FormRequest;

class ListarPublicacionesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'categoria_id' => ['sometimes', 'integer', 'exists:categorias,id'],
            'producto_id' => ['sometimes', 'integer', 'exists:productos,id'],
            'page' => ['sometimes', 'integer', 'min:1'],
        ];
    }
}
