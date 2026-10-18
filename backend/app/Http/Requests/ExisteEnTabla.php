<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Support\Facades\DB;

/**
 * La regla exists de Laravel interpreta el primer punto como conexión, por lo que no admite tablas con schema.
 */
class ExisteEnTabla implements ValidationRule
{
    public function __construct(private readonly string $tabla, private readonly string $columna = 'id') {}

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! DB::table($this->tabla)->where($this->columna, $value)->exists()) {
            $fail(__('validation.exists', ['attribute' => $attribute]));
        }
    }
}
