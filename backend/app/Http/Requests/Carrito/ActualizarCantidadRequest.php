<?php

declare(strict_types=1);

namespace App\Http\Requests\Carrito;

use Illuminate\Foundation\Http\FormRequest;

class ActualizarCantidadRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return ['cantidad' => ['required', 'integer', 'min:1']];
    }
}
