<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Support\Facades\DB;

/**
 * La regla unique de Laravel interpreta el primer punto como conexión, por lo que no admite tablas con schema.
 */
class UnicoEnTabla implements ValidationRule
{
    public function __construct(
        private readonly string $tabla,
        private readonly string $columna,
        private readonly ?int $ignorarId = null,
        private readonly ?Closure $condicion = null,
        private readonly ?string $mensaje = null,
    ) {}

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $consulta = DB::table($this->tabla)->where($this->columna, $value);

        if ($this->ignorarId !== null) {
            $consulta->where('id', '!=', $this->ignorarId);
        }

        if ($this->condicion !== null) {
            ($this->condicion)($consulta);
        }

        if ($consulta->exists()) {
            $fail($this->mensaje ?? __('validation.unique', ['attribute' => $attribute]));
        }
    }
}
