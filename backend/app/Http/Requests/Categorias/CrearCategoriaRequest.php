<?php

declare(strict_types=1);

namespace App\Http\Requests\Categorias;

use Illuminate\Database\Query\Builder;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Unique;

class CrearCategoriaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'categoria_padre_id' => ['nullable', 'integer', 'exists:categorias,id'],
            'nombre' => [
                'required',
                'string',
                'max:100',
                $this->reglaNombreUnico(),
            ],
            'descripcion' => ['nullable', 'string'],
            'imagen_id' => ['nullable', 'integer', 'exists:multimedia,id'],
            'activo' => ['sometimes', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'nombre.unique' => 'Ya existe una categoria con el mismo nombre dentro del padre indicado.',
        ];
    }

    private function reglaNombreUnico(): Unique
    {
        $padreId = $this->input('categoria_padre_id');

        return Rule::unique('categorias', 'nombre')
            ->where(static function (Builder $query) use ($padreId): void {
                if ($padreId === null || $padreId === '') {
                    $query->whereNull('categoria_padre_id');

                    return;
                }

                $query->where('categoria_padre_id', (int) $padreId);
            });
    }
}
