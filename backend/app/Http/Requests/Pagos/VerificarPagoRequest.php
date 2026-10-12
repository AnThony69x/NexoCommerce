<?php

declare(strict_types=1);

namespace App\Http\Requests\Pagos;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class VerificarPagoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'estado' => ['required', Rule::in(['APROBADO', 'RECHAZADO'])],
            'comentario_revision' => ['nullable', 'string'],
        ];
    }
}
