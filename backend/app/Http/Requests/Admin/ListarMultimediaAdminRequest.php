<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ListarMultimediaAdminRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'activo' => ['sometimes', 'boolean'],
            'destino' => ['sometimes', Rule::in(['productos', 'comprobantes', 'personalizaciones', 'tienda', 'categorias', 'publicaciones', 'disenos'])],
            'page' => ['sometimes', 'integer', 'min:1'],
        ];
    }
}
