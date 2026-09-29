<?php

declare(strict_types=1);

namespace App\Infraestructura\Persistencia\Eloquent\Modelos;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PedidoModelo extends Model
{
    protected $table = 'pedidos';

    public const CREATED_AT = 'creado_en';

    public const UPDATED_AT = 'actualizado_en';

    protected $fillable = ['usuario_id', 'fecha_entrega', 'estado', 'subtotal', 'total'];

    protected function casts(): array
    {
        return [
            'usuario_id' => 'integer', 'fecha_entrega' => 'date:Y-m-d',
            'subtotal' => 'decimal:2', 'total' => 'decimal:2',
            'creado_en' => 'datetime', 'actualizado_en' => 'datetime',
        ];
    }

    public function items(): HasMany
    {
        return $this->hasMany(DetallePedidoModelo::class, 'pedido_id');
    }
}
