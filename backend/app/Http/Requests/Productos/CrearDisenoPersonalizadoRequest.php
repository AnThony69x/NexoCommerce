<?php

declare(strict_types=1);

namespace App\Http\Requests\Productos;

use App\Http\Requests\ExisteEnTabla;
use Illuminate\Foundation\Http\FormRequest;

class CrearDisenoPersonalizadoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'sublimacion_id' => ['required', 'integer', new ExisteEnTabla('catalogo.sublimaciones', 'producto_id')],
            'multimedia_id' => ['required', 'integer', new ExisteEnTabla('media.multimedia', 'id')],
            'indicaciones' => ['nullable', 'string'],
        ];
    }
}
