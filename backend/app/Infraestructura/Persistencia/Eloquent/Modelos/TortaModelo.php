<?php

declare(strict_types=1);

namespace App\Infraestructura\Persistencia\Eloquent\Modelos;

use Database\Factories\TortaModeloFactory;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TortaModelo extends Model
{
    /** @use HasFactory<TortaModeloFactory> */
    use HasFactory;

    protected $table = 'tortas';

    protected $primaryKey = 'producto_id';

    public $incrementing = false;

    public $timestamps = false;

    protected $fillable = ['producto_id', 'tamano', 'porciones', 'sabor'];

    protected function casts(): array
    {
        return ['producto_id' => 'integer', 'porciones' => 'integer'];
    }

    public function producto(): BelongsTo
    {
        return $this->belongsTo(ProductoModelo::class, 'producto_id');
    }

    public function disenos(): HasMany
    {
        return $this->hasMany(DisenoTortaModelo::class, 'torta_id');
    }

    protected static function newFactory(): Factory
    {
        return TortaModeloFactory::new();
    }
}
