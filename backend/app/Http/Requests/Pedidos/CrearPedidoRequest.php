<?php

declare(strict_types=1);

namespace App\Http\Requests\Pedidos;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CrearPedidoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'fecha_entrega' => ['required', 'date_format:Y-m-d', 'after_or_equal:today'],
            'total_esperado' => ['required', 'string', 'max:11', 'regex:/^(?:0|[1-9]\d{0,7})\.\d{2}$/'],
            'tipo_entrega' => ['sometimes', Rule::in(['RETIRO', 'DOMICILIO'])],
            'direccion_entrega' => ['required_if:tipo_entrega,DOMICILIO', 'nullable', 'string', 'max:255'],
            'telefono_contacto' => ['nullable', 'string', 'max:20'],
            'hora_entrega' => ['nullable', 'date_format:H:i'],
        ];
    }
}
