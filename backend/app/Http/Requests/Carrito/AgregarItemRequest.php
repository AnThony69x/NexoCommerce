<?php

declare(strict_types=1);

namespace App\Http\Requests\Carrito;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class AgregarItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'producto_id' => ['required', 'integer', 'exists:productos,id'],
            'cantidad' => ['required', 'integer', 'min:1'],
            'comentario' => ['nullable', 'string'],
            'diseno_torta_id' => ['nullable', 'integer', 'exists:disenos_torta,id'],
            'plantilla_diseno_id' => ['nullable', 'integer', 'exists:plantillas_diseno,id'],
            'diseno_personalizado_id' => ['nullable', 'integer', 'exists:disenos_personalizados,id'],
        ];
    }

    public function after(): array
    {
        return [function (Validator $validator): void {
            $seleccionados = count(array_filter([
                $this->input('diseno_torta_id'), $this->input('plantilla_diseno_id'),
                $this->input('diseno_personalizado_id'),
            ], static fn ($id): bool => $id !== null));
            if ($seleccionados > 1) {
                $validator->errors()->add('configuracion', 'Solo se admite una configuracion de diseño.');
            }
        }];
    }
}
