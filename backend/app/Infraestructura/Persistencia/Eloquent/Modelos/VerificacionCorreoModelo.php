<?php

declare(strict_types=1);

namespace App\Infraestructura\Persistencia\Eloquent\Modelos;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VerificacionCorreoModelo extends Model
{
    protected $table = 'verificaciones_correo';

    protected $primaryKey = 'id';

    /** Solo tiene creado_en, sin actualizado_en. */
    public $timestamps = false;

    protected $fillable = [
        'usuario_id',
        'codigo',
        'expira_en',
        'usado_en',
    ];

    protected function casts(): array
    {
        return [
            'expira_en' => 'datetime',
            'usado_en' => 'datetime',
            'creado_en' => 'datetime',
        ];
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(UsuarioModelo::class, 'usuario_id');
    }
}
