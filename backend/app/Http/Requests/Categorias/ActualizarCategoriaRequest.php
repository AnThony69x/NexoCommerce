<?php

declare(strict_types=1);

namespace App\Http\Requests\Categorias;

use Illuminate\Database\Query\Builder;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Unique;

class ActualizarCategoriaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $reglasNombre = ['required', 'string', 'max:100'];
        $categoriaId = (int) $this->route('id');
        $categoriaActual = DB::table('categorias')
            ->select('categoria_padre_id')
            ->where('id', $categoriaId)
            ->first();

        if ($categoriaActual !== null) {
            $reglasNombre[] = $this->reglaNombreUnico(
                $categoriaId,
                $this->has('categoria_padre_id')
                    ? $this->input('categoria_padre_id')
                    : $categoriaActual->categoria_padre_id,
            );
        }

        return [
            'categoria_padre_id' => ['nullable', 'integer', 'exists:categorias,id'],
            'nombre' => $reglasNombre,
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

    private function reglaNombreUnico(int $categoriaId, mixed $padreId): Unique
    {
        return Rule::unique('categorias', 'nombre')
            ->ignore($categoriaId)
            ->where(static function (Builder $query) use ($padreId): void {
                if ($padreId === null || $padreId === '') {
                    $query->whereNull('categoria_padre_id');

                    return;
                }

                $query->where('categoria_padre_id', (int) $padreId);
            });
    }
}
