<?php

declare(strict_types=1);

namespace App\Http\Requests\Usuarios;

use Illuminate\Foundation\Http\FormRequest;

class CambiarPasswordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'password_actual' => ['required', 'string'],
            'password_nueva' => ['required', 'string', 'min:8', 'confirmed', 'different:password_actual'],
        ];
    }

    public function messages(): array
    {
        return [
            'password_nueva.different' => 'La nueva contrasena debe ser diferente a la actual.',
        ];
    }
}
