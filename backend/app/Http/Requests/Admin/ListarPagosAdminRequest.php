<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use App\Http\Requests\ExisteEnTabla;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ListarPagosAdminRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'estado' => ['sometimes', Rule::in(['PENDIENTE', 'APROBADO', 'RECHAZADO'])],
            'metodo' => ['sometimes', Rule::in(['PASARELA', 'TRANSFERENCIA'])],
            'pedido_id' => ['sometimes', 'integer', new ExisteEnTabla('ventas.pedidos', 'id')],
            'page' => ['sometimes', 'integer', 'min:1'],
        ];
    }
}
