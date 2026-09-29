<?php

declare(strict_types=1);

namespace App\Http\Requests\Productos;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class CrearProductoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'categoria_id' => ['required', 'integer', 'exists:categorias,id'],
            'nombre' => ['required', 'string', 'max:150'],
            'descripcion' => ['nullable', 'string'],
            'precio_base' => ['required', 'numeric', 'min:0'],
            'activo' => ['sometimes', 'boolean'],
            'tipo' => ['required', Rule::in(['TORTA', 'DETALLE', 'SUBLIMACION'])],
            'torta' => ['required_if:tipo,TORTA', 'array'],
            'torta.tamano' => ['required_if:tipo,TORTA', 'string', 'max:50'],
            'torta.porciones' => ['required_if:tipo,TORTA', 'integer', 'min:1'],
            'torta.sabor' => ['required_if:tipo,TORTA', 'string', 'max:100'],
            'detalle' => ['required_if:tipo,DETALLE', 'array'],
            'detalle.stock' => ['required_if:tipo,DETALLE', 'integer', 'min:0'],
            'sublimacion' => ['required_if:tipo,SUBLIMACION', 'array'],
            'sublimacion.tipo_material' => ['required_if:tipo,SUBLIMACION', 'string', 'max:100'],
            'imagenes' => ['sometimes', 'array'],
            'imagenes.*.multimedia_id' => ['required', 'integer', 'distinct', 'exists:multimedia,id'],
            'imagenes.*.orden' => ['sometimes', 'integer', 'min:0'],
            'imagenes.*.es_principal' => ['sometimes', 'boolean'],
        ];
    }

    public function after(): array
    {
        return [function (Validator $validator): void {
            $tipo = $this->input('tipo');
            foreach (['TORTA' => 'torta', 'DETALLE' => 'detalle', 'SUBLIMACION' => 'sublimacion'] as $esperado => $campo) {
                if ($tipo !== $esperado && $this->has($campo)) {
                    $validator->errors()->add($campo, "El objeto {$campo} no corresponde al tipo indicado.");
                }
            }

            $principales = collect($this->input('imagenes', []))
                ->filter(fn (mixed $imagen): bool => is_array($imagen)
                    && filter_var($imagen['es_principal'] ?? false, FILTER_VALIDATE_BOOLEAN))
                ->count();
            if ($principales > 1) {
                $validator->errors()->add('imagenes', 'Solo una imagen puede ser principal.');
            }
        }];
    }
}
