<?php

declare(strict_types=1);

namespace App\Infraestructura\Persistencia\Eloquent\Modelos;

use Database\Factories\ConfiguracionProduccionModeloFactory;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ConfiguracionProduccionModelo extends Model
{
    /** @use HasFactory<ConfiguracionProduccionModeloFactory> */
    use HasFactory;

    protected $table = 'configuracion_produccion';

    public const CREATED_AT = 'creado_en';

    public const UPDATED_AT = 'actualizado_en';

    protected $fillable = ['fecha', 'categoria_id', 'capacidad_maxima', 'activo'];

    protected function casts(): array
    {
        return [
            'fecha' => 'date:Y-m-d',
            'categoria_id' => 'integer',
            'capacidad_maxima' => 'integer',
            'activo' => 'boolean',
            'creado_en' => 'datetime',
            'actualizado_en' => 'datetime',
        ];
    }

    public function categoria(): BelongsTo
    {
        return $this->belongsTo(CategoriaModelo::class, 'categoria_id');
    }

    protected static function newFactory(): Factory
    {
        return ConfiguracionProduccionModeloFactory::new();
    }
}
