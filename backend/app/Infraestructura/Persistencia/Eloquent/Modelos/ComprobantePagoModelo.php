<?php

declare(strict_types=1);

namespace App\Infraestructura\Persistencia\Eloquent\Modelos;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ComprobantePagoModelo extends Model
{
    protected $table = 'comprobantes_pago';

    public $timestamps = false;

    protected $fillable = ['pago_id', 'multimedia_id', 'revisado_por_id', 'fecha_revision', 'comentario_revision'];

    protected function casts(): array
    {
        return [
            'pago_id' => 'integer', 'multimedia_id' => 'integer', 'revisado_por_id' => 'integer',
            'fecha_revision' => 'datetime', 'creado_en' => 'datetime',
        ];
    }

    public function pago(): BelongsTo
    {
        return $this->belongsTo(PagoModelo::class, 'pago_id');
    }

    public function multimedia(): BelongsTo
    {
        return $this->belongsTo(MultimediaModelo::class, 'multimedia_id');
    }
}
