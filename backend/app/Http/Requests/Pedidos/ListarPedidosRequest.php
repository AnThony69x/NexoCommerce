<?php

declare(strict_types=1);

namespace App\Http\Requests\Pedidos;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ListarPedidosRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'estado' => ['sometimes', Rule::in(['PENDIENTE', 'EN_PREPARACION', 'LISTO', 'ENTREGADO'])],
            'fecha_entrega' => ['sometimes', 'date_format:Y-m-d'],
            'usuario_id' => ['sometimes', 'integer', 'exists:usuarios,id'],
            'page' => ['sometimes', 'integer', 'min:1'],
        ];
    }
}
