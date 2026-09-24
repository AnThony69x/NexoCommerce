<?php

declare(strict_types=1);

namespace App\Infraestructura\Persistencia\Eloquent\Modelos;

use Database\Factories\SublimacionModeloFactory;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SublimacionModelo extends Model
{
    /** @use HasFactory<SublimacionModeloFactory> */
    use HasFactory;

    protected $table = 'sublimaciones';

    protected $primaryKey = 'producto_id';

    public $incrementing = false;

    public $timestamps = false;

    protected $fillable = ['producto_id', 'tipo_material'];

    protected function casts(): array
    {
        return ['producto_id' => 'integer'];
    }

    public function producto(): BelongsTo
    {
        return $this->belongsTo(ProductoModelo::class, 'producto_id');
    }

    public function plantillas(): HasMany
    {
        return $this->hasMany(PlantillaDisenoModelo::class, 'sublimacion_id');
    }

    protected static function newFactory(): Factory
    {
        return SublimacionModeloFactory::new();
    }
}
