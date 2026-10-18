<?php

declare(strict_types=1);

namespace App\Http\Requests\Tienda;

use App\Http\Requests\ExisteEnTabla;
use Illuminate\Foundation\Http\FormRequest;

class ActualizarConfiguracionTiendaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nombre_tienda' => ['required', 'string', 'max:150'],
            'logo_url' => ['nullable', 'string', 'max:500', new ExisteEnTabla('media.multimedia', 'ruta_archivo')],
            'favicon_url' => ['nullable', 'string', 'max:500', new ExisteEnTabla('media.multimedia', 'ruta_archivo')],
            'color_primario' => ['required', 'string', 'max:20'],
            'color_secundario' => ['required', 'string', 'max:20'],
            'color_acento' => ['nullable', 'string', 'max:20'],
            'color_fondo' => ['nullable', 'string', 'max:20'],
            'color_texto' => ['nullable', 'string', 'max:20'],
            'telefono' => ['nullable', 'string', 'max:20'],
            'correo' => ['nullable', 'email', 'max:150'],
            'direccion' => ['nullable', 'string', 'max:255'],
            'activo' => ['sometimes', 'boolean'],
        ];
    }
}
