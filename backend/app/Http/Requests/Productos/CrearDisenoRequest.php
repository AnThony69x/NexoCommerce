<?php

declare(strict_types=1);

namespace App\Http\Requests\Productos;

use App\Http\Requests\ExisteEnTabla;
use Illuminate\Foundation\Http\FormRequest;

class CrearDisenoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nombre' => ['required', 'string', 'max:100'],
            'descripcion' => ['nullable', 'string'],
            'costo_adicional' => ['sometimes', 'numeric', 'min:0'],
            'multimedia_id' => ['required', 'integer', new ExisteEnTabla('media.multimedia', 'id')],
            'activo' => ['sometimes', 'boolean'],
        ];
    }
}
