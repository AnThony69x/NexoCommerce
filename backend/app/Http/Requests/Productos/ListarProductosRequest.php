<?php

declare(strict_types=1);

namespace App\Http\Requests\Productos;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class ListarProductosRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'categoria_id' => ['sometimes', 'integer', 'exists:categorias,id'],
            'tipo' => ['sometimes', Rule::in(['TORTA', 'DETALLE', 'SUBLIMACION'])],
            'buscar' => ['sometimes', 'string', 'max:150'],
            'precio_min' => ['sometimes', 'numeric', 'min:0'],
            'precio_max' => ['sometimes', 'numeric', 'min:0'],
            'porciones_min' => ['sometimes', 'integer', 'min:1'],
            'porciones_max' => ['sometimes', 'integer', 'min:1'],
            'sabor' => ['sometimes', 'string', 'max:100'],
            'ordenar' => ['sometimes', Rule::in(['precio_asc', 'precio_desc', 'recientes'])],
            'page' => ['sometimes', 'integer', 'min:1'],
        ];
    }

    public function after(): array
    {
        return [function (Validator $validator): void {
            if ($this->filled('precio_min') && $this->filled('precio_max')
                && (float) $this->input('precio_min') > (float) $this->input('precio_max')) {
                $validator->errors()->add('precio_max', 'El precio maximo debe ser mayor o igual al precio minimo.');
            }
            if ($this->filled('porciones_min') && $this->filled('porciones_max')
                && (int) $this->input('porciones_min') > (int) $this->input('porciones_max')) {
                $validator->errors()->add('porciones_max', 'Las porciones maximas deben ser mayores o iguales al minimo.');
            }
        }];
    }
}
