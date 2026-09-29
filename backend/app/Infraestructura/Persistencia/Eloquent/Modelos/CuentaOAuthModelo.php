<?php

declare(strict_types=1);

namespace App\Infraestructura\Persistencia\Eloquent\Modelos;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CuentaOAuthModelo extends Model
{
    protected $table = 'cuentas_oauth';

    protected $primaryKey = 'id';

    public $timestamps = true;

    const CREATED_AT = 'creado_en';

    const UPDATED_AT = 'actualizado_en';

    protected $fillable = [
        'usuario_id',
        'proveedor',
        'id_proveedor',
    ];

    protected function casts(): array
    {
        return [
            'creado_en' => 'datetime',
            'actualizado_en' => 'datetime',
        ];
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(UsuarioModelo::class, 'usuario_id');
    }
}
