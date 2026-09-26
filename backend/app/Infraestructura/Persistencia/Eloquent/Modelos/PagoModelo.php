<?php

declare(strict_types=1);

namespace App\Infraestructura\Persistencia\Eloquent\Modelos;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class PagoModelo extends Model
{
    protected $table = 'pagos';

    public const CREATED_AT = 'creado_en';

    public const UPDATED_AT = 'actualizado_en';

    protected $fillable = ['pedido_id', 'metodo', 'estado', 'monto', 'referencia_pasarela', 'fecha_pago'];

    protected function casts(): array
    {
        return [
            'pedido_id' => 'integer', 'monto' => 'decimal:2', 'fecha_pago' => 'datetime',
            'creado_en' => 'datetime', 'actualizado_en' => 'datetime',
        ];
    }

    public function pedido(): BelongsTo
    {
        return $this->belongsTo(PedidoModelo::class, 'pedido_id');
    }

    public function comprobante(): HasOne
    {
        return $this->hasOne(ComprobantePagoModelo::class, 'pago_id');
    }
}
