<?php

declare(strict_types=1);

namespace App\Http\Requests\Produccion;

use App\Http\Requests\ExisteEnTabla;
use Illuminate\Foundation\Http\FormRequest;

class ConsultarDisponibilidadRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'fecha' => ['required', 'date_format:Y-m-d'],
            'categoria_id' => ['sometimes', 'integer', new ExisteEnTabla('catalogo.categorias', 'id')],
        ];
    }
}
