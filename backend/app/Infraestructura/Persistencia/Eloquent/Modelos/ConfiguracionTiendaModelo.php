<?php

declare(strict_types=1);

namespace App\Infraestructura\Persistencia\Eloquent\Modelos;

use Database\Factories\ConfiguracionTiendaModeloFactory;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Modelo Eloquent para la tabla `configuracion_tienda`.
 */
class ConfiguracionTiendaModelo extends Model
{
    /** @use HasFactory<ConfiguracionTiendaModeloFactory> */
    use HasFactory;

    protected $table = 'configuracion_tienda';

    protected $primaryKey = 'id';

    public $incrementing = true;

    public $timestamps = true;

    const CREATED_AT = 'creado_en';

    const UPDATED_AT = 'actualizado_en';

    protected $fillable = [
        'nombre_tienda',
        'logo_url',
        'favicon_url',
        'color_primario',
        'color_secundario',
        'color_acento',
        'color_fondo',
        'color_texto',
        'telefono',
        'correo',
        'direccion',
        'activo',
    ];

    protected function casts(): array
    {
        return [
            'activo' => 'boolean',
            'creado_en' => 'datetime',
            'actualizado_en' => 'datetime',
        ];
    }

    protected static function newFactory(): Factory
    {
        return ConfiguracionTiendaModeloFactory::new();
    }
}
