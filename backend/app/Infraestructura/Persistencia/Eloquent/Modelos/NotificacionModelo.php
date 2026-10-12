<?php

declare(strict_types=1);

namespace App\Infraestructura\Persistencia\Eloquent\Modelos;

use Illuminate\Database\Eloquent\Model;

class NotificacionModelo extends Model
{
    protected $table = 'notificaciones';

    public $timestamps = false;

    protected $fillable = ['usuario_id', 'pedido_id', 'pago_id', 'tipo', 'titulo', 'mensaje', 'leida', 'fecha_lectura'];

    protected function casts(): array
    {
        return [
            'usuario_id' => 'integer', 'pedido_id' => 'integer', 'pago_id' => 'integer',
            'leida' => 'boolean', 'fecha_lectura' => 'datetime', 'creado_en' => 'datetime',
        ];
    }
}
