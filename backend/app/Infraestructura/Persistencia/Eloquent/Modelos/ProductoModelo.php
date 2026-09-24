<?php

declare(strict_types=1);

namespace App\Infraestructura\Persistencia\Eloquent\Modelos;

use Database\Factories\ProductoModeloFactory;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class ProductoModelo extends Model
{
    /** @use HasFactory<ProductoModeloFactory> */
    use HasFactory;

    protected $table = 'productos';

    public const CREATED_AT = 'creado_en';

    public const UPDATED_AT = 'actualizado_en';

    protected $fillable = ['categoria_id', 'nombre', 'descripcion', 'precio_base', 'activo'];

    protected function casts(): array
    {
        return [
            'categoria_id' => 'integer',
            'precio_base' => 'decimal:2',
            'activo' => 'boolean',
            'creado_en' => 'datetime',
            'actualizado_en' => 'datetime',
        ];
    }

    public function categoria(): BelongsTo
    {
        return $this->belongsTo(CategoriaModelo::class, 'categoria_id');
    }

    public function torta(): HasOne
    {
        return $this->hasOne(TortaModelo::class, 'producto_id');
    }

    public function detalle(): HasOne
    {
        return $this->hasOne(DetalleModelo::class, 'producto_id');
    }

    public function sublimacion(): HasOne
    {
        return $this->hasOne(SublimacionModelo::class, 'producto_id');
    }

    public function multimedia(): BelongsToMany
    {
        return $this->belongsToMany(
            MultimediaModelo::class,
            'producto_multimedia',
            'producto_id',
            'multimedia_id',
        )->withPivot(['orden', 'es_principal']);
    }

    protected static function newFactory(): Factory
    {
        return ProductoModeloFactory::new();
    }
}
