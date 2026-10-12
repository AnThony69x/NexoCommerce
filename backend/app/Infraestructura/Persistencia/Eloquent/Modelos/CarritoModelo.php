<?php

declare(strict_types=1);

namespace App\Infraestructura\Persistencia\Eloquent\Modelos;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CarritoModelo extends Model
{
    protected $table = 'carritos';

    public const CREATED_AT = 'creado_en';

    public const UPDATED_AT = 'actualizado_en';

    protected $fillable = ['usuario_id', 'activo'];

    protected function casts(): array
    {
        return ['usuario_id' => 'integer', 'activo' => 'boolean'];
    }

    public function items(): HasMany
    {
        return $this->hasMany(DetalleCarritoModelo::class, 'carrito_id');
    }
}
