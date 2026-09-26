<?php

declare(strict_types=1);

namespace App\Http\Requests\Notificaciones;

use Illuminate\Foundation\Http\FormRequest;

class ListarNotificacionesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return ['leida' => ['sometimes', 'boolean'], 'page' => ['sometimes', 'integer', 'min:1']];
    }
}
