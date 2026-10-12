<?php

declare(strict_types=1);

namespace App\Http\Requests\Productos;

class ActualizarDisenoRequest extends CrearDisenoRequest
{
    public function rules(): array
    {
        return [
            'nombre' => ['sometimes', 'string', 'max:100'],
            'descripcion' => ['sometimes', 'nullable', 'string'],
            'costo_adicional' => ['sometimes', 'numeric', 'min:0'],
            'multimedia_id' => ['sometimes', 'nullable', 'integer', 'exists:multimedia,id'],
            'activo' => ['sometimes', 'boolean'],
        ];
    }
}
