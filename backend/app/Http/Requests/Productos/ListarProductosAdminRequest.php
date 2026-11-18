<?php

declare(strict_types=1);

namespace App\Http\Requests\Productos;

use App\Http\Requests\ExisteEnTabla;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ListarProductosAdminRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'activo' => ['sometimes', 'boolean'],
            'categoria_id' => ['sometimes', 'integer', new ExisteEnTabla('catalogo.categorias', 'id')],
            'tipo' => ['sometimes', Rule::in(['TORTA', 'DETALLE', 'SUBLIMACION'])],
            'buscar' => ['sometimes', 'string', 'max:150'],
            'page' => ['sometimes', 'integer', 'min:1'],
        ];
    }
}
