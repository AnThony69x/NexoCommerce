<?php

declare(strict_types=1);

namespace App\Infraestructura\Persistencia\Eloquent\Modelos;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DetallePedidoModelo extends Model
{
    protected $table = 'detalles_pedido';

    public $timestamps = false;

    protected $fillable = [
        'pedido_id', 'producto_id', 'nombre_producto', 'cantidad', 'precio_unitario', 'subtotal',
        'tipo_configuracion', 'nombre_diseno', 'costo_diseno', 'indicaciones',
        'diseno_torta_id', 'plantilla_diseno_id', 'diseno_personalizado_id',
    ];

    protected function casts(): array
    {
        return [
            'pedido_id' => 'integer', 'producto_id' => 'integer', 'cantidad' => 'integer',
            'precio_unitario' => 'decimal:2', 'subtotal' => 'decimal:2', 'costo_diseno' => 'decimal:2',
            'diseno_torta_id' => 'integer', 'plantilla_diseno_id' => 'integer', 'diseno_personalizado_id' => 'integer',
        ];
    }

    public function pedido(): BelongsTo
    {
        return $this->belongsTo(PedidoModelo::class, 'pedido_id');
    }
}
