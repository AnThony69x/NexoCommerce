<?php

declare(strict_types=1);

namespace App\Infraestructura\Persistencia\Eloquent\Modelos;

use Database\Factories\UsuarioModeloFactory;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

/**
 * Modelo Eloquent para la tabla `usuarios`.
 * Extiende Authenticatable para que Sanctum pueda emitir tokens.
 * NO es la entidad de dominio; es infraestructura pura.
 */
class UsuarioModelo extends Authenticatable
{
    /** @use HasFactory<UsuarioModeloFactory> */
    use HasApiTokens, HasFactory;

    protected $table = 'usuarios';

    protected $primaryKey = 'id';

    public $incrementing = true;

    public $timestamps = true;

    const CREATED_AT = 'creado_en';

    const UPDATED_AT = 'actualizado_en';

    protected $fillable = [
        'rol_id',
        'nombre_completo',
        'correo',
        'telefono',
        'password_hash',
        'correo_verificado',
        'intentos_fallidos',
        'bloqueado_hasta',
        'terminos_aceptados',
        'version_terminos',
        'terminos_aceptados_en',
        'activo',
    ];

    protected $hidden = ['password_hash'];

    /**
     * Devuelve el nombre de la columna que almacena la contrasena hasheada.
     * Sanctum y Hash::check() usaran este campo en lugar de `password`.
     */
    public function getAuthPasswordName(): string
    {
        return 'password_hash';
    }

    protected function casts(): array
    {
        return [
            'correo_verificado' => 'boolean',
            'terminos_aceptados' => 'boolean',
            'activo' => 'boolean',
            'intentos_fallidos' => 'integer',
            'bloqueado_hasta' => 'datetime',
            'terminos_aceptados_en' => 'datetime',
            'creado_en' => 'datetime',
            'actualizado_en' => 'datetime',
        ];
    }

    public function rol(): BelongsTo
    {
        return $this->belongsTo(RolModelo::class, 'rol_id');
    }

    public function cuentasOAuth(): HasMany
    {
        return $this->hasMany(CuentaOAuthModelo::class, 'usuario_id');
    }

    public function verificacionesCorreo(): HasMany
    {
        return $this->hasMany(VerificacionCorreoModelo::class, 'usuario_id');
    }

    /** @return Factory<UsuarioModelo> */
    protected static function newFactory(): Factory
    {
        return UsuarioModeloFactory::new();
    }
}
