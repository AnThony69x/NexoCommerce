<?php

declare(strict_types=1);

namespace App\Http\Requests\Produccion;

use Illuminate\Foundation\Http\FormRequest;

class ActualizarConfiguracionProduccionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'fecha' => ['sometimes', 'date_format:Y-m-d'],
            'categoria_id' => ['sometimes', 'nullable', 'integer', 'exists:categorias,id'],
            'capacidad_maxima' => ['sometimes', 'integer', 'min:1'],
            'activo' => ['sometimes', 'boolean'],
        ];
    }
}
