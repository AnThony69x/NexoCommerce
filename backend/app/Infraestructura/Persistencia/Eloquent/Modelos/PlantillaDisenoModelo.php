<?php

declare(strict_types=1);

namespace App\Infraestructura\Persistencia\Eloquent\Modelos;

use Database\Factories\PlantillaDisenoModeloFactory;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PlantillaDisenoModelo extends Model
{
    /** @use HasFactory<PlantillaDisenoModeloFactory> */
    use HasFactory;

    protected $table = 'plantillas_diseno';

    public const CREATED_AT = 'creado_en';

    public const UPDATED_AT = 'actualizado_en';

    protected $fillable = ['sublimacion_id', 'nombre', 'descripcion', 'costo_adicional', 'multimedia_id', 'activo'];

    protected function casts(): array
    {
        return [
            'sublimacion_id' => 'integer',
            'multimedia_id' => 'integer',
            'costo_adicional' => 'decimal:2',
            'activo' => 'boolean',
            'creado_en' => 'datetime',
            'actualizado_en' => 'datetime',
        ];
    }

    public function sublimacion(): BelongsTo
    {
        return $this->belongsTo(SublimacionModelo::class, 'sublimacion_id');
    }

    public function multimedia(): BelongsTo
    {
        return $this->belongsTo(MultimediaModelo::class, 'multimedia_id');
    }

    protected static function newFactory(): Factory
    {
        return PlantillaDisenoModeloFactory::new();
    }
}
