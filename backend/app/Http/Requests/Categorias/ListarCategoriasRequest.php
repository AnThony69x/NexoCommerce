<?php

declare(strict_types=1);

namespace App\Http\Requests\Categorias;

use Illuminate\Foundation\Http\FormRequest;

class ListarCategoriasRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'solo_activas' => ['sometimes', 'boolean'],
        ];
    }

    protected function prepareForValidation(): void
    {
        if (! $this->has('solo_activas')) {
            return;
        }

        $valor = filter_var(
            $this->query('solo_activas'),
            FILTER_VALIDATE_BOOLEAN,
            FILTER_NULL_ON_FAILURE,
        );

        if ($valor !== null) {
            $this->merge(['solo_activas' => $valor]);
        }
    }
}
