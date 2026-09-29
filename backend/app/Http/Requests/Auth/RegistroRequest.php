<?php

declare(strict_types=1);

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class RegistroRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nombre_completo' => ['required', 'string', 'max:150'],
            'correo' => ['required', 'email', 'max:150', 'unique:usuarios,correo'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'telefono' => ['nullable', 'string', 'max:20'],
            'terminos_aceptados' => ['required', 'accepted'],
            'version_terminos' => ['required', 'string', 'max:20'],
        ];
    }

    public function messages(): array
    {
        return [
            'correo.unique' => 'El correo electronico ya esta registrado.',
            'terminos_aceptados.accepted' => 'Debe aceptar los terminos y condiciones.',
        ];
    }
}
