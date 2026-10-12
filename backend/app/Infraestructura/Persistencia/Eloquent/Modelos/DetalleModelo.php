<?php

declare(strict_types=1);

namespace App\Infraestructura\Persistencia\Eloquent\Modelos;

use Database\Factories\DetalleModeloFactory;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DetalleModelo extends Model
{
    /** @use HasFactory<DetalleModeloFactory> */
    use HasFactory;

    protected $table = 'detalles';

    protected $primaryKey = 'producto_id';

    public $incrementing = false;

    public $timestamps = false;

    protected $fillable = ['producto_id', 'stock'];

    protected function casts(): array
    {
        return ['producto_id' => 'integer', 'stock' => 'integer'];
    }

    public function producto(): BelongsTo
    {
        return $this->belongsTo(ProductoModelo::class, 'producto_id');
    }

    protected static function newFactory(): Factory
    {
        return DetalleModeloFactory::new();
    }
}
