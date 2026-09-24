<?php

declare(strict_types=1);

namespace App\Http\Requests\Productos;

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
            'sublimacion_id' => ['required', 'integer', 'exists:sublimaciones,producto_id'],
            'multimedia_id' => ['required', 'integer', 'exists:multimedia,id'],
            'indicaciones' => ['nullable', 'string'],
        ];
    }
}
