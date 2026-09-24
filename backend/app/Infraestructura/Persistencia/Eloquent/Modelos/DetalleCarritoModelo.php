<?php

declare(strict_types=1);

namespace App\Infraestructura\Persistencia\Eloquent\Modelos;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DetalleCarritoModelo extends Model
{
    protected $table = 'detalles_carrito';

    public const CREATED_AT = 'creado_en';

    public const UPDATED_AT = 'actualizado_en';

    protected $fillable = ['carrito_id', 'producto_id', 'cantidad', 'precio_unitario', 'comentario', 'diseno_torta_id', 'plantilla_diseno_id', 'diseno_personalizado_id'];

    protected function casts(): array
    {
        return [
            'carrito_id' => 'integer', 'producto_id' => 'integer', 'cantidad' => 'integer',
            'precio_unitario' => 'decimal:2', 'diseno_torta_id' => 'integer',
            'plantilla_diseno_id' => 'integer', 'diseno_personalizado_id' => 'integer',
        ];
    }

    public function producto(): BelongsTo
    {
        return $this->belongsTo(ProductoModelo::class, 'producto_id');
    }

    public function disenoTorta(): BelongsTo
    {
        return $this->belongsTo(DisenoTortaModelo::class, 'diseno_torta_id');
    }

    public function plantilla(): BelongsTo
    {
        return $this->belongsTo(PlantillaDisenoModelo::class, 'plantilla_diseno_id');
    }

    public function personalizado(): BelongsTo
    {
        return $this->belongsTo(DisenoPersonalizadoModelo::class, 'diseno_personalizado_id');
    }
}
