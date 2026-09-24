<?php

declare(strict_types=1);

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class OAuthRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'proveedor' => ['required', 'in:GOOGLE'],
            'id_proveedor' => ['required', 'string', 'max:255'],
            'nombre_completo' => ['required', 'string', 'max:150'],
            'correo' => ['required', 'email', 'max:150'],
            'terminos_aceptados' => ['required', 'accepted'],
            'version_terminos' => ['required', 'string', 'max:20'],
        ];
    }

    public function messages(): array
    {
        return [
            'proveedor.in' => 'El proveedor OAuth permitido es solo GOOGLE.',
        ];
    }
}
