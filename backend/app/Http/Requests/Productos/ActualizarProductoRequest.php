<?php

declare(strict_types=1);

namespace App\Http\Requests\Productos;

use App\Http\Requests\ExisteEnTabla;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class ActualizarProductoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'categoria_id' => ['sometimes', 'integer', new ExisteEnTabla('catalogo.categorias', 'id')],
            'nombre' => ['sometimes', 'string', 'max:150'],
            'descripcion' => ['sometimes', 'nullable', 'string'],
            'precio_base' => ['sometimes', 'numeric', 'min:0'],
            'activo' => ['sometimes', 'boolean'],
            'tipo' => ['sometimes', Rule::in(['TORTA', 'DETALLE', 'SUBLIMACION'])],
            'torta' => ['sometimes', 'array'],
            'torta.tamano' => ['sometimes', 'string', 'max:50'],
            'torta.porciones' => ['sometimes', 'integer', 'min:1'],
            'torta.sabor' => ['sometimes', 'string', 'max:100'],
            'detalle' => ['sometimes', 'array'],
            'detalle.stock' => ['sometimes', 'integer', 'min:0'],
            'sublimacion' => ['sometimes', 'array'],
            'sublimacion.tipo_material' => ['sometimes', 'string', 'max:100'],
            'imagenes' => ['sometimes', 'array'],
            'imagenes.*.multimedia_id' => ['required', 'integer', 'distinct', new ExisteEnTabla('media.multimedia', 'id')],
            'imagenes.*.orden' => ['sometimes', 'integer', 'min:0'],
            'imagenes.*.es_principal' => ['sometimes', 'boolean'],
        ];
    }

    public function after(): array
    {
        return [function (Validator $validator): void {
            $productoId = (int) $this->route('id');
            $tipoActual = match (true) {
                DB::table('catalogo.tortas')->where('producto_id', $productoId)->exists() => 'torta',
                DB::table('catalogo.detalles')->where('producto_id', $productoId)->exists() => 'detalle',
                DB::table('catalogo.sublimaciones')->where('producto_id', $productoId)->exists() => 'sublimacion',
                default => null,
            };

            foreach (['torta', 'detalle', 'sublimacion'] as $campo) {
                if ($campo !== $tipoActual && $this->has($campo)) {
                    $validator->errors()->add($campo, "El objeto {$campo} no corresponde al producto.");
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
