<?php

declare(strict_types=1);

namespace App\Http\Requests\Pagos;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RegistrarPagoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'pedido_id' => ['required', 'integer', 'exists:pedidos,id'],
            'metodo' => ['required', Rule::in(['PASARELA', 'TRANSFERENCIA'])],
            'monto' => ['required', 'string', 'max:11', 'regex:/^(?:0|[1-9]\d{0,7})\.\d{2}$/'],
            'referencia_pasarela' => ['required_if:metodo,PASARELA', 'prohibited_unless:metodo,PASARELA', 'nullable', 'string', 'max:255'],
            'multimedia_id' => ['required_if:metodo,TRANSFERENCIA', 'prohibited_unless:metodo,TRANSFERENCIA', 'nullable', 'integer', 'exists:multimedia,id'],
        ];
    }
}
