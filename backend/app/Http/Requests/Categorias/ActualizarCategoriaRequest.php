<?php

declare(strict_types=1);

namespace App\Http\Requests\Categorias;

use App\Http\Requests\ExisteEnTabla;
use App\Http\Requests\UnicoEnTabla;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Database\Query\Builder;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\DB;

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
        $categoriaActual = DB::table('catalogo.categorias')
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
            'categoria_padre_id' => ['nullable', 'integer', new ExisteEnTabla('catalogo.categorias', 'id')],
            'nombre' => $reglasNombre,
            'descripcion' => ['nullable', 'string'],
            'imagen_id' => ['nullable', 'integer', new ExisteEnTabla('media.multimedia', 'id')],
            'activo' => ['sometimes', 'boolean'],
        ];
    }

    private function reglaNombreUnico(int $categoriaId, mixed $padreId): ValidationRule
    {
        return new UnicoEnTabla(
            'catalogo.categorias',
            'nombre',
            ignorarId: $categoriaId,
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
