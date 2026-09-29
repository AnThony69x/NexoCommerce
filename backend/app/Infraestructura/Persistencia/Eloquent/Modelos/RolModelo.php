<?php

declare(strict_types=1);

namespace App\Infraestructura\Persistencia\Eloquent\Modelos;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RolModelo extends Model
{
    protected $table = 'roles';

    protected $primaryKey = 'id';

    public $timestamps = false;

    protected $fillable = ['nombre'];

    public function usuarios(): HasMany
    {
        return $this->hasMany(UsuarioModelo::class, 'rol_id');
    }
}
