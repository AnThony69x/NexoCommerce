<?php

declare(strict_types=1);

namespace App\Infraestructura\Persistencia\Eloquent\Modelos;

use Database\Factories\CategoriaModeloFactory;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Modelo Eloquent para la tabla `categorias`.
 */
class CategoriaModelo extends Model
{
    /** @use HasFactory<CategoriaModeloFactory> */
    use HasFactory;

    protected $table = 'categorias';

    protected $primaryKey = 'id';

    public $incrementing = true;

    public $timestamps = true;

    const CREATED_AT = 'creado_en';

    const UPDATED_AT = 'actualizado_en';

    protected $fillable = [
        'categoria_padre_id',
        'nombre',
        'descripcion',
        'imagen_id',
        'activo',
    ];

    protected function casts(): array
    {
        return [
            'categoria_padre_id' => 'integer',
            'imagen_id' => 'integer',
            'activo' => 'boolean',
            'creado_en' => 'datetime',
            'actualizado_en' => 'datetime',
        ];
    }

    public function padre(): BelongsTo
    {
        return $this->belongsTo(self::class, 'categoria_padre_id');
    }

    public function subcategorias(): HasMany
    {
        return $this->hasMany(self::class, 'categoria_padre_id');
    }

    public function imagen(): BelongsTo
    {
        return $this->belongsTo(MultimediaModelo::class, 'imagen_id');
    }

    protected static function newFactory(): Factory
    {
        return CategoriaModeloFactory::new();
    }
}
