<?php

declare(strict_types=1);

namespace App\Infraestructura\Persistencia\Eloquent\Modelos;

use Database\Factories\PublicacionModeloFactory;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class PublicacionModelo extends Model
{
    /** @use HasFactory<PublicacionModeloFactory> */
    use HasFactory;

    protected $table = 'publicaciones';

    public const CREATED_AT = 'creado_en';

    public const UPDATED_AT = 'actualizado_en';

    protected $fillable = [
        'usuario_id',
        'categoria_id',
        'producto_id',
        'titulo',
        'descripcion',
        'activo',
    ];

    protected function casts(): array
    {
        return [
            'usuario_id' => 'integer',
            'categoria_id' => 'integer',
            'producto_id' => 'integer',
            'activo' => 'boolean',
            'creado_en' => 'datetime',
            'actualizado_en' => 'datetime',
        ];
    }

    public function autor(): BelongsTo
    {
        return $this->belongsTo(UsuarioModelo::class, 'usuario_id');
    }

    public function categoria(): BelongsTo
    {
        return $this->belongsTo(CategoriaModelo::class, 'categoria_id');
    }

    public function producto(): BelongsTo
    {
        return $this->belongsTo(ProductoModelo::class, 'producto_id');
    }

    public function multimedia(): BelongsToMany
    {
        return $this->belongsToMany(
            MultimediaModelo::class,
            'publicacion_multimedia',
            'publicacion_id',
            'multimedia_id',
        )->withPivot('orden');
    }

    protected static function newFactory(): Factory
    {
        return PublicacionModeloFactory::new();
    }
}
