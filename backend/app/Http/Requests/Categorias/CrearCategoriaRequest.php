<?php

declare(strict_types=1);

namespace App\Http\Requests\Categorias;

use App\Http\Requests\ExisteEnTabla;
use App\Http\Requests\UnicoEnTabla;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Database\Query\Builder;
use Illuminate\Foundation\Http\FormRequest;

class CrearCategoriaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'categoria_padre_id' => ['nullable', 'integer', new ExisteEnTabla('catalogo.categorias', 'id')],
            'nombre' => [
                'required',
                'string',
                'max:100',
                $this->reglaNombreUnico(),
            ],
            'descripcion' => ['nullable', 'string'],
            'imagen_id' => ['nullable', 'integer', new ExisteEnTabla('media.multimedia', 'id')],
            'activo' => ['sometimes', 'boolean'],
        ];
    }

    private function reglaNombreUnico(): ValidationRule
    {
        $padreId = $this->input('categoria_padre_id');

        return new UnicoEnTabla(
            'catalogo.categorias',
            'nombre',
            condicion: static function (Builder $query) use ($padreId): void {
                if ($padreId === null || $padreId === '') {
                    $query->whereNull('categoria_padre_id');

                    return;
                }

                $query->where('categoria_padre_id', (int) $padreId);
            },
            mensaje: 'Ya existe una categoria con el mismo nombre dentro del padre indicado.',
        );
    }
}
