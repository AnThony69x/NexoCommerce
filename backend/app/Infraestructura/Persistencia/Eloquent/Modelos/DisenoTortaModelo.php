<?php

declare(strict_types=1);

namespace App\Infraestructura\Persistencia\Eloquent\Modelos;

use Database\Factories\DisenoTortaModeloFactory;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DisenoTortaModelo extends Model
{
    /** @use HasFactory<DisenoTortaModeloFactory> */
    use HasFactory;

    protected $table = 'disenos_torta';

    public const CREATED_AT = 'creado_en';

    public const UPDATED_AT = 'actualizado_en';

    protected $fillable = ['torta_id', 'nombre', 'descripcion', 'costo_adicional', 'multimedia_id', 'activo'];

    protected function casts(): array
    {
        return [
            'torta_id' => 'integer',
            'multimedia_id' => 'integer',
            'costo_adicional' => 'decimal:2',
            'activo' => 'boolean',
            'creado_en' => 'datetime',
            'actualizado_en' => 'datetime',
        ];
    }

    public function torta(): BelongsTo
    {
        return $this->belongsTo(TortaModelo::class, 'torta_id');
    }

    public function multimedia(): BelongsTo
    {
        return $this->belongsTo(MultimediaModelo::class, 'multimedia_id');
    }

    protected static function newFactory(): Factory
    {
        return DisenoTortaModeloFactory::new();
    }
}
