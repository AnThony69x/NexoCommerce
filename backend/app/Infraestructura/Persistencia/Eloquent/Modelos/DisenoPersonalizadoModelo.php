<?php

declare(strict_types=1);

namespace App\Infraestructura\Persistencia\Eloquent\Modelos;

use Database\Factories\DisenoPersonalizadoModeloFactory;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DisenoPersonalizadoModelo extends Model
{
    /** @use HasFactory<DisenoPersonalizadoModeloFactory> */
    use HasFactory;

    protected $table = 'disenos_personalizados';

    public const CREATED_AT = 'creado_en';

    public const UPDATED_AT = 'actualizado_en';

    protected $fillable = ['usuario_id', 'sublimacion_id', 'multimedia_id', 'indicaciones'];

    protected function casts(): array
    {
        return [
            'usuario_id' => 'integer',
            'sublimacion_id' => 'integer',
            'multimedia_id' => 'integer',
            'creado_en' => 'datetime',
            'actualizado_en' => 'datetime',
        ];
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(UsuarioModelo::class, 'usuario_id');
    }

    public function sublimacion(): BelongsTo
    {
        return $this->belongsTo(SublimacionModelo::class, 'sublimacion_id');
    }

    public function multimedia(): BelongsTo
    {
        return $this->belongsTo(MultimediaModelo::class, 'multimedia_id');
    }

    protected static function newFactory(): Factory
    {
        return DisenoPersonalizadoModeloFactory::new();
    }
}
