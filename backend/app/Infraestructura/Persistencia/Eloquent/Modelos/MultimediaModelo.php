<?php

declare(strict_types=1);

namespace App\Infraestructura\Persistencia\Eloquent\Modelos;

use Database\Factories\MultimediaModeloFactory;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Modelo Eloquent para la tabla `multimedia`.
 * Solo infraestructura — no es la entidad de dominio.
 */
class MultimediaModelo extends Model
{
    /** @use HasFactory<MultimediaModeloFactory> */
    use HasFactory;

    protected $table = 'multimedia';

    protected $primaryKey = 'id';

    public $incrementing = true;

    public $timestamps = true;

    const CREATED_AT = 'creado_en';

    const UPDATED_AT = 'actualizado_en';

    protected $fillable = [
        'nombre_archivo',
        'ruta_archivo',
        'tipo_mime',
        'tamano_bytes',
        'ancho',
        'alto',
        'activo',
        'subido_por_id',
    ];

    protected function casts(): array
    {
        return [
            'tamano_bytes' => 'integer',
            'ancho' => 'integer',
            'alto' => 'integer',
            'activo' => 'boolean',
            'subido_por_id' => 'integer',
            'creado_en' => 'datetime',
            'actualizado_en' => 'datetime',
        ];
    }

    /** Requerido porque el modelo esta en namespace no estandar. */
    protected static function newFactory(): Factory
    {
        return MultimediaModeloFactory::new();
    }
}
